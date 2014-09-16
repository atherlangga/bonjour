angular.module('roomModule')
.controller('RoomController',[
	'$scope',
	'user',
	function($scope, user) {
		$scope.test = "Room List :D";
		$scope.rooms = user.rooms;

		user.loadRooms();

		$scope.selectRoom = function($index){
			$scope.selectedRoom = $index;
		}

		$scope.selectRoom(0);
	}
]);
