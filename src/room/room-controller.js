angular.module('roomModule')
.controller('RoomController',[
	'$scope',
	'user',
	function($scope, user) {
		//$scope.greeting = "Hello";
		$scope.rooms = user.rooms;
		$scope.currentRoom = null;

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
			})
		}
	}
]);
