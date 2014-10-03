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
		$scope.loading = {
			rooms:true,
			topics:true,
			comments:true
		};

		var roomsPromise = user.loadRooms();
		$scope.loading.rooms = true;
		roomsPromise.then(function(){
			$scope.loading.rooms= false;
			console.log($scope.rooms);
			$scope.selectRoom(user.rooms[0].id);
		})

		$scope.selectRoom = function(id){
			var roomPromise = user.loadRoom(id);
			$scope.loading.topics = true;
			$scope.loading.comments = true;
			roomPromise.then(function(){
				$scope.loading.topics = false;
				$scope.currentRoom = user.getRoom(id);
				console.log($scope.currentRoom.lastActiveTopic);
				$scope.selectTopic($scope.currentRoom.lastActiveTopic.id);
				console.log($scope.currentRoom);
				
			})
		}

		$scope.selectTopic = function(id){
			var commentPromise = user.loadTopic(id);
			$scope.loading.comments = true;
			commentPromise.then(function(){
				$scope.loading.comments = false;
				$scope.currentTopic = $scope.currentRoom.getTopic(id);
				console.log($scope.currentTopic);
			})
		}

		$scope.getCommentAvatar = function(username){
			var usr = _.find($scope.currentRoom.participants,{'username':username});
			return usr.avatar;
			
		}
	}
]);
