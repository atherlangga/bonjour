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
