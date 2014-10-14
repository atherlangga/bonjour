define(['../app', '../qiscus/qiscus-service', '../connectivity/connectivity-service'],
function(app) {
	app.controller('ChatroomContentController', ['$scope', 'user', 'connectivityEvent',
		function($scope, user, connectivityEvent) {
			$scope.rooms = user.rooms;
			$scope.selected = user.selected;

			var roomsPromise = user.loadRooms();
			roomsPromise.then(function(){
				$scope.selectRoom(user.rooms[0].id);
			});

			connectivityEvent.addOnlineHandler(function() {
				user.loadTopic(user.selected.topic.id);
			})

			$scope.selectRoom = function(id){
				var roomPromise = user.loadRoom(id);
				roomPromise.then(function(){
					$scope.selectTopic(user.selected.room.lastTopicId);
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
