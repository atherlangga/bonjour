////
// Qiscus module definition.
// 
// This module is simply a wrapper over Qiscus library.
////

angular.module('qiscusModule')
.factory('apiClient', ['$http',
	function($http) {
		return new qiscusApiClient.QiscusApiClientAngular(
			$http,
			"https://www.qisc.us",
			"9anyxaB_X2Uaq4insW4y");
	}]
)
.factory('user', ['apiClient',
	function(apiClient) {
		return new qiscus.User(apiClient);
	}]
);
