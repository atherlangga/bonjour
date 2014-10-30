// Declare or get namespace `qiscusListener`.
if (typeof module !== 'undefined' && typeof qiscusListener === 'undefined') {
	var qiscusListener = require('../qiscus/qiscus-listener');
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
			qiscusListener.handleRoomJoined(data, _this.user);
			_this.onAfterEvent();
		});

		channel.bind('deleteRoom', function(data) {
			qiscusListener.handleRoomLeft(data, _this.user);
			_this.onAfterEvent();
		});

		channel.bind('clearNotifTopic', function(data) {
			qiscusListener.handleTopicMarkedAsRead(data, _this.user);
			_this.onAfterEvent();
		});

		channel.bind('newmessage', function(data) {
			qiscusListener.handleIncomingMessage(data, _this.user);
			_this.onAfterEvent();
		});
	};

	QiscusListenerPusher.prototype.listenRoomEvent = function(roomChannelCode) {
		var channel = this.pusher.subscribe(roomChannelCode);
		var _this = this;

		channel.bind('postcomment', function(data) {
			qiscusListener.handleCommentPosted(data, _this.user);
			_this.onAfterEvent();
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

	QiscusListenerPusher.prototype.unlistenRoomEvent = function(roomChannelCode) {
		this.pusher.unsubscribe(roomChannelCode);
	}

	return QiscusListenerPusher;

})();

// Export this module for CommonJS-compatible library/environment.
if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscusListener;
}
