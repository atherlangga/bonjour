define(['../app', '../qiscus/qiscus-service', '../connectivity/connectivity-service'],
function(app) {
	app.controller('ChatroomContentController', ['$scope', '$timeout', 'user', 'connectivityEvent',
		function($scope, $timeout, user, connectivityEvent) {
			// "Link" model and view.
			$scope.rooms = user.rooms;
			$scope.selected = user.selected;

			// Handle connectivity event.
			connectivityEvent.addOnlineHandler(function() {
				// Reload the current topic.
				user.loadTopic(user.selected.topic.id);

				// Try to reload again in 3 seconds, this is needed
				// because if we execute the same request in a short
				// period of time, the server might cache our request.
				$timeout(function() {
					user.loadTopic(user.selected.topic.id);
				}, 3000);
			});

			// Start loading.
			user.loadRooms()
			.then(function(){
				return user.loadRoom(user.rooms[0].id);
			})
			.then(function(){
				return user.loadTopic(user.selected.room.lastTopicId);
			});

			$scope.selectRoom = function(id){
				user.loadRoom(id)
				.then(function(){
					return user.loadTopic(user.selected.room.lastTopicId);
				})
			}

			$scope.selectTopic = function(id){
				user.loadTopic(id);
			}

			$scope.sendComment = function(){
				user.postComment($scope.currentTopic.id,$scope.commentMessage);
				$scope.commentMessage = "";
			}
		}]
	);
});
