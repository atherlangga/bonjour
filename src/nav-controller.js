angular.module('bonjour')
	.controller('NavController',[
		'$scope',
		function($scope){

			$scope.isMaximized = function(){
				return chrome.app.window.current().isMaximized();
			}

			$scope.status = $scope.isMaximized();

			$scope.close= function(){
				chrome.app.window.current().close();
			}

			$scope.maximize = function(){
				console.log('maximize');
				$scope.status = true;
				chrome.app.window.current().maximize();
			}

			$scope.normalize = function(){
				$scope.status = false;
				console.log('normalize');
				chrome.app.window.current().restore();
			}

			$scope.minimize = function(){
				console.log('minimize');
				chrome.app.window.current().minimize();
			}

			$scope.check = function(){
				console.log($scope.status);
			}
		}
	]);