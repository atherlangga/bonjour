define(['../app', '../qiscus/qiscus-service', '../connectivity/connectivity-service'],
function(app) {
	app.controller('ChatroomContentController', ['$scope', '$timeout', 'user', 'connectivityEvent',
		function($scope, $timeout, user, connectivityEvent) {
			// "Link" model and view.
			$scope.rooms = user.rooms;
			$scope.selected = user.selected;
			$scope.currentEmail = user.email;

			// Handle connectivity event.
			connectivityEvent.addOnlineHandler(function() {
				// Reload all Rooms.

				// Wait 3 seconds to reload. We need to wait a while
				// before reloading because the backend library *might*
				// try to replay our previously-failed requests. In
				// that case, we need to wait for the data source (most
				// likely a server) to be done processing.
				$timeout(function() {
					user.loadRooms(10)
					.then(function() {
						return user.selectRoom(user.selected.room.id);
					})
					.then(function() {
						user.selectTopic(user.selected.topic.id);
					});
				}, 3000);
			});

			// Start loading, and cache first 10 Rooms.
			user.loadRooms(10)
			.then(function(){
				return user.selectRoom(user.rooms[0].id);
			})
			.then(function(){
				return user.selectTopic(user.selected.room.lastTopicId);
			});

			$scope.selectRoom = function(id){
				user.selectRoom(id)
				.then(function(){
					return user.selectTopic(user.selected.room.lastTopicId);
				})
			}

			$scope.selectTopic = function(id){
				user.selectTopic(id);
			}

			$scope.sendComment = function(){
				user.postComment($scope.currentTopic.id,$scope.commentMessage);
				$scope.commentMessage = "";
			}
		}]
	);
});
