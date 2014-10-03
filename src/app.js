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
  'ngMaterial',
  'lodash'
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
  this.showRightMenu = function() {
    $materialSidenav('right').open();
  };
  this.toggleLeftMenu = function() {
    _this.leftStatus = !_this.leftStatus;
  };
  this.toggleRightMenu = function() {
    _this.rightStatus = !_this.rightStatus;
  };

  this.notID = 1;
  this.createNotif = function(){
    var options = {
      type: "basic",
      title: "Notifications",
      message: "Primary message to display",
      iconUrl: "bonjour-128.png"
    }
    chrome.notifications.create("id"+_this.notID++,options,function(notID){
      setTimeout(function() {
        chrome.notifications.clear(notID, function(wasCleared) {
          console.log("Notification " + notID + " cleared: " + wasCleared);
        });
      }, 3000);
    });
  }
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
])
.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension|blob):|data:image\//);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
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
         document.querySelector('.bonjour-comment-listing').style.height = window.innerHeight-26-64-48-30;
         //console.log(elem.clientHeight);
         //console.log(elem[0].style.height);
       },0);
       window.onresize = function(){
          console.log('room resize');
       	 elem[0].style.height = window.innerHeight-26-64;
         document.querySelector('.bonjour-room-listing').style.height = window.innerHeight-26-64-48;
         document.querySelector('.bonjour-topic-listing').style.height = window.innerHeight-26-64-48;
         document.querySelector('.bonjour-comment-listing').style.height = window.innerHeight-26-64-48-30;
       }
  	}
  } 
})


angular.module('lodash', []).factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});



var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://www.qisc.us/assets/qiscus-062f3f48c42c4d051336c96edf52a4af.png', true);
xhr.responseType = 'blob';
xhr.onload = function(e) {
  var img = document.createElement('img');
  img.src = window.URL.createObjectURL(this.response);
  console.log(this.response);
  //document.body.appendChild(img);
  document.querySelector("#logo-qiscus").appendChild(img);
};

xhr.send();
