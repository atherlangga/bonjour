define(['angular', 'angular-route', 'angularAMD'],
function(angular, angularRoute, angularAMD) {
	'use strict';

	var app = angular.module('bonjour', ['ngRoute'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when(
			'/',
			angularAMD.route({
				templateUrl:   './src/login/login-index.html',
				controllerUrl: './src/login/login-controller',
				controller:    'LoginController'
			}));

		$routeProvider.when(
			'/room',
			angularAMD.route({
				templateUrl:   './src/room/room-index.html',
				controllerUrl: './src/room/room-controller',
				controller:    'RoomController'
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
