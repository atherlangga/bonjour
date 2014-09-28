// Declare or get `qiscusApiClient` namespace.
var qiscusApiClient = qiscusApiClient || {};

/**
 * Qiscus API Client implementation using Angular's $http
 * as its backend.
 */
qiscusApiClient.Angular = (function() {
	'use strict';
	
	var QiscusApiClientAngular = function($http, baseUrl, token) {
		this.$http  = $http;
		this.baseUrl = baseUrl;
		this.token = token;
	};

	QiscusApiClientAngular.prototype.listRooms = function(onSuccess, onFailure) {
		var url = qiscusApiClient.generateListRoomsUrl(this.baseUrl, this.token);

		this.$http.get(url).success(function(response) {
			var rooms = qiscusApiClient.parseListRoomsResponse(response);
			onSuccess(rooms);
		});
	};

	QiscusApiClientAngular.prototype.listTopics = function(roomId, onSuccess, onFailure) {
		var url = qiscusApiClient.generateListTopicsUrl(this.baseUrl, this.token, roomId);

		this.$http({
			method  : 'POST',
			url     : url,
			data    : "token=" + this.token + "&" + "room_id=" + roomId,
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.success(function(response) {
			var topics = qiscusApiClient.parseListTopicsResponse(response);
			onSuccess(topics);
		});
	};

	QiscusApiClientAngular.prototype.listComments = function(topicId, lastCommentId, onSuccess, onFailure) {
		var url = qiscusApiClient.generateListCommentsUrl(this.baseUrl, this.token, topicId, lastCommentId);
		console.log(url);
		this.$http.get(url).success(function(response) {
			var comments = qiscusApiClient.parseListCommentsResponse(response);
			onSuccess(comments);
		});
	};

	return QiscusApiClientAngular;

})();
