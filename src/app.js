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
  var _this = this;
  this.leftStatus = true;
  this.rightStatus = true;
  this.openLeftMenu = function() {
    $materialSidenav('left').toggle();
  };
  this.openRightMenu = function() {
    $materialSidenav('right').toggle();
  };
  this.toggleLeftMenu = function() {
    _this.leftStatus = !_this.leftStatus;
  };
  this.toggleRightMenu = function() {
    _this.rightStatus = !_this.rightStatus;
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

angular.module('bonjour')
.directive('containerHeight',function($timeout){
  return{
    restrict:'A',
    link:function(scope,elem,attrs){
       $timeout(function(){
         elem[0].style.height = window.innerHeight-26-64;
         document.querySelector('.bonjour-room-listing').style.height = window.innerHeight-26-64-48;
         document.querySelector('.bonjour-topic-listing').style.height = window.innerHeight-26-64-48;
         //console.log(elem.clientHeight);
         //console.log(elem[0].style.height);
       },0);
       window.onresize = function(){
          console.log('room resize');
       	 elem[0].style.height = window.innerHeight-26-64;
         document.querySelector('.bonjour-room-listing').style.height = window.innerHeight-26-64-48;
         document.querySelector('.bonjour-topic-listing').style.height = window.innerHeight-26-64-48;
       }
  	}
  } 
})




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
