angular.module('roomModule')
.controller('RoomController',[
	'$scope', 'user', '_',
	function($scope, user, _) {
		$scope.rooms = user.rooms;
		$scope.currentRoom = null;
		$scope.currentTopic = null;

		var roomsPromise = user.loadRooms();
		roomsPromise.then(function(){
			$scope.selectRoom(user.rooms[0].id);
		});

		$scope.selectRoom = function(id){
			$scope.currentRoom = user.getRoom(id);
			$scope.currentTopic = $scope.currentRoom.getTopic($scope.currentRoom.lastTopicId);

			var roomPromise = user.loadRoom(id);
			roomPromise.then(function(){
				$scope.selectTopic($scope.currentRoom.lastTopicId);
			})
		}

		$scope.selectTopic = function(id){
			$scope.currentTopic = $scope.currentRoom.getTopic(id);			
			user.loadTopic(id);
		}

		$scope.sendComment = function(){
			user.postComment($scope.currentTopic.id,$scope.commentMessage);
			$scope.commentMessage = "";
		}
	}
]);
