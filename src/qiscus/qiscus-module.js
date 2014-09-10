////
// Qiscus module definition.
// 
// This module is simply a wrapper over Qiscus library.
////

angular.module('qiscusModule')
.factory('apiClient', ['$http',
	function($http) {
		return new qiscusApiClient.angular.QiscusApiClientAngular(
			$http,
			"http://staging.qisc.us",
			"PP5H4HUz7UaiTBfyobzW");
	}]
)
.factory('user', ['apiClient',
	function(apiClient) {
		return new qiscus.User(apiClient);
	}]
)
.factory('listener', ['user',
	function(user) {
		var pusher = new Pusher('896d049b53f1659213a2');
		return new qiscusListener.pusher.QiscusPusherListener(
			pusher,
			user);
	}]
)
;
