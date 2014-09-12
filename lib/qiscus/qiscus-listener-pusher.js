// Declare or get namespace `qiscusListener`.
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

		channel.bind_all(function(data) {
		})
		
		channel.bind('newRoom', function(data) {
		});
		channel.bind('deleteRoom', function(data) {
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
