define(['../app', '../qiscus/qiscus-service', 'angular-material'],
function(app, qiscusService, angularMaterial) {
	app.controller('ChatroomMenuController', ['$scope', '$materialSidenav', 'user',
		function($scope, $materialSidenav, user) {
			var _this = this;
			$scope.leftStatus = true;
			$scope.rightStatus = true;

			$scope.openLeftMenu = function() {
				$materialSidenav('left').toggle();
			};
			$scope.openRightMenu = function() {
				$materialSidenav('right').toggle();
			};
			$scope.showRightMenu = function() {
				$materialSidenav('right').open();
			};
			$scope.toggleLeftMenu = function() {
				_this.leftStatus = !_this.leftStatus;
			};
			$scope.toggleRightMenu = function() {
				_this.rightStatus = !_this.rightStatus;
			};
			$scope.refresh = function() {
				user.clearData();
				
				var roomsPromise = user.loadRooms();
				roomsPromise.then(function() {
					var roomPromise = user.loadRoom(user.rooms[0].id);
					roomPromise.then(function() {
						user.loadTopic(user.selected.room.lastTopicId);
					});
				});
			}

			this.notificationId = 1;
			$scope.createNotification = function(){
				var options = {
					type: "basic",
					title: "Notifications",
					message: "Primary message to display",
					iconUrl: "bonjour-128.png"
				}
				chrome.notifications.create("id"+_this.notificationId++,options,function(notificationId){
					setTimeout(function() {
						chrome.notifications.clear(notificationId, function(wasCleared) {
							console.log("Notification " + notificationId + " cleared: " + wasCleared);
						});
					}, 3000);
				});
			}
		}]
	);
});
