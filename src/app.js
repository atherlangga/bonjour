// Declare all the available modules.
angular.module('connectivityModule', []);
angular.module('qiscusModule', []);
angular.module('roomModule', ['qiscusModule']);

// Declare this application main module.
angular.module('bonjour', [
	'ngRoute',
	'connectivityModule',
	'roomModule',
  'ngAnimate',
  'ngMaterial'
])
.controller('MainController', function($scope, $materialSidenav) {
  $scope.openLeftMenu = function() {
    $materialSidenav('left').toggle();
  };
});

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




/*var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://www.qisc.us/assets/qiscus-062f3f48c42c4d051336c96edf52a4af.png', true);
xhr.responseType = 'blob';
xhr.onload = function(e) {
  var img = document.createElement('img');
  img.src = window.URL.createObjectURL(this.response);
  //document.body.appendChild(img);
  document.querySelector("#logo-qiscus").appendChild(img);
  console.log('gambare nang %s',img);
};

xhr.send();*/
