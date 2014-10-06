// This module is using techniques described in
// http://www.evanjones.ca/js-modules.html
// to achieve cross-environment (Node and browser).

// Import dependency
var _ = _ || require('../lodash/lodash');

var qiscus = (function(_) {
	'use strict';

	////////////////////////////////////////////////////////////////////////////

	var User = function(email, agent, promisesAdapter) {
		this.email = email;
		this.agent = agent;
		this.promisesAdapter = promisesAdapter;

		this.rooms = [];
	};

	User.prototype.getRoom = function(roomId) {
		return _.find(this.rooms, { 'id': roomId });
	}

	User.prototype.loadRooms = function() {
		var _this = this;

		// Create a promise. Note that this only used
		// as a "signal" instead of doing something
		// more meaningful.
		var deferred = this.promisesAdapter.deferred();
		
		this.agent.listRooms(
			function(rooms) {
				// Push every loaded Rooms onto this.rooms.
				_.each(rooms, function(room) {
					_this.rooms.push(room);
				});

				// After every Rooms has been pushed, let's
				// sort them.
				_this.sortRooms();

				deferred.resolve();
			},
			function(reason) {
				deferred.reject();
			}
		);

		return deferred.promise;
	};

	User.prototype.loadRoom = function(roomId) {
		var room = this.getRoom(roomId);

		var listTopicsPromise = this.promisesAdapter.deferred();
		this.agent.listTopics(roomId,
			function(topics) {
				_.each(topics, function(topic) {
					room.addTopic(topic);
				});

				listTopicsPromise.resolve();
			},
			function(reason) {
				// TODO
				listTopicsPromise.reject();
			}
		);

		var listParticipantsPromise = this.promisesAdapter.deferred();
		this.agent.listParticipants(roomId,
			function(participants) {
				_.each(participants, function(participant) {
					room.addParticipant(participant);
				});
				listParticipantsPromise.resolve();
			},
			function(reason) {
				listParticipantsPromise.reject();
			}
		);

		return this.promisesAdapter.all([
			listTopicsPromise.promise,
			listParticipantsPromise.promise
		]);
	};

	User.prototype.addRoom = function(room) {
		// Check if there any existing room
		// with the same ID. If it so, we ignore
		// the new Room.
		if (this.getRoom(room.id)) {
			return;
		}

		// Really add the new Room now, ..
		this.rooms.push(room);

		// .. and sort all the Room.
		this.sortRooms();
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
		this.agent.listComments(topicId, 100000, function(comments) {
			_.each(comments, function(comment) {
				// Before we add the Comment to the Topic, we need to replace
				// the email-based sender with corresponding Participant.
				comment.sender = room.getParticipant(comment.sender);

				// Then we can add the Comment to the Topic.
				topic.addComment(comment);
			});

			listCommentsPromise.resolve();
		}, function(reason) {
			listCommentsPromise.reject();
		});

		return listCommentsPromise.promise;
	};

	User.prototype.postComment = function(topicId, commentMessage) {
		var postCommentDeferred = this.promisesAdapter.deferred();

		this.agent.postComment(topicId, commentMessage, function() {
			postCommentDeferred.resolve();
		}, function(reason) {
			postCommentDeferred.reject(reason);
		});

		return postCommentDeferred.promise;
	};

	/*
	 * NOT a public API. 
	 */
	User.prototype.sortRooms = function() {
		this.rooms.sort(function(leftSideRoom, rightSideRoom) {
			return rightSideRoom.lastCommentId - leftSideRoom.lastCommentId;
		});
	}

	////////////////////////////////////////////////////////////////////////////

	var Room = function(id, name) {
		this.id = id;
		this.name = name;

		this.participants = [];
		this.topics = [];
		this.lastTopicId = 0;
		this.lastCommentId = 0;
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
		// TODO: slow
		var existingTopic = this.getTopic(topic.id);
		if (existingTopic) {
			return;
		}
		this.topics.push(topic);
	};

	Room.prototype.deleteTopic = function(topicId) {
		var topicToBeDeleted = this.getTopic(topicId);
		if (topicToBeDeleted) {
			_.pull(this.topics, topicToBeDeleted);
		}
	};

	/*
	 * NOT a public API.
	 */
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

	var Topic = function(id, title) {
		this.id = id;
		this.title = title;
		this.comments = [];
	}

	Topic.prototype.addComment = function(comment) {
		// We don't want duplicated Comment, so we check for it.
		var existingComment = _.find(this.comments, { 'id': comment.id });
		if (existingComment) {
			// Ignore duplicated Comment.
			return;
		}

		// Really insert the Comment to the Topic.
		this.comments.push(comment);
	};

	////////////////////////////////////////////////////////////////////////////

	var Comment = function(id, message, sender, date) {
		this.id = id;
		this.message = message;
		this.sender = sender;
		this.date = date;
	};

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
