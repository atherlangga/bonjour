// This module is using techniques described in
// http://www.evanjones.ca/js-modules.html
// to achieve cross-environment (Node and browser).

// Import dependency
var _ = _ || require('../lodash/lodash');

var qiscus = (function(_) {
	'use strict';

	var User = function(email, agent) {
		this.email = email;
		this.agent = agent;

		this.rooms = [];
		this.onRoomLoadedListeners = [];
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
		this.agent.listRooms(function(rooms) {
			// Push every loaded Rooms onto this.rooms.
			_.each(rooms, function(room) {
				_this.rooms.push(room);
			});

			// Mark that the User's Rooms has been loaded.
			_roomIsLoaded = true;

			// Call each registered callback.
			_.each(_this.onRoomLoadedListeners, function(listener) {
				listener(_this.rooms);
			});
		}, function() {});
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

	User.prototype.addOnRoomLoadedListener = function(newListener) {
		this.onRoomLoadedListeners.push(newListener);
	};

	var Room = function(id, name) {
		this.id = id;
		this.name = name;

		this.topics = [];
	}

	Room.prototype.addTopic = function(topic) {
		this.topics.push(topic);
	};

	Room.prototype.deleteTopic = function(topicId) {
		var topicToBeDeleted = _.find(this.topics, { 'id': topicId });
		if (topicToBeDeleted) {
			_.pull(this.topics, topicToBeDeleted);
		}
	};

	var Topic = function(id, title) {
		this.id = id;
		this.title = title;
		this.comments = [];
	}

	Topic.prototype.addComment = function(comment) {
		this.comments.push(comment);
	};

	var Comment = function(id, message, sender, senderEmail) {
		this.id = id;
		this.message = message;
		this.sender = sender;
		this.senderEmail;
	};

	return {
		User: User,
		Room: Room,
		Topic: Topic
	};

})(_);

// If `module.exports` is defined, we're gonna use it.
if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscus;
}
