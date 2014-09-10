// This module is using techniques described in
// http://www.evanjones.ca/js-modules.html
// to achieve cross-environment (Node and browser).

// Import dependency
var _ = _ || require('../lodash/lodash');

var qiscus = (function(_) {
	'use strict';

	var User = function(agent) {
		this.rooms = [];
		this.agent = agent;
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
		var preservedThis = this;
		this.agent.listRooms(function(rooms) {
			_.each(rooms, function(room) {
				preservedThis.rooms.push(room);
			});
			_roomIsLoaded = true;
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

	var Room = function(id, name) {
		this.id = id;
		this.name = name;
		this.topics = [];
	}

	Room.prototype.addTopic = function(topic) {
		this.topics.push(topic);
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
