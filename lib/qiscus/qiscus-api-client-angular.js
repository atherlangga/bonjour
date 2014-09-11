// Declare or get `qiscusApiClient` namespace.
var qiscusApiClient = qiscusApiClient || {};

qiscusApiClient.Angular = (function() {
	'use strict';
	var QiscusApiClientAngular = function($http, baseUrl, token) {
		this.$http  = $http;
		this.baseUrl = baseUrl;
		this.token = token;
	};

	QiscusApiClientAngular.prototype.listRooms = function(onSuccess, onFailure) {
		var url = this.baseUrl + "/api/v1/mobile/rooms?token=" + this.token;

		this.$http.get(url).success(function(response) {
			var rooms = qiscusApiClient.parseListRoomsResponse(response);
			onSuccess(rooms);
		});
	};

	return QiscusApiClientAngular;

})();
