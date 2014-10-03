// Declare or get `qiscusApiClient` namespace.
var qiscusApiClient = qiscusApiClient || {};

/**
 * Qiscus API Client implementation using Angular's $http
 * as its backend.
 */
qiscusApiClient.Angular = (function() {
	'use strict';
	
	var QiscusApiClientAngular = function($http, baseUrl, token, promisesAdapter) {
		this.$http  = $http;
		this.baseUrl = baseUrl;
		this.token = token;
		this.promisesAdapter = promisesAdapter
	};

	QiscusApiClientAngular.prototype.listRooms = function(onSuccess, onFailure) {
		var url = qiscusApiClient.generateListRoomsUrl(this.baseUrl, this.token);

		this.$http.get(url).success(function(response) {
			var rooms = qiscusApiClient.parseListRoomsResponse(response);
			onSuccess(rooms);
		});
	};

	QiscusApiClientAngular.prototype.listParticipants = function(roomId, onSuccess, onFailure) {
		var _this = this;

		var url = qiscusApiClient.generateListParticipantsUrl(this.baseUrl, this.token, roomId);
		var listParticipantsPromise = this.$http.get(url);

		this.$http.get(url).success(function(response) {
			var participantAvatarPairs = qiscusApiClient.parseListParticipantsResponseForAvatars(response);
			var loadAvatarPromises = _.map(participantAvatarPairs, function(participantAvatarPair) {
				return _this.$http.get(participantAvatarPair.url, {responseType: 'blob'});
			});

			_this.promisesAdapter.all(loadAvatarPromises).then(function(avatars) {
				var participants = qiscusApiClient.parseListParticipantsResponse(response, avatars);
				onSuccess(participants);
			});
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
		this.$http.get(url).success(function(response) {
			var comments = qiscusApiClient.parseListCommentsResponse(response);
			onSuccess(comments);
		});
	};

	QiscusApiClientAngular.prototype.postComment = function(topicId, commentMessage, onSuccess, onFailure) {
		var url = qiscusApiClient.generatePostCommentUrl(this.baseUrl, this.token, topicId, commentMessage);
		this.$http({
			method  : 'POST',
			url     : url,
			data    : "token=" + this.token + "&" + "topic_id=" + topicId + "&" + "comment=" + commentMessage,
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.success(function(response) {
			onSuccess();
		});
	}

	return QiscusApiClientAngular;

})();
