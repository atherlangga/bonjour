// Declare or get namespace `qiscusListener`.
var qiscusListener = qiscusListener || {};

qiscusListener.pusher = (function() {
	'use strict;'

	var QiscusListenerPusher = function(pusher, user) {
		this.pusher = pusher;
		this.user = user;
	}

	QiscusListenerPusher.prototype.listenUserEvent = function(userChannelCode) {
	};

	QiscusListenerPusher.prototype.listenRoomEvent = function(roomChannelCode) {
	};

	return {
		QiscusListenerPusher: QiscusListenerPusher
	}

})();
