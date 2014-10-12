
require.config({
	paths: {
		'lodash'            : 'components/lodash/dist/lodash',
		'pusher'            : 'components/pusher/pusher',
		'angular'           : 'components/angular/angular',
		'angular-route'     : 'components/angular-route/angular-route',
		'angular-ui-router' : 'components/angular-ui-router/release/angular-ui-router',
		'angularAMD'        : 'components/angularAMD/angularAMD',
		'ngload'            : 'components/angularAMD/ngload',

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
		'angularAMD': {
			deps: ['angular']
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
