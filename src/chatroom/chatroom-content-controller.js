define(['../app', 'random-color', '../qiscus/qiscus-service', '../connectivity/connectivity-service'],
function(app,RColor) {
	app.controller('ChatroomContentController', ['$scope', '$timeout', 'user', 'connectivityEvent',
		function($scope, $timeout, user, connectivityEvent) {
			// "Link" model and view.
			$scope.rooms        = user.rooms;
			$scope.selected     = user.selected;
			$scope.currentEmail = user.email;

			$scope.selectRoom = function(id, initialTopicId){
				return user.selectRoom(id)
				.then(function(){
					// Determine initial Topic to load based on what
					// the caller wants. If it's null, then we're
					// gonna load the last Topic of the loaded Room.
					var initialTopicId = initialTopicId || user.selected.room.lastTopicId;

					// "Colorize" each participant.
					var color = new RColor;
					_.each(user.selected.room.participants,function(participant){
						participant.color = color.get(true);//.get(true, 0.3, 0.99);
					});
					
					return $scope.selectTopic(initialTopicId);
				});
			}

			$scope.selectTopic = function(id){
				return user.selectTopic(id)
				.then(function() {
					return user.markTopicAsRead(id);
				});
			}

			// Handle connectivity event.
			connectivityEvent.addOnlineHandler(function() {
				// Reload all Rooms when we got back our Internet
				// connection.

				// Wait 3 seconds to reload. We need to wait a while
				// before reloading because the backend library *might*
				// try to replay our previously-failed requests. In
				// that case, we need to wait for the data source (most
				// likely a server) to be done processing.
				$timeout(function() {
					user.loadRooms()
					.then(function() {
						return $scope.selectRoom(user.selected.room.id,
							user.selected.topic.id);
					});
				}, 3000);
			});

			// Start loading.
			user.loadRooms()
			.then(function(){
				return $scope.selectRoom(user.rooms[0].id);
			});			
		}]
	);
});
