// This module is using techniques described in
// http://www.evanjones.ca/js-modules.html
// to achieve cross-environment (Node and browser).

// Import dependency
var _ = _ || require('lodash');

var qiscus = (function(_) {
	'use strict';

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	// Public APIs
	// -----------

	var User = function(email, agent, promisesAdapter) {
		this.email = email;
		this.agent = agent;
		this.promisesAdapter = promisesAdapter;
		this.avatar = null;

		this.rooms = [];
		this.selected = { 'room': null, 'topic': null };
	};

	User.prototype.clearData = function() {
		// The implementation of clearing data is simply clear the content
		// of this.rooms because *all* of the core objects (rooms, topics,
		// and comments) are tied to it. However, we should be careful 
		// because we still need to keep the reference to that array. So,
		// `this.rooms = []` won't work.
		// According to http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
		// the most efficient way to clear an array while still keeping its
		// reference is to set its length to 0. So, that's what we're gonna
		// use.
		this.rooms.length = 0;

		// Reset all the selecteds.
		this.selected.room = null;
		this.selected.topic = null;
	}

	User.prototype.loadRooms = function(preloadCount) {
		var _this = this;

		// Create a promise. Note that this only used
		// as a "signal" instead of doing something
		// more meaningful.
		var deferred = this.promisesAdapter.deferred();
		
		this.agent.listRooms(
			function(rooms) {
				// Add each loaded Rooms onto this.rooms.
				_.each(rooms, function(room) {
					_this.addRoom(room);
				});

				// We're gonna preload Rooms if needed
				if (preloadCount) {
					_.each(_.first(_this.rooms, preloadCount), function(room) {
						_this.loadRoom(room.id);
					});
				}

				// Before we notify others, let's sort the Rooms first.
				_this.sortRooms();

				deferred.resolve();
			},
			function(reason) {
				deferred.reject();
			}
		);

		return deferred.promise;
	};

	User.prototype.selectRoom = function(roomId) {
		// TODO: Remove code duplication with loadRoom.

		var room = this.getRoom(roomId);
		
		// Only update selected Room and (most importantly) Topic
		// when the Room really changes.
		if (this.selected.room != room) {
			this.selected.room = room;

			if (this.selected.topic != null) {
				// We need to do few things for the current selected Topic's
				// before we lose our reference to it.

				// 1. Reset the first unread Comment.
				this.selected.topic.resetFirstUnreadComment();

				// 2. Mark the Topic as read.
				this.markTopicAsRead(this.selected.topic.id);
			}

			// Try to proactively select the last active Topic.
			// There are two possibilities for the selected Topic:
			// 1. The last active Topic already got loaded in
			//    memory. So, the right-hand side will return
			//    the Topic object.
			// 2. The last active Topic has not been loaded in
			//    memory, in which case, the right-hand side
			//    statement will result in null. Which, fortunately,
			//    is our intention.
			this.selected.topic = room.getTopic(room.lastTopicId);
		}

		return this.loadRoom(roomId);
	}


	User.prototype.selectTopic = function(topicId) {
		// TODO: Remove code duplication with loadTopic.

		var room = this.findRoomOfTopic(topicId);
		
		// There are two conditions that caused room to be null:
		// 1. There are no topicId with corresponding Room, or
		// 2. The list of Topics for every Room is not completely
		//    fetched yet.
		// In any case, if the room is null, we'll return empty
		// promise.
		if (room == null) {
			return this.promisesAdapter.when();
		}

		var topic = room.getTopic(topicId);

		if (this.selected.topic != null && this.selected.topic != topic) {
			// We need to do few things for the current selected Topic's
			// before we lose our reference to it.

			// 1. Reset the first unread Comment.
			this.selected.topic.resetFirstUnreadComment();

			// 2. Mark the Topic as read.
			this.markTopicAsRead(this.selected.topic.id);
		}

		// Update selected Topic.
		this.selected.topic = topic;

		return this.loadTopic(topicId);
	}

	User.prototype.markTopicAsRead = function(topicId) {
		// TODO: Remove code duplication with selectTopic.

		var room = this.findRoomOfTopic(topicId);
		
		// There are two conditions that caused room to be null:
		// 1. There are no topicId with corresponding Room, or
		// 2. The list of Topics for every Room is not completely
		//    fetched yet.
		// In any case, if the room is null, we'll return empty
		// promise.
		if (room == null) {
			return this.promisesAdapter.when();
		}

		var topic = room.getTopic(topicId);

		var markingTopicAsReadDeferred = this.promisesAdapter.deferred();

		this.agent.markTopicAsRead(topicId, function() {
			// Manually update Topic's unread state.
			topic.markAsRead();

			markingTopicAsReadDeferred.resolve();
		});

		return markingTopicAsReadDeferred.promise;
	}

	User.prototype.loadMoreComments = function(topicId, commentsToLoadCount) {
		// Define parameters
		var topicId             = topicId || this.selected.topic.id;
		var commentsToLoadCount = commentsToLoadCount || 0;

		// TODO: Remove code duplication with selectTopic.
		var room = this.findRoomOfTopic(topicId);
		
		// There are two conditions that caused room to be null:
		// 1. There are no topicId with corresponding Room, or
		// 2. The list of Topics for every Room is not completely
		//    fetched yet.
		// In any case, if the room is null, we'll return empty
		// promise.
		if (room == null) {
			return this.promisesAdapter.when();
		}
		
		var topic = room.getTopic(topicId);

		this.agent.listComments(topicId, this.selected.topic.comments[0].id, function(comments) {
			_.each(comments, function(comment) {
				// Before we add the Comment to the Topic, we need to replace
				// the email-based sender with corresponding Participant.
				comment.sender = room.getParticipant(comment.sender);

				// Then we can add the Comment to the Topic.
				topic.addComment(comment);
			});

			listCommentsDeferred.resolve();
		}, function(reason) {
			listCommentsDeferred.reject();
		});

		return listCommentsDeferred.promise;
	}

	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	// Private APIs
	// ------------
	// Make sure you know what you're doing.

	User.prototype.getRoom = function(roomId) {
		return _.find(this.rooms, { 'id': roomId });
	}

	User.prototype.addRoom = function(room) {
		// Check for existing Room, if any.
		var existing = this.getRoom(room.id);
		if (existing) {
			// If there is existing Room with the same
			// ID, update it.
			// TODO: Check and update for new Topics
			// and Participants.
		}
		else {
			// If we get through this point, it means that
			// this Room is a new Room. So we push it.
			this.rooms.push(room);
		}

		// Lastly, let's sort the Rooms.
		this.sortRooms();
	}

	User.prototype.loadRoom = function(roomId) {
		var _this = this;
		var room = this.getRoom(roomId);

		// Create deferred object that will be returned to the caller.
		var roomLoadingDeferred = this.promisesAdapter.deferred();
		// Set the flag.
		room.isBeingLoaded = true;

		var listTopicsPromise = this.promisesAdapter.deferred();
		this.agent.listTopics(roomId,
			function(topics) {
				_.each(topics, function(topic) {
					// Prevent unread comments on a Topic being updated when
					// the user currently selects it.
					if ((_this.selected.topic != null) && (topic.id == _this.selected.topic.id)) {
						topic.unreadCommentsCount = 0;
					}

					room.addTopic(topic);
				});

				listTopicsPromise.resolve();
			},
			function(reason) {
				listTopicsPromise.reject();
			}
		);

		var listParticipantsPromise = this.promisesAdapter.deferred();
		this.agent.listParticipants(roomId,
			function(participants) {
				_.each(participants, function(participant) {
					room.addParticipant(participant);
				});

				// TODO: Hackish
				// Load the current user's avatar for the first time using
				if (_this.avatar == null) {
					_this.avatar = room.getParticipant(_this.email).avatar;
				}

				listParticipantsPromise.resolve();
			},
			function(reason) {
				listParticipantsPromise.reject();
			}
		);

		// Wait for all promises to be resolved/rejected by wrapping
		// all the promises with Promises.all
		this.promisesAdapter.all([
			listTopicsPromise.promise,
			listParticipantsPromise.promise
		])
		.then(function() {
			// Mark the Room as done loaded.
			room.isBeingLoaded = false;

			// Sort all the Rooms.
			_this.sortRooms();

			// Notify whoever interested.
			roomLoadingDeferred.resolve();
		});

		return roomLoadingDeferred.promise;
	};

	User.prototype.deleteRoom = function(roomId) {
		var toBeRemoved = this.getRoom(roomId);
		if (toBeRemoved) {
			_.pull(this.rooms, toBeRemoved);
		}
	};

	User.prototype.findRoomOfTopic = function(topicId) {
		// TODO: This is expensive. We need to refactor
		// it using some kind map of topicId as the key
		// and roomId as its value.
		return _.find(this.rooms, function(room) {
			return _.find(room.topics, function(topic) {
				return topic.id == topicId;
			});
		})
	};

	User.prototype.loadTopic = function(topicId) {
		// TODO: Remove code duplication with selectTopic.
		var _this = this;
		var room = this.findRoomOfTopic(topicId);
		
		// There are two conditions that caused room to be null:
		// 1. There are no topicId with corresponding Room, or
		// 2. The list of Topics for every Room is not completely
		//    fetched yet.
		// In any case, if the room is null, we'll return empty
		// promise.
		if (room == null) {
			return this.promisesAdapter.when();
		}

		var topic = room.getTopic(topicId);
		
		var listCommentsPromise = this.promisesAdapter.deferred();

		// Set loading flag to be true.
		topic.isBeingLoaded = true;
		this.agent.listComments(topicId, 100000, function(comments) {
			_.each(comments, function(comment) {
				// Before we add the Comment to the Topic, we need to replace
				// the email-based sender with corresponding Participant.
				comment.sender = room.getParticipant(comment.sender);

				// Then we can add the Comment to the Topic.
				topic.addComment(comment);
			});

			// Now that the loading is done, set the flag to false.
			topic.isBeingLoaded = false;

			// Because now we have all valid Comments, let's clear
			// all the failed Comments.
			_.remove(topic.comments, function(comment) {
				return comment.isFailed;
			});

			// We also need to mark the first unread comment if needed.
			if (topic.unreadCommentsCount > 0 && topic.firstUnreadComment == null) {
				var firstUnreadCommentIndex = topic.comments.length - topic.unreadCommentsCount;
				var firstUnreadComment = topic.comments[firstUnreadCommentIndex];
				topic.firstUnreadComment = firstUnreadComment;
			}

			// Get last comment to properly set the last Topic ID
			// and last Comment ID.
			var lastComment = _.last(topic.comments);
			if (lastComment && lastComment.id > room.lastCommentId) {
				room.setLastTopicAndComment(topicId, lastComment.id);
			}

			_this.sortRooms();

			listCommentsPromise.resolve();
		}, function(reason) {
			topic.isBeingLoaded = false;
			listCommentsPromise.reject();
		});

		return listCommentsPromise.promise;
	};

	var _pendingCommentId = 0;

	User.prototype.postComment = function(topicId, commentMessage) {
		var room = this.findRoomOfTopic(topicId);
		var postCommentDeferred = this.promisesAdapter.deferred();

		_pendingCommentId--;
		var pendingCommentId = _pendingCommentId;
		var pendingCommentSender = room.getParticipant(this.email);
		var pendingCommentDate = new Date();
		var pendingComment = new qiscus.Comment(
			pendingCommentId,
			commentMessage,
			pendingCommentSender,
			pendingCommentDate);

		// We're gonna use timestamp for uniqueId for now.
		var uniqueId = "" + Date.now();

		pendingComment.attachUniqueId(uniqueId);
		pendingComment.markAsPending();

		this.receiveComment(topicId, pendingComment);
		this.agent.postComment(topicId, commentMessage, uniqueId, function() {
			// When the posting succeeded, we mark the Comment as sent,
			// so all the interested party can be notified.
			pendingComment.markAsSent();

			postCommentDeferred.resolve();
		}, function(reason) {
			pendingComment.markAsFailed();
			postCommentDeferred.reject(reason);
		});

		return postCommentDeferred.promise;
	};

	User.prototype.receiveComment = function(topicId, comment) {
		var room = this.findRoomOfTopic(topicId);
		var topic = room.getTopic(topicId);

		// Add the comment.
		topic.addComment(comment);

		// Update unread count if necessary.
		if (topic != this.selected.topic && comment.sender.email != this.email) {
			topic.increaseUnreadCommentsCount();
		}

		// If the topic is the currently selected Topic, then
		// we should reset the first unread Comment, because
		// it means that the user (most likely) already read
		// all the unread comments in the Topic.
		if (topic == this.selected.topic) {
			topic.resetFirstUnreadComment();
		}

		// Update last Topic ID and the last Comment ID of the Room if the Comment
		// is sent.
		if (comment.isSent) {
			room.setLastTopicAndComment(topicId, comment.id);
		}

		// Finally, let's make sure the Rooms stay sorted.
		this.sortRooms();
	};

	User.prototype.sortRooms = function() {
		this.rooms.sort(function(leftSideRoom, rightSideRoom) {
			return rightSideRoom.lastCommentId - leftSideRoom.lastCommentId;
		});
	}

	////////////////////////////////////////////////////////////////////////////

	var Room = function(id, name, cachedUnreadCommentsCount) {
		this.id = id;
		this.name = name;
		this.cachedUnreadCommentsCount = cachedUnreadCommentsCount;

		this.isBeingLoaded = false;
		this.participants = [];
		this.topics = [];
		this.lastTopicId = 0;
		this.lastCommentId = 0;
	}

	Room.prototype.countUnreadComments = function() {
		// In order to count the unread Comments for Rooms, we have
		// two options:
		if (this.topics.length == 0) {
			// 1. If the Room doesn't contain any Topics. Most likely
			//    what happened is that the Room not loaded yet. In
			//    this case, we'll just return the cached count.
			return this.cachedUnreadCommentsCount;
		}
		else {
			// 2. And if the Room contains at least one Topic, then
			//    we can properly count the unread Comments by adding
			//    all unread Comments in each Topics.
			return _.chain(this.topics)
				.map(function(topic) {
					return topic.unreadCommentsCount;
				})
				.reduce(function(currentCount, topicCount) {
					return currentCount + topicCount;
				}, 0)
				.value();
		}
	}

	Room.prototype.getParticipant = function(participantEmail) {
		var existingParticipant = _.find(this.participants, { 'email': participantEmail });
		if (existingParticipant) {
			return existingParticipant;
		}
		return null;
	};

	Room.prototype.addParticipant = function(participant) {
		var existingParticipant = this.getParticipant(participant.email)
		if (existingParticipant) {
			return;
		}
		this.participants.push(participant);
	}

	Room.prototype.getTopic = function(topicId) {
		var existingTopic = _.find(this.topics, { 'id': Number(topicId) });
		if (existingTopic) {
			return existingTopic;
		}
		return null;
	}

	Room.prototype.addTopic = function(topic) {
		var existingTopic = this.getTopic(topic.id);
		if (existingTopic) {
			// If there is an existing Topic with the same ID,
			// let's update it.
			existingTopic.id                  = topic.id;
			existingTopic.title               = topic.title;
			existingTopic.unreadCommentsCount = topic.unreadCommentsCount;
		}
		else {
			// If there is *not* any existing Topic, let's
			// push it.
			this.topics.push(topic);
		}
	};

	Room.prototype.deleteTopic = function(topicId) {
		var topicToBeDeleted = this.getTopic(topicId);
		if (topicToBeDeleted) {
			_.pull(this.topics, topicToBeDeleted);
		}
	};

	Room.prototype.setLastTopicAndComment = function(topicId, commentId) {
		this.lastTopicId = topicId;
		this.lastCommentId = commentId;
	};

	////////////////////////////////////////////////////////////////////////////

	var Participant = function(id, username, email, avatar) {
		this.id = id;
		this.username = username;
		this.email = email;
		this.avatar = avatar;
	}

	////////////////////////////////////////////////////////////////////////////

	var Topic = function(id, title, unreadCommentsCount) {
		this.id = id;
		this.title = title;
		this.unreadCommentsCount = unreadCommentsCount;

		this.isBeingLoaded = false;
		this.comments = [];
		this.firstUnreadComment = null;
	}

	Topic.prototype.getFirstCommentSince = function(date, timezoneOffset) {
		var dateWithZeroedTime = new Date(date);
		dateWithZeroedTime.setHours(date.getHours() - timezoneOffset);
		dateWithZeroedTime.setMinutes(0);
		dateWithZeroedTime.setSeconds(0);

		var result = _.find(this.comments, function(comment) {
			return comment.dateTime.getTime() >= dateWithZeroedTime.getTime();
		});

		return result;
	}

	Topic.prototype.addComment = function(comment) {
		// We don't want duplicated Comment, so we check for it.
		var existingComment = _.find(this.comments, { 'id': comment.id });
		if (existingComment) {
			// If we found it, let's check for its sending and failure
			// status. And if the found Comment currently has status of
			// not sent and is failed, let's update its status.
			if (!existingComment.isSent || existingComment.isFailed) {
				existingComment.isSent   = true;
				existingComment.isFailed = false;
			}

			// We're done. Let's roll out.
			return;
		}

		// Secondly, we need to check whether this is Comment
		// from current User by checking its uniqueId.
		if (comment.uniqueId != null && comment.uniqueId != "") {
			var existingComment = _.find(this.comments, {'uniqueId' : comment.uniqueId});
			// If we found it, update existing Comment based on
			// the newly-received Comment, and then return.
			if (existingComment) {
				existingComment.id       = comment.id;
				existingComment.dateTime = comment.dateTime;

				// Done.
				return;
			}
		}

		// Now, really insert the Comment to the Topic..
		this.comments.push(comment);

		// .. and then sort them.
		this.sortComments();
	};

	Topic.prototype.markAsRead = function() {
		this.unreadCommentsCount = 0;
	}

	Topic.prototype.resetFirstUnreadComment = function() {
		this.firstUnreadComment = null;
	}

	Topic.prototype.increaseUnreadCommentsCount = function() {
		// Before we increse the number of unread Comments,
		// we check whether we need to set first unread
		// Comment or not.
		if (this.unreadCommentsCount == 0) {
			this.firstUnreadComment = _.last(this.comments);
		}

		this.unreadCommentsCount++;
	}

	Topic.prototype.sortComments = function() {
		this.comments.sort(function(leftSideComment, rightSideComment) {
			var leftId = leftSideComment.id;
			var rightId = rightSideComment.id;
			var result;

			if (leftId < 0 && rightId > 0) {
				// If leftId has ID less than zero, then
				// that Comment is sent by the current user. So,
				// it should shown last.
				result = 1;
			}
			else if (rightId < 0 && leftId > 0) {
				// Ditto for rightId.
				result = -1;
			}
			else if (leftId < 0 && rightId < 0) {
				// If both Comment has ID less than zero, then the lesser
				// one should shown last.
				result = rightId - leftId;
			}
			else {
				result = leftId - rightId;
			}
			return result;
		});
	}

	////////////////////////////////////////////////////////////////////////////

	var Comment = function(id, message, sender, dateTime) {
		this.id       = id;
		this.message  = message;
		this.sender   = sender;
		this.dateTime = dateTime;

		this.isSent     = true;
		this.isFailed   = false;
		this.uniqueId   = null;
		this.attachment = null;
	};

	Comment.prototype.markAsPending = function() {
		this.isSent = false;
	}

	Comment.prototype.markAsSent = function() {
		this.isSent = true;
	}

	Comment.prototype.markAsFailed = function() {
		this.isFailed = true;
	}

	Comment.prototype.attachUniqueId = function(uniqueId) {
		this.uniqueId = uniqueId;
	}

	Comment.prototype.isAttachment = function() {
		// Check whether the message starts with "[file]"
		if (this.message.substring(0, "[file]".length) == "[file]") {
			return true;
		}
		return false;
	}

	Comment.prototype.isAttachmentImage = function() {
		// Check whether the message is an image attachment.
		if (this.isAttachment() && this.message.match(/\.(jpg|gif|png)/i) != null) {
			return true;
		}
		return false;
	}

	Comment.prototype.getAttachmentUri = function() {
		if (!this.isAttachment()) {
			return;
		}

		var messageLength = this.message.length;
		var beginIndex    = "[file] ".length - 1;
		var endIndex      = messageLength - " [/file]".length;
		return this.message.substring(beginIndex, endIndex);
	}

	Comment.prototype.setAttachment = function(attachment) {
		this.attachment = attachment;
	}

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	return {
		User: User,
		Room: Room,
		Participant: Participant,
		Topic: Topic,
		Comment: Comment
	};

})(_);

// If `module.exports` is defined, we're gonna use it.
if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscus;
}
