define(['angular', 'angular-ui-router', 'angularAMD','angular-sanitize','angular-material','msd-elastic'],
function(angular, angularRoute, angularAMD) {
	'use strict';

	var app = angular.module('bonjour', ['ui.router','ngSanitize','ngMaterial','monospaced.elastic'])
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

	/*
	// Production code with production database
	.value('baseUrl', 'https://www.qisc.us')
	.value('pusherApiKey', '896d049b53f1659213a2')
	*/
	// Semi-staging code with production database
	.value('baseUrl', 'https://qiscus-staging.herokuapp.com')
	.value('pusherApiKey', '896d049b53f1659213a2')
	// Staging code with staging database
	/*
	.value('baseUrl', 'http://staging.qisc.us')
	.value('pusherApiKey', '4c20f4052ecd7ffc6b0d')
	*/

	.value('currentTopicId', null)
	;

	return angularAMD.bootstrap(app);
});

