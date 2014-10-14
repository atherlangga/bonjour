////
// Qiscus module definition.
// 
// This module is simply a wrapper over Qiscus library.
////

define(['../app', 'angularAMD', 'qiscus-promises-angular', 'qiscus-api-client-angular', 'qiscus-listener-pusher'],
function(app, angularAMD) {
	app.factory('promises', ['$q',
		function($q) {
			return new qiscusPromises.Angular($q);
		}]);

	app.factory('apiClient', ['$http', '$rootScope', 'promises',
		function($http, $rootScope, promises) {
			return new qiscusApiClient.Angular(
				$http,
				$rootScope.baseUrl,
				$rootScope.token,
				promises);
		}]);

	app.factory('user', ['$rootScope', 'apiClient', 'promises',
		function($rootScope, apiClient, promises) {
			return new qiscus.User(
				$rootScope.email, apiClient, promises);
		}]);

	app.factory('listener', ['$rootScope', 'pusherApiKey', 'user',
		function($rootScope, pusherApiKey, user) {
			// Create the Pusher instance, along with the API key.
			var pusher = new Pusher(pusherApiKey);

			var onAfterEvent = function() {
				// Everytime Pusher done processing event, we'll
				// ask Angular to start the digest cycle.
				$rootScope.$digest();
			};

			var listener = new qiscusListener.Pusher(
				pusher, user, onAfterEvent);

			return listener;
		}]);

	// This block is a replacement for `app.run` method.
	angularAMD.inject(['user', 'listener', '$rootScope', function(user, listener, $rootScope) {
		// Before we execute all the code inside this module, we need to do
		// two things:
		//
		// 1. Listen to the user event first,
		listener.listenUserEvent(user.email);
		// and ..
		// 2. Watch the rooms, so we can manage Room listening accordingly.
		$rootScope.rooms = user.rooms;
		$rootScope.$watchCollection('rooms', function(newRooms, oldRooms) {
			// Whenever there are removed Rooms, we unlisten them first.
			var removedRooms = _.difference(oldRooms, newRooms);
			_.each(removedRooms, function(room) {
				listener.unlistenRoomEvent(room.channelCode);	
			});

			// Then, we detect where there any added Rooms. If so,
			// we start listen to them.
			var addedRooms = _.difference(newRooms, oldRooms);
			_.each(addedRooms, function(room) {
				listener.listenRoomEvent(room.channelCode);
			});
		});
	}]);

});
