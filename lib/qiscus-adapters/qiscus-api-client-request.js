// Declare or get `qiscusApiClient` namespace.
if (typeof module !== 'undefined' && typeof qiscusApiClient === 'undefined') {
	var qiscusApiClient = require('../qiscus/qiscus-api-client');
}
var qiscusApiClient = qiscusApiClient || {};

/**
 * Qiscus API Client implementation using Node-based request library
 * as its backend.
 */
qiscusApiClient.Request = (function() {
	'use strict';
	
	var QiscusApiClientRequest = function(request, baseUrl, token) {
		this.request  = request;
		this.baseUrl = baseUrl;
		this.token = token;
	};

	QiscusApiClientRequest.prototype.listRooms = function(onSuccess, onFailure) {
		var url = qiscusApiClient.generateListRoomsUrl(this.baseUrl, this.token);

		this.request(url, function (error, response, body) {
			var rooms = qiscusApiClient.parseListRoomsResponse(JSON.parse(body));
			onSuccess(rooms);
		});
	};

	QiscusApiClientRequest.prototype.listTopics = function(roomId, onSuccess, onFailure) {
		var url = qiscusApiClient.generateListTopicsUrl(this.baseUrl, this.token, roomId);
		this.request.post({
			headers: {'content-type' : 'application/x-www-form-urlencoded'},
			url:     url,
			body:    "token=" + this.token + "&" + "room_id=" + roomId,
		}, function(error, response, body){
			var topics = qiscusApiClient.parseListTopicsResponse(JSON.parse(body));
			onSuccess(topics);
		});
	};

	return QiscusApiClientRequest;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscusApiClient;
}
