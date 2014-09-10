angular.module('roomModule')
.controller('RoomController',
	function RoomController($scope, user) {
		$scope.test = "Just a test output defined at room-controller.js";
		$scope.rooms = user.rooms;

		user.loadRooms();
	}
);
