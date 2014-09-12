// Declare all the available modules.
angular.module('connectivityModule', []);
angular.module('qiscusModule', []);
angular.module('roomModule', ['qiscusModule']);

// Declare this application main module.
angular.module('bonjour', [
	'ngRoute',
	'connectivityModule',
	'roomModule'
]);

// Configure the application.
angular.module('bonjour')
.config(['$routeProvider',
	function($routeProvider) {
		// Define the routing.
		$routeProvider.when('/', {
			templateUrl: 'src/room/room-index.html',
			action: 'roomModule.RoomController'
		});
	}
]);
