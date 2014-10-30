// Declare or get `qiscusListener` namespace.
var qiscusListener = qiscusListener || {};

// Import dependencies
var _ = _ || require('lodash');
var qiscus = qiscus || require('./qiscus');

qiscusListener.handleRoomJoined = function (roomJoinedData, user) {
	// Get the required data for constructing Room.
	var id = roomJoinedData.id;
	var name = roomJoinedData.name;

	// Generate all the Topics.
	var topics = _.map(roomJoinedData.listtopics, function(rawTopicData) {
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
	room.channelCode = roomJoinedData.code_en;

	// Set the last Topic ID and Comment ID.
	room.setLastTopicAndComment(
		roomJoinedData.last_topic_id,
		roomJoinedData.last_comment_id);

	// Finally, add the Room, ..
	user.addRoom(room);

	// .. and sort all the Rooms.
	user.sortRooms();

	// Oh, almost forget. Let's preload the new Room.
	user.loadRoom(room.id)
	.then(function() {
		user.loadTopic(room.lastTopicId);
	});
};

qiscusListener.handleRoomLeft = function (roomLeftData, user) {
	var id = roomLeftData.room_id;
	user.deleteRoom(id);
};

qiscusListener.handleTopicCreated = function (topicCreatedData, user) {
	var roomId = topicCreatedData.room_id;
	var room = user.getRoom(roomId);

	var topicId = topicCreatedData.topic_id;
	var topicTitle = topicCreatedData.title;
	var newTopic = new qiscus.Topic(topicId, topicTitle);

	room.addTopic(newTopic);
};

qiscusListener.handleTopicDeleted = function (topicDeletedData, user) {
	var topicId = topicDeletedData.topic_id;
	var room = user.findRoomOfTopic(topicId);

	room.deleteTopic(topicId);
};

qiscusListener.handleTopicMarkedAsRead = function (topicMarkedAsRead, user) {
	var roomId  = topicMarkedAsRead.room_id;
	var topicId = topicMarkedAsRead.topic_id;

	var room = user.getRoom(roomId);
	if (room) {
		var topic = room.getTopic(topicId);
		topic.markAsRead();
	}
}

qiscusListener.handleCommentPosted = function(commentPostedData, user) {
	var topicId = commentPostedData.topic_id;
	var room    = user.findRoomOfTopic(topicId);

	// There might be a scenario where the Room is not loaded for this
	// `topicId`. In that case, we'll ignore this event. However, we
	// can rely on `handleIncomingMessage` to load the new message.
	if (room) {
		var commentId = commentPostedData.comment_id;
		var message = commentPostedData.real_comment;
		var sender = room.getParticipant(commentPostedData.username_real);
		var date = new Date(commentPostedData.created_at);	
		var uniqueId = commentPostedData.unique_id;

		var newComment = new qiscus.Comment(commentId, message, sender, date);
		newComment.attachUniqueId(uniqueId);

		user.receiveComment(topicId, newComment);
	}
};

qiscusListener.handleIncomingMessage = function(incomingMessageData, user) {
	var roomId  = incomingMessageData.room_id;
	var topicId = incomingMessageData.topic_id;

	var shouldLoadRoom  = false;
	var shouldLoadTopic = false;

	// Determine whether we need to load Room and Topic based on the currently
	// selected Room and Topic.
	if (user.selected.room == null || user.selected.room.id != roomId) {
		shouldLoadRoom = true;
	}
	if (user.selected.topic == null || user.selected.topic.id != topicId) {
		shouldLoadTopic = true;
	}

	// Now, let's act based on decision made before.
	if (shouldLoadRoom && shouldLoadTopic) {
		user.loadRoom(roomId)
		.then(function() {
			user.loadTopic(topicId);
		});
	}
	else if (!shouldLoadRoom && shouldLoadTopic) {
		user.loadTopic(topicId);
	}
}

// Export this module for CommonJS-compatible library/environment.
if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscusListener;
}
