// Declare all the available modules.
angular.module('qiscusModule', []);
angular.module('roomModule', ['qiscusModule']);

// Declare this application main module.
angular.module('bonjour', [
	'ngRoute',
	'roomModule'
]);

// Define the routing.
angular.module('bonjour')
.config(
	['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'src/room/room-index.html',
				action: 'roomModule.RoomController'
			})
	}]);
