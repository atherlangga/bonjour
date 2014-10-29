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
		this.promisesAdapter = promisesAdapter;
	};

	QiscusApiClientAngular.prototype.listRooms = function(onSuccess, onFailure, onRoomsUnreadCountsFetched) {
		var _this = this;
		var url = qiscusApiClient.generateListRoomsUrl(this.baseUrl, this.token);

		this.$http.get(url).success(function(response) {
			var rooms = qiscusApiClient.parseListRoomsResponse(response);
			onSuccess(rooms);

			var url = qiscusApiClient.generateListUnreadCommentsForRoomsUrl(_this.baseUrl, _this.token);
			_this.$http.get(url).success(function(response) {
				qiscusApiClient.parseListUnreadCommentsForRooms(response, rooms);
				onRoomsUnreadCountsFetched();
			});
		});
	};

	QiscusApiClientAngular.prototype.listParticipants = function(roomId, onSuccess, onFailure) {
		var _this = this;

		var url = qiscusApiClient.generateListParticipantsUrl(this.baseUrl, this.token, roomId);

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
			data    : "token=" + encodeURIComponent(this.token) + "&" + "room_id=" + encodeURIComponent(roomId),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.success(function(response) {
			var topics = qiscusApiClient.parseListTopicsResponse(response);
			onSuccess(topics);
		});
	};

	QiscusApiClientAngular.prototype.listComments = function(topicId, lastCommentId, onSuccess, onFailure) {
		var _this = this;
		var url = qiscusApiClient.generateListCommentsUrl(this.baseUrl, this.token, topicId, lastCommentId);
		this.$http.get(url).success(function(response) {
			var comments = qiscusApiClient.parseListCommentsResponse(response);
			
			var commentsWithImage = _.filter(comments, function(comment) {
				return comment.isAttachment() && comment.isAttachmentImage();
			});
			var loadImageAttachmentsPromises = _.map(commentsWithImage, function(commentWithImage) {
				return _this.$http.get(commentWithImage.getAttachmentUri(), {responseType: 'blob'});
			});

			_this.promisesAdapter
			.all(loadImageAttachmentsPromises)
			.then(function(commentsImages) {
				qiscusApiClient.parseListCommentsWithImagesResponse(commentsWithImage, commentsImages);
			});
			onSuccess(comments);
		});
	};

	QiscusApiClientAngular.prototype.markTopicAsRead = function(topicId, onSuccess) {
		var url = qiscusApiClient.generateMarkTopicAsReadUrl(this.baseUrl, this.token, topicId);
		this.$http.get(url).success(function(response) {
			onSuccess();
		});
	}

	QiscusApiClientAngular.prototype.postComment = function(topicId, commentMessage, uniqueId, onSuccess, onFailure) {
		var url = qiscusApiClient.generatePostCommentUrl(this.baseUrl, this.token, topicId, commentMessage);
		this.$http({
			method  : 'POST',
			url     : url,
			data    : "token=" + encodeURIComponent(this.token) + "&" + "topic_id=" + encodeURIComponent(topicId) + "&" + "comment=" + encodeURIComponent(commentMessage) + "&" + "unique_id=" + encodeURIComponent(uniqueId),
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
		})
		.success(function(response) {
			onSuccess();
		})
		.error(function(error) {
			onFailure();
		});
	}

	QiscusApiClientAngular.prototype.downloadBlob = function(url, onSuccess, onFailure) {
		this.$http.get(url, {responseType: 'blob'})
		.success(function(response) {
			// TODO: Make this make generic so this can be run on Node.
			var blob = null;
			if (typeof URL !== 'undefined' && URL.createObjectURL) {
				blob = URL.createObjectURL(response);
			}
			onSuccess(blob);
		})
		.error(function(response) {
			onFailure(response);
		});
	}

	return QiscusApiClientAngular;

})();
