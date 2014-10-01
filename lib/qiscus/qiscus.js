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
	
	var _roomIsLoaded = false;

	User.prototype.getRoom = function(roomId) {
		return _.find(this.rooms, { 'id': roomId });
	}

	User.prototype.loadRooms = function() {
		// Prevent reload.
		if (_roomIsLoaded) {
			return;
		}

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

				// Mark that the User's Rooms has been loaded.
				_roomIsLoaded = true;

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

		// TODO
		/*
		var listParticipantsPromise = this.promisesAdapter.deferred();
		this.agent.listParticipants(
			function(participants) {
				_.each(participants, function(participant) {
					room.addParticipant(participant);
				});
				listParticipantsPromise.fulfill();
			},
			function(reason) {
				listParticipantsPromise.reject();
			}
		);
		*/

		return this.promisesAdapter.all([
			listTopicsPromise.promise,
			// listParticipantsPromise.promise
		]);
	};

	User.prototype.addRoom = function(room) {
		// Check if there any existing room
		// with the same ID. If it so, we ignore
		// the new Room.
		if (this.getRoom(room.id)) {
			return;
		}
		this.rooms.push(room);
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
		var topic = room.getTopic(topicId);
		var listCommentsPromise = this.promisesAdapter.deferred();
		this.agent.listComments(topicId, 100000, function(comments) {
			_.each(comments, function(comment) {
				topic.addComment(comment);
			});

			listCommentsPromise.resolve();
		}, function(reason) {
			listCommentsPromise.reject();
		});

		return listCommentsPromise.promise;
	}

	////////////////////////////////////////////////////////////////////////////

	var Room = function(id, name) {
		this.id = id;
		this.name = name;

		this.topics = [];
		this.lastActiveTopicId = 0;
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
		if (existingTopic)
			return;
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
	Room.prototype.setLastActiveTopicId = function(topicId) {
		this.lastActiveTopicId = topicId;
	};

	Object.defineProperty(Room.prototype, "lastActiveTopic", {
		get: function() {
			if (this.lastActiveTopicId != 0) {
				return this.getTopic(this.lastActiveTopicId);
			}
			return null;
		},
		set: function(value) {

		}
	});

	////////////////////////////////////////////////////////////////////////////

	var Topic = function(id, title) {
		this.id = id;
		this.title = title;
		this.comments = [];
	}

	Topic.prototype.addComment = function(comment) {
		this.comments.push(comment);
	};

	////////////////////////////////////////////////////////////////////////////

	var Comment = function(id, message, sender, senderEmail) {
		this.id = id;
		this.message = message;
		this.sender = sender;
		this.senderEmail = senderEmail;
	};

	return {
		User: User,
		Room: Room,
		Topic: Topic,
		Comment: Comment
	};

})(_);

// If `module.exports` is defined, we're gonna use it.
if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscus;
}
