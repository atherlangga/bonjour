angular.module('roomModule')
.controller('RoomController',[
	'$scope',
	'user',
	'_',
	function($scope, user, _) {
		//$scope.greeting = "Hello";
		$scope.rooms = user.rooms;
		$scope.currentRoom = null;
		$scope.currentTopic = null;

		var roomsPromise = user.loadRooms();
		$scope.loading = "Loading";
		roomsPromise.then(function(){
			$scope.loading= "";
			console.log($scope.rooms);
			$scope.selectRoom(user.rooms[0].id);
		})

		$scope.selectRoom = function(id){
			var roomPromise = user.loadRoom(id);
			$scope.loadingTopic = "Loading";
			roomPromise.then(function(){
				$scope.loadingTopic = "";
				$scope.currentRoom = user.getRoom(id);
				console.log($scope.currentRoom.lastActiveTopic);
				$scope.selectTopic($scope.currentRoom.lastActiveTopic.id);
				console.log($scope.currentRoom);
				
			})
		}

		$scope.selectTopic = function(id){
			var commentPromise = user.loadTopic(id);
			$scope.loadingComment = "Loading";
			commentPromise.then(function(){
				$scope.loadingComment = "";
				$scope.currentTopic = $scope.currentRoom.getTopic(id);
				console.log($scope.currentTopic);
			})
		}

		$scope.getCommentAvatar = function(username){
			var usr = _.find($scope.currentRoom.participants,{'username':username});
			return usr.avatar.data;
		}
	}
]);
