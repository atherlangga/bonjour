angular.module('bonjour')
	.controller('NavController',[
		'$scope',
		function($scope){
			$scope.close= function(){
				chrome.app.window.current().close();
			}

			$scope.maximize = function(){
				console.log('maximize');
				chrome.app.window.current().maximize();
			}

			$scope.minimize = function(){
				console.log('minimize');
				chrome.app.window.current().minimize();
			}
		}
	]);