
require.config({
	paths: {
		'lodash'            : 'components/lodash/dist/lodash',
		'jquery'            : 'components/jquery/dist/jquery',
		'pusher'            : 'components/pusher/dist/pusher',
		'offline'           : 'components/offline/offline.min',
		'angular'           : 'components/angular/angular',
		'angular-route'     : 'components/angular-route/angular-route',
		'angular-ui-router' : 'components/angular-ui-router/release/angular-ui-router',
		'angular-sanitize'	: 'components/angular-sanitize/angular-sanitize.min',
		'angularAMD'        : 'components/angularAMD/angularAMD',
		'angular-animate'	: 'components/angular-animate/angular-animate.min',
		'angular-material'  : 'components/angular-material/angular-material',
		'ngload'            : 'components/angularAMD/ngload',
		'hammer'			: 'components/hammerjs/hammer',

		'qiscus'            : 'lib/qiscus/qiscus',
		'qiscus-api-client' : 'lib/qiscus/qiscus-api-client',
		'qiscus-listener'   : 'lib/qiscus/qiscus-listener',

		'qiscus-promises-angular'   : 'lib/qiscus-adapters/qiscus-promises-angular',
		'qiscus-api-client-angular' : 'lib/qiscus-adapters/qiscus-api-client-angular',
		'qiscus-listener-pusher'    : 'lib/qiscus-adapters/qiscus-listener-pusher'
	},

	shim: {
		'lodash': {
			exports: '_'
		},
		'angular': {
			exports: 'angular'
		},
		'angular-route': {
			deps: ['angular']
		},
		'angular-ui-router': {
			deps: ['angular']
		},
		'angular-sanitize':{
			deps: ['angular']
		},
		'angularAMD': {
			deps: ['angular']
		},
		'angular-animate':{
			deps: ['angular']
		},
		'angular-material': {
			deps: ['angular','angular-animate','hammer']
		},
		'ngload': {
			deps: ['angularAMD']
		},
		'qiscus': {
			exports: 'qiscus',
			deps: ['lodash']
		},
		'qiscus-api-client': {
			deps: ['qiscus']
		},
		'qiscus-listener': {
			deps: ['qiscus']
		},
		'qiscus-promises-angular': {
			exports: 'qiscusPromises.Angular',
			deps: ['angular']
		},
		'qiscus-api-client-angular': {
			exports: 'qiscusApiClient.Angular',
			deps: ['angular', 'qiscus-api-client']
		},
		'qiscus-listener-pusher': {
			exports: 'qiscusListener.Pusher',
			deps: ['pusher', 'qiscus-listener']
		}
	},

	deps: ['./src/app']
});
