define(['../app', '../qiscus/qiscus-service', '../connectivity/connectivity-service'],
function(app) {
	app.controller('ChatroomContentController', ['$scope', 'user', 'connectivityEvent',
		function($scope, user, connectivityEvent) {
			// "Link" model and view.
			$scope.rooms = user.rooms;
			$scope.selected = user.selected;

			// Handle connectivity event.
			connectivityEvent.addOnlineHandler(function() {
				user.loadTopic(user.selected.topic.id);
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
