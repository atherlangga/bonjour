// Declare or get namespace `qiscusListener`.
if (typeof module !== 'undefined' && typeof qiscusListener === 'undefined') {
	var qiscusListener = require('./qiscus-listener-base');
}
var qiscusListener = qiscusListener || {};

/**
 * Qiscus Listener implementation that uses Pusher as its backend.
 */
qiscusListener.Pusher = (function() {
	'use strict;'

	var QiscusListenerPusher = function(pusher, user, onAfterEvent) {
		this.pusher = pusher;
		this.user = user;
		this.onAfterEvent = onAfterEvent;
	}

	QiscusListenerPusher.prototype.listenUserEvent = function(userChannelCode) {
		var channel = this.pusher.subscribe(userChannelCode);
		var _this = this;
		
		channel.bind('newRoom', function(data) {
			var room = qiscusListener.handleRoomJoined(data, _this.user);
			
			// Immediately listen to the events for the new room.
			_this.listenRoomEvent(room.channelCode);

			_this.onAfterEvent();
		});

		channel.bind('deleteRoom', function(data) {
			qiscusListener.handleRoomLeft(data, _this.user);
			_this.onAfterEvent();
		});

		channel.bind('clearNotifTopic', function(data) {
		});
	};

	QiscusListenerPusher.prototype.listenRoomEvent = function(roomChannelCode) {
		var channel = this.pusher.subscribe(roomChannelCode);
		var _this = this;

		channel.bind('postcomment', function(data) {
		});

		channel.bind('delete', function(data) {
		});

		channel.bind('newtopic', function(data) {
			qiscusListener.handleTopicCreated(data, _this.user);
			_this.onAfterEvent();
		});

		channel.bind('deleteTopic', function(data) {
			qiscusListener.handleTopicDeleted(data, _this.user);
			_this.onAfterEvent();
		});

		channel.bind('newPeople', function(data) {
		});
	};

	return QiscusListenerPusher;

})();

// Export this module for CommonJS-compatible library/environment.
if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscusListener;
}
