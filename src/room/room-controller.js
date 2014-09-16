angular.module('roomModule')
.controller('RoomController',[
	'$scope',
	'user',
	function($scope, user) {
		$scope.rooms = user.rooms;

		var loading = user.loadRooms();
		$scope.loading = "Loading";
		loading.then(function(){
			$scope.loading= "";
			$scope.selectRoom(user.rooms[0].id);
		})

		$scope.selectRoom = function(id){
			user.loadRooms(id);
		}
	}
]);
