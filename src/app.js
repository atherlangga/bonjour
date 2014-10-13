define(['angular', 'angular-ui-router', 'angularAMD'],
function(angular, angularRoute, angularAMD) {
	'use strict';

	var app = angular.module('bonjour', ['ui.router'])
	.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
		// The default route
		$urlRouterProvider.otherwise('/frame');

		$stateProvider
		// 'frame' is the default route. Please note that this
		// route is abstract because this route meant only for
		// wrapping.
		.state('frame', angularAMD.route({
			'abstract'      : true,
			'url'           : '/frame',
			'templateUrl'   : './src/frame/frame.html',
			'controllerUrl' : './src/frame/frame-controller',
			'controller'    : 'FrameController'
		}))
		// Login route. Please note the 'url' property of this
		// route is empty, meaning that this route will be the
		// default when its parent route is abstract.
		.state('frame.login', angularAMD.route({
			'url'           : '',
			'templateUrl'   : './src/login/login.html',
			'controllerUrl' : './src/login/login-controller',
			'controller'    : 'LoginController'
		}))
		// The main route, which consists of two sub-views, the
		// menu and the content.
		.state('frame.chatroom', angularAMD.route({
			'url'      : '/chatroom',
			'views'    : {
				''        : {
					'template' : '<div ui-view="menu"></div><div ui-view="content"></div>'
				},
				'menu@frame.chatroom'    : angularAMD.route({
					'templateUrl'   : './src/chatroom/chatroom-menu.html',
					'controllerUrl' : './src/chatroom/chatroom-menu-controller',
					'controller'    : 'ChatroomMenuController'
				}),
				'content@frame.chatroom' : angularAMD.route({
					'templateUrl'   : './src/chatroom/chatroom-content.html',
					'controllerUrl' : './src/chatroom/chatroom-content-controller',
					'controller'    : 'ChatroomContentController'
				})
			}
		}));
	}])
	.value('baseUrl', 'http://staging.qisc.us');

	return angularAMD.bootstrap(app);
});

/*
// Declare all the available modules.
angular.module('connectivityModule', []);
angular.module('qiscusModule', []);
angular.module('roomModule', ['qiscusModule']);

// Declare this application main module.
angular.module('bonjour', [
	'ngRoute',
  'ngSanitize',
	'connectivityModule',
	'roomModule',
  'ngAnimate',
  'ngMaterial',
  'lodash',
  'monospaced.elastic'
])
.controller('MainController', function($scope, $materialSidenav,user) {
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
  this.refresh = function(){
    user.clearData();
    
    var roomsPromise = user.loadRooms();
    roomsPromise.then(function() {
      var roomPromise = user.loadRoom(user.rooms[0].id);
      roomPromise.then(function() {
        user.loadTopic(user.selected.room.lastTopicId);
      });
    });
  }

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
  }*/
