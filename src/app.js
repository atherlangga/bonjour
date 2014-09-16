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

angular.module('roomModule')
.directive('bonjourContainer',function($timeout){
  return{
    restrict:'A',
    link:function(scope,elem,attrs){
       $timeout(function(){
         elem[0].style.height = window.innerHeight-70;
         //console.log(elem.clientHeight);
         //console.log(elem[0].style.height);
       },0);
       window.onresize = function(){
       	 elem[0].style.height = window.innerHeight-70;
       }
  	}
  } 
});





