// Declare all the available modules.
angular.module('connectivityModule', []);
angular.module('qiscusModule', []);
angular.module('roomModule', ['qiscusModule']);

// Declare this application main module.
angular.module('bonjour', [
	'ngRoute',
	'mgcrea.ngStrap',
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
			controller: 'RoomController'
		});
	}
]);


// Init setup and attach event listeners.
/*document.addEventListener('DOMContentLoaded', function(e) {
  var closeButton = document.querySelector('#close');
  closeButton.addEventListener('click', function(e) {
    chrome.app.window.current().close();
  });
});*/


