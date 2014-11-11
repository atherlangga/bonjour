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
		this.email           = email;
		this.agent           = agent;
		this.promisesAdapter = promisesAdapter;
		this.avatar          = null;

		this.rooms    = [];
		this.selected = { 'room': null, 'topic': null };
	};

	User.prototype.clearData = function() {
		// The purpose of clearing data is to reset the state of this module.
		// Given that state is often "invisible", resetting state of a module
		// without affecting the other modules often really hard to achieve.
		//
		// Luckily, for this module, the object graphs is pretty simple. All
		// the root objects is contained in only single instance: User. That
		// way, in order to implement reset, all we have to do is reset the
		// state of the User.
		//
		// There are two variables that hold the state for User:
		// 1. The rooms object.
		//    Holding all the existing Rooms for the User, `this.rooms` can be
		//    considered the most important variable that holds the state of
		//    this module. This is because all the core objects (Rooms, Topics,
		//    and Comments) has `this.rooms` as its root object in its graph.
		//    So, we need to do is clear its content.
		//
		//    However, we should be careful because we still need to keep the
		//    reference to the array that backs `this.rooms`. That's why simply
		//    execute `this.rooms = []` are not an option.
		//
		//    According to http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
		//    the most efficient way to clear an array while still keeping its
		//    reference is to set its length to 0. So, that's what we're gonna
		//    use.
		this.rooms.length = 0;

		// 2. The selected object.
		//    As it name implies, the selected object contains all objects that
		//    has been selected by the User. Resetting its content is also quite
		//    simple, just set them all to `null`.
		//
		//    There's just one caveat, though. We can't set the "parent" object
		//    (i.e. the `this.selected` object) to null, because doing so will
		//    remove the reference over the previous object. So, what we're
		//    going to do here is set all children object to `null` one by one.
		this.selected.room  = null;
		this.selected.topic = null;
	}

	User.prototype.loadRooms = function() {
		var _this = this;

		// Create a promise. Note that this only used as a "signal" instead
		// of doing something more meaningful.
		var deferred = this.promisesAdapter.deferred();
		
		// Now, let's get down to business. We're gonna ask for help to the
		// agent to:
		// 1. Load the list of the Rooms for us, and
		// 2. Fetch each Room's unread count.
		//
		// We also need to supply the agent with callbacks. Two callbacks for
		// the task (1), and one callback for the task (2).
		this.agent.listRooms(
			function(rooms) {
				// Add each loaded Rooms onto this.rooms.
				_.each(rooms, function(room) {
					_this.addRoom(room);
				});

				// Before we notify others, let's sort the Rooms first.
				_this.sortRooms();

				deferred.resolve();
			},
			function(reason) {
				deferred.reject();
			},
			function() {
				// Get all Rooms that contains unread comments.
				var unreadRooms = _.filter(_this.rooms, function(room) {
					return room.countUnreadComments() > 0;
				});

				// For each Rooms that contains unread Comments, we ..
				_.each(unreadRooms, function(unreadRoom) {
					// .. load them all. Then ..
					_this.loadRoom(unreadRoom.id)
					.then(function() {
						// .. find all the Topics inside the Room that
						// contains unread Comments, and ..
						var unreadTopics = _.filter(unreadRoom.topics,
							function(topic) {
								return topic.unreadCommentsCount > 0;
							});

						// .. finally, for each those topics, we load
						// its content.
						_.each(unreadTopics, function(unreadTopic) {
							_this.loadTopic(unreadTopic.id);
						})
					});
				});
			}
		);

		return deferred.promise;
	};

	User.prototype.selectRoom = function(roomId) {
		var _this = this;
		var room  = this.getRoom(roomId);
		
		// Only update selected Room and (most importantly) Topic
		// when the Room really changes.
		if (this.selected.room != room) {
			this.selected.room = room;

			if (this.selected.topic != null) {
				// We need to do few things for the current selected
				// Topic's before we lose our reference to it.

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

		// The "core" logic of selectRoom is to load the selected
		// Room. So, let's do that.
		return this.loadRoom(roomId)
		.then(function() {
			// After the Room is loaded, the next step is to select
			// the proper Topic inside the loaded Room.

			// First step, let's prepare the variable. Please note
			// that when we call selectTopic below, nextTopicId
			// *cannot* be null.
			var nextTopicId = null;

			// If user already select a Topic before, let's just
			// re-select it.
			if (_this.selected.topic != null) {
				nextTopicId = _this.selected.topic.id;
			}

			// If user didn't have a selection before, let's
			// pick it for him/her.
			if (nextTopicId == null) {
				nextTopicId = _this.selected.room.lastTopicId;
			}

			// Now that we already determine the topic to select,
			// let's select it.
			return _this.selectTopic(nextTopicId);
		});
	}


	User.prototype.selectTopic = function(topicId) {
		// TODO: Remove code duplication with loadTopic.
		
		var _this = this;
		var room  = this.findRoomOfTopic(topicId);
		
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

		// Now, let's do the "core" operation. That is, to load the selected
		// Topic.
		return this.loadTopic(topicId)
		.then(function() {
			// We need to mark the selected Topic as Read as soon as it's
			// selected.
			return _this.markTopicAsRead(topicId);
		});
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
		
		var topic                 = room.getTopic(topicId);
		var listCommentsDeferred  = this.promisesAdapter.deferred();

		this.agent.listComments(topicId, this.selected.topic.comments[0].id,
			function(comments) {
				_.each(comments, function(comment) {
					// Before we add the Comment to the Topic, we need to
					// replace the email-based sender with corresponding
					// Participant.
					comment.sender = room.getParticipant(comment.sender);

					// Then we can add the Comment to the Topic.
					topic.addComment(comment);
				});

				listCommentsDeferred.resolve();
			},
			function(reason) {
				listCommentsDeferred.reject();
			});

		return listCommentsDeferred.promise;
	}	

	// ID generator for user self-comment.
	//
	// For now, in order to mark all the pending Comment, they will have ID
	// less than one.
	//
	// It should be noted that it's very important to keep this distinction
	// internally (e.g. never *ever* let the UI layer knows about this fact)
	// because we need the flexibility to change the implementation.
	var _pendingCommentId = 0;

	User.prototype.postComment = function(topicId, commentMessage) {
		var room                = this.findRoomOfTopic(topicId);
		var postCommentDeferred = this.promisesAdapter.deferred();

		_pendingCommentId--;
		var pendingCommentId     = _pendingCommentId;
		var pendingCommentSender = room.getParticipant(this.email);
		var pendingCommentDate   = new Date();
		var pendingComment       = new qiscus.Comment(
			pendingCommentId, commentMessage,
			pendingCommentSender, pendingCommentDate
		);

		// We're gonna use timestamp for uniqueId for now.
		// "bq" stands for "Bonjour Qiscus" by the way.
		var uniqueId = "bq" + Date.now();

		pendingComment.attachUniqueId(uniqueId);
		pendingComment.markAsPending();

		this.receiveComment(topicId, pendingComment);
		this.agent.postComment(topicId, commentMessage, uniqueId,
			function() {
				// When the posting succeeded, we mark the Comment as sent,
				// so all the interested party can be notified.
				pendingComment.markAsSent();

				postCommentDeferred.resolve();
			},
			function(reason) {
				pendingComment.markAsFailed();
				postCommentDeferred.reject(reason);
			}
		);

		return postCommentDeferred.promise;
	};

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
			existing.name          = room.name;
			existing.lastTopicId   = room.lastTopicId;
			existing.lastCommentId = room.lastCommentId;
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

		if (!room) {
			return this.promisesAdapter.when();
		}

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
					if ((_this.selected.topic != null) &&
						(topic.id == _this.selected.topic.id)) {
						topic.unreadCommentsCount = 0;
					}

					room.addTopic(topic);
				});

				room.sortTopics();

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
					var me = room.getParticipant(_this.email);
					if (me) {
						_this.avatar = room.getParticipant(_this.email).avatar;
					}
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
		var room  = this.findRoomOfTopic(topicId);
		
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
			if (
				topic.unreadCommentsCount > 0 && 
				topic.firstUnreadComment == null
				) {
				// We find its index first by doing some basic counting.
				var firstUnreadCommentIndex = 
					topic.comments.length - topic.unreadCommentsCount;

				// Then, we get its instance.
				var firstUnreadComment = topic.comments[firstUnreadCommentIndex];

				// Finally, assign it.
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

	User.prototype.receiveComment = function(topicId, comment) {
		var room = this.findRoomOfTopic(topicId);
		var topic = room.getTopic(topicId);

		// Download comment's blob if the comment has an image attachment.
		if (
			comment.isSent &&
			comment.isAttachment() &&
			comment.isAttachmentImage()
			) {
			this.agent.downloadBlob(comment.getAttachmentUri(), function(blob) {
				comment.setAttachment(blob);
			});
		}

		// Add the comment.
		topic.addComment(comment);

		// Update unread count if necessary. That is, if these two
		// conditions are met:
		// 1. The Comment doesn't belong to the currently selected
		//    Topic. Because it doesn't makes sense to have unread
		//    Comments when the User is currently watching the
		//    Topic, does it?
		// 2. The Comment owner is not the current User. Because
		//    it doesn't make for the User to not read what he/she
		//    wrote.
		if (
			topic != this.selected.topic &&
			comment.sender.email != this.email
			) {
			topic.increaseUnreadCommentsCount();
		}

		// If the topic is the currently selected Topic, then
		// we should reset the first unread Comment, because
		// it means that the user (most likely) already read
		// all the unread comments in the Topic.
		if (topic == this.selected.topic) {
			topic.resetFirstUnreadComment();
		}

		// Update last Topic ID and the last Comment ID of the Room if the
		// Comment is sent.
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
		this.id   = id;
		this.name = name;
		
		this.cachedUnreadCommentsCount = cachedUnreadCommentsCount;

		this.isBeingLoaded = false;
		this.participants  = [];
		this.topics        = [];
		this.lastTopicId   = 0;
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
		var existingParticipant = _.find(this.participants,
			{ 'email': participantEmail });
		
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

	Room.prototype.sortTopics = function() {
		this.topics.sort(function(leftSideTopic, rightSideTopic) {
			// Topic is sorted based on its ID. The lesser the ID, the upper
			// it is.
			return leftSideTopic.id - rightSideTopic.id;
		});
	}

	////////////////////////////////////////////////////////////////////////////

	var Participant = function(username, email, avatar) {
		this.username = username;
		this.email = email;
		this.avatar = avatar;
	}

	////////////////////////////////////////////////////////////////////////////

	var Topic = function(id, title, unreadCommentsCount) {
		this.id    = id;
		this.title = title;
		
		this.unreadCommentsCount = unreadCommentsCount;

		this.isBeingLoaded      = false;
		this.comments           = [];
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
			var existingComment = _.find(this.comments,
				{'uniqueId' : comment.uniqueId});
			
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

	Topic.prototype.deleteComment = function(commentId) {
		var commentToBeDeleted = _.find(this.comments, { 'id': commentId });
		if (commentToBeDeleted) {
			_.pull(this.comments, commentToBeDeleted);
		}
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
			// If the unread Comments count is zero, that means
			// whichever last Comment kept in this Topic is the
			// first unread Comment for the user. So, let's set
			// it so.
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
				// If leftId has ID less than zero, then that
				// Comment is sent by the current user. So,
				// it should shown last.
				result = 1;
			}
			else if (rightId < 0 && leftId > 0) {
				// Ditto for rightId.
				result = -1;
			}
			else if (leftId < 0 && rightId < 0) {
				// If both Comment has ID less than zero, that
				// means both comes from the current user. In
				// that case, the lesser one should shown last.
				result = rightId - leftId;
			}
			else {
				// For typical scenario, the bigger an ID, the
				// last it is shown.
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
		if (
			this.isAttachment() &&
			this.message.match(/\.(jpg|gif|png)/i) != null
			) {
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
