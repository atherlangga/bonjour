define(['../app'],
function(app) {
	app.controller('LoginController',[
		'$rootScope', '$scope', '$http', '$location', 'baseUrl',
		function($rootScope, $scope, $http, $location, baseUrl) {
			$scope.isLoggingIn = false;

			// Try getting valid default email address.
			chrome.storage.local.get('email', function(result) {
				$scope.email = result.email;
				$scope.$apply();
			});

			$scope.login = function() {
				var email    = $scope.email;
				var password = $scope.password;

				$scope.isLoggingIn = true;
				$http({
					method  : 'POST',
					url     : baseUrl + "/users/sign_in.json",
					data    : "user[email]=" + email + "&" + "user[password]=" + password,
					headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
				})
				.success(function(response) {
					$scope.isLoggingIn = false;
					if (response.success === true) {
						$rootScope.email   = email;
						$rootScope.baseUrl = baseUrl;
						$rootScope.token   = response.token;

						// Store valid email address on the local storage.
						chrome.storage.local.set({"email": $scope.email});

						$location.url("frame/chatroom");
					}
				});
			};
		}
	]);
});
