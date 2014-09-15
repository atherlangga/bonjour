angular.module('roomModule')
.controller('RoomController',
	function RoomController($scope, user) {
		$scope.test = "Room List :D";
		$scope.rooms = user.rooms;

		user.loadRooms();
	}
);
