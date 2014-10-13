define(['../app'], function(app) {
app.controller('FrameController',[ '$scope',
	function($scope) {
		$scope.isMaximized = function(){
			return chrome.app.window.current().isMaximized();
		}

		$scope.close= function(){
			chrome.app.window.current().close();
		}

		$scope.maximize = function(){
			$scope.status = true;
			chrome.app.window.current().maximize();
		}

		$scope.normalize = function(){
			$scope.status = false;
			chrome.app.window.current().restore();
		}

		$scope.minimize = function(){
			chrome.app.window.current().minimize();
		}

		$scope.check = function(){
			console.log($scope.status);
		}

		$scope.status = $scope.isMaximized();
	}])
});
