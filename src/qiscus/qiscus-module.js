////
// Qiscus module definition.
// 
// This module is simply a wrapper over Qiscus library.
////

angular.module('qiscusModule')
.factory('apiClient', ['$http',
	function($http) {
		return new qiscusApiClient.Angular(
			$http,
			"http://staging.qisc.us",
			"PP5H4HUz7UaiTBfyobzW");
	}]
)
.factory('user', ['apiClient',
	function(apiClient) {
		return new qiscus.User("qiscustest01@dispostable.com", apiClient);
	}]
)
.factory('listener', ['$rootScope', 'user',
	function($rootScope, user) {
		// Create the Pusher instance, along with the API key.
		//var pusher = new Pusher('896d049b53f1659213a2'); // Production
		var pusher = new Pusher('4c20f4052ecd7ffc6b0d'); // Staging

		var onAfterEvent = function() {
			// Everytime Pusher done processing event, we'll
			// ask Angular to start the digest cycle.
			$rootScope.$digest();
		}

		var listener = new qiscusListener.Pusher(
			pusher, user, onAfterEvent);

		return listener;
	}]
)
.run(['user', 'listener', function(user, listener) {
	// Before we execute all the code inside this module, we need to do
	// two things:
	//
	// 1. Listen to the user event first,
	listener.listenUserEvent(user.email);
	// and ..
	// 2. Add listeners when the room loaded, so we can
	//    attach our listeners' event handler to it.
	user.addOnRoomLoadedListener(function (rooms) {
		_.each(rooms, function(room) {
			if (typeof room.channelCode !== 'undefined') {
				listener.listenRoomEvent(room.channelCode);
			}
		});
	});
}])
;
