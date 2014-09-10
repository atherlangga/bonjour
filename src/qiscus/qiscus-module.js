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
);
