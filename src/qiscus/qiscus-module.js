////
// Qiscus module definition.
// 
// This module is simply a wrapper over Qiscus library.
////

angular.module('qiscusModule')
.factory('promises', ['$q',
	function($q) {
		return new qiscusPromises.Angular($q);
	}]
)
.factory('apiClient', ['$http', 'promises',
	function($http, promises) {
		return new qiscusApiClient.Angular(
			$http,
			"http://staging.qisc.us",
			"PP5H4HUz7UaiTBfyobzW",
			promises);
	}]
)
.factory('user', ['apiClient', 'promises',
	function(apiClient, promises) {
		return new qiscus.User("qiscustest01@dispostable.com", apiClient, promises);
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
		};

		var listener = new qiscusListener.Pusher(
			pusher, user, onAfterEvent);

		return listener;
	}]
)
.run(['user', 'listener', '$rootScope', function(user, listener, $rootScope) {
	// Before we execute all the code inside this module, we need to do
	// two things:
	//
	// 1. Listen to the user event first,
	listener.listenUserEvent(user.email);
	// and ..
	// 2. Watch the rooms, so that whenever user's Rooms get changed,
	//    we can attach our listener.
	$rootScope.rooms = user.rooms;
	$rootScope.$watchCollection('rooms', function(newRooms, oldRooms) {
		var addedRooms = _.difference(newRooms, oldRooms);
		_.each(addedRooms, function(room) {
			listener.listenRoomEvent(room.channelCode);
		});
	});
	/*$rootScope.$watchCollection('user.selectedTopic.comments', function(newVal,oldVal){
		
	})*/
}])
;
