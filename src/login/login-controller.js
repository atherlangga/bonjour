define(['../app','angular-material'],
function(app) {
	app.controller('LoginController',[
		'$rootScope', '$scope', '$http', '$location', 'baseUrl',
		function($rootScope, $scope, $http, $location, baseUrl) {
			$scope.isLoggingIn = false;
			$scope.avatar = 'public/img/avatar/default-ava.png';

			chrome.storage.local.get('user',function(result){
				console.info('sudah get user lho',result);
				$scope.avatar	= result.user.avatar;
				$scope.email	= result.user.email;
				$scope.$apply();
			})

			$scope.login = function() {
				var email    = $scope.email;
				var password = $scope.password;
				$scope.error="";

				$scope.isLoggingIn = true;
				$http({
					method  : 'POST',
					url     : baseUrl + "/users/sign_in.json",
					data    : "user[email]=" + encodeURIComponent(email) + "&" + "user[password]=" + encodeURIComponent(password),
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
					}else{
						$scope.error = "The email or password you entered is incorrect.";
					}
				})
				.error(function(response) {
					$scope.isLoggingIn = false;
					$scope.error = "Error connecting to the server.";
				});
			};
		}
	]);
});
