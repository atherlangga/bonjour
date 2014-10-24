// Declare or get `qiscusApiClient` namespace.
var qiscusApiClient = qiscusApiClient || {};

// Import dependencies
var _ = _ || require('lodash');
var qiscus = qiscus || require('./qiscus');

qiscusApiClient.generateListRoomsUrl = function(baseUrl, token) {
	return baseUrl + "/api/v1/mobile/rooms_only?token=" + token;
};

qiscusApiClient.parseListRoomsResponse = function(response) {
	var rooms = _.map(response.results, function(rawRoomData) {
		// Get the required data for constructing Room.
		var id = rawRoomData.id;
		var name = rawRoomData.name;

		// Generate all the Topics.
		var topics = _.map(rawRoomData.listtopics, function(rawTopicData) {
			return new qiscus.Topic(rawTopicData.id, rawTopicData.title);
		});

		// Create the Room instance.
		var room = new qiscus.Room(id, name);
		// Insert all the Topics.
		_.each(topics, function(topic) {
			room.addTopic(topic);
		});

		// Insert room channel code into arbitrary property.
		// By arbitrary, it means that this value is ignored
		// by the Qiscus core module.
		room.channelCode = rawRoomData.code_en;

		// Finally, insert the last Topic ID and Comment ID.
		room.setLastTopicAndComment(
			rawRoomData.last_comment_topic_id,
			rawRoomData.last_comment_id);

		return room;
	});

	return rooms;
};

qiscusApiClient.generateListUnreadCommentsForRoomsUrl = function(baseUrl, token) {
	return baseUrl + "/api/v1/mobile/rooms?token=" + token;
}

qiscusApiClient.parseListUnreadCommentsForRooms = function(response, rooms) {
	_.each(response.results.rooms, function(rawRoomData) {
		var room = _.find(rooms, {'id': rawRoomData.id} );
		if (room) {
			room.cachedUnreadCommentsCount = rawRoomData.count_unread;
		}
	});
}

qiscusApiClient.generateListParticipantsUrl = function(baseUrl, token, roomId) {
	return baseUrl + "/api/v1/mobile/listPeople?token=" + token + "&room_id=" + roomId;
}

qiscusApiClient.parseListParticipantsResponseForAvatars = function(response) {
	var participantAvatarPairs = _.map(response.results.people, function(rawParticipantData) {
		var id = rawParticipantData.id;
		var url = rawParticipantData.avatar;

		return { 'id': id, 'url': url };
	});

	return participantAvatarPairs;
}

qiscusApiClient.parseListParticipantsResponse = function(response, avatars) {
	// "Merge" two sets of data: raw participants data and its downloaded avatars.
	var rawParticipantsData = _.zip(response.results.people, avatars);

	var participants = _.map(rawParticipantsData, function(rawParticipantData) {
		var id = rawParticipantData[0].id;
		var username = rawParticipantData[0].username;
		var email = rawParticipantData[0].email;

		// TODO: Make this make generic so this can be run on Node.
		var avatar = null;
		if (typeof URL !== 'undefined' && URL.createObjectURL)
			avatar = URL.createObjectURL(rawParticipantData[1].data);

		return new qiscus.Participant(id, username, email, avatar);
	});

	return participants;
}

qiscusApiClient.generateListTopicsUrl = function(baseUrl, token, roomId) {
	return baseUrl + "/api/v1/mobile/topics";
};

qiscusApiClient.parseListTopicsResponse = function(response) {
	var topics = _.map(response.results.topics, function(rawTopicData) {
		// Get the required data for constructing Topic.
		var id = rawTopicData.id;
		var title = rawTopicData.title;
		var unreadCommentsCount = rawTopicData.comment_unread;

		return new qiscus.Topic(id, title, unreadCommentsCount);
	});

	return topics;
};

qiscusApiClient.generateMarkTopicAsReadUrl = function(baseUrl, token, topicId) {
	return baseUrl + "/api/v1/mobile/readnotif/" + topicId + "?token=" + token;
};

qiscusApiClient.generateListCommentsUrl = function(baseUrl, token, topicId, lastCommentId) {
	return baseUrl + "/api/v1/mobile/topic/" + topicId + "/comment/" + lastCommentId + "/token/" + token;
}

qiscusApiClient.parseListCommentsResponse = function(response) {
	var comments = _.map(response.results.comments, function(rawCommentData) {
		var id = rawCommentData.id;
		var message = rawCommentData.message;
		var sender = rawCommentData.username_real;
		var dateTime = new Date(rawCommentData.created_at + " GMT"); // Force to GMT/UTC.
		var comment = new qiscus.Comment(id, message, sender, dateTime);

		comment.isAttachment = false;
		// Determine whether the comment is an attachment.
		if (comment.message.substring(0, "[file] ".length) == "[file] ") {
			comment.isAttachment = true;

			// Determine the attachment URI
			var messageLength = comment.message.length;
			var startIndex    = "[file] ".length - 1;
			var endIndex      = messageLength - " [/file]".length;
			comment.attachmentUri = comment.message.substring(startIndex, endIndex);

			comment.isImageAttachment = false;
			// Determine whether the attachment is an image.
			if (comment.message.match(/\.(jpg|gif|png)/i) != null) {
				comment.isImageAttachment = true;
			}
		}

		return comment;
	});

	return comments;
};

qiscusApiClient.parseListCommentsWithImagesResponse = function(commentsWithImages, commentsImages) {
	var commentsWithImagesPair = _.zip(commentsWithImages, commentsImages);

	_.each(commentsWithImagesPair, function(commentWithImagePair) {
		// TODO: Make this make generic so this can be run on Node.
		var attachment = null;
		if (typeof URL !== 'undefined' && URL.createObjectURL)
			attachment = URL.createObjectURL(commentWithImagePair[1].data);

		commentWithImagePair[0].attachment = attachment;
	});
}

qiscusApiClient.generatePostCommentUrl = function(baseUrl, token, topicId, commentMessage) {
	return baseUrl + "/api/v1/mobile/postcomment";
}

qiscusApiClient.parsePostCommentResponse = function(response) {
	var id = response.comment_id;
	var message = response.message;

	return new qiscus.Comment(id, message);
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscusApiClient;
}
