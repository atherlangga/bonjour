define(['../app', '../qiscus/qiscus-service', '../connectivity/connectivity-service', './chatroom-directive', 'angular-material'],
function(app) {
	app.controller('ChatroomMenuController', ['$scope', '$materialSidenav', 'user', 'connectivityEvent',
		function($scope, $materialSidenav, user, connectivityEvent) {
			var _this = this;
			$scope.leftStatus = true;
			$scope.rightStatus = true;
			$scope.connectivityStatus = "Online";

			connectivityEvent.addOnlineHandler(function() {
				$scope.connectivityStatus = "Online";
			});

			connectivityEvent.addOfflineHandler(function() {
				$scope.connectivityStatus = "Offline";
			});

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
				// Clear the data.
				user.clearData();
				
				// Start reloading.
				user.loadRooms()
				.then(function(){
					return user.loadRoom(user.rooms[0].id);
				})
				.then(function(){
					return user.loadTopic(user.selected.room.lastTopicId);
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
