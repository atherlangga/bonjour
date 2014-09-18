// Declare or get `qiscusListener` namespace.
var qiscusListener = qiscusListener || {};

// Import dependencies
var _ = _ || require('../lodash/lodash');
var qiscus = qiscus || require('./qiscus');

qiscusListener.handleRoomJoined = (function (roomJoinedData, user) {
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

	user.addRoom(room);

	// Only on this `handleRoomJoined` we need to return
	// value. This needs to be done because all the events
	// listening depend on Room. So, there's a high
	// probability that something needs to be done as soon
	// as possible when there is a new room. The typical
	// scenario is the client code will need to immediately
	// listen to the events of the new room, so the code
	// will need to get the `roomChannel` property of this
	// Room. Therefore, we need to return it.
	return room;
});

qiscusListener.handleRoomLeft = (function (roomLeftData, user) {
	var id = roomLeftData.room_id;

	user.deleteRoom(id);
});

qiscusListener.handleTopicCreated = (function (topicCreatedData, user) {
	var roomId = topicCreatedData.room_id;
	var room = user.getRoom(roomId);

	var topicId = topicCreatedData.topic_id;
	var topicTitle = topicCreatedData.title;
	var newTopic = new qiscus.Topic(topicId, topicTitle);

	room.addTopic(newTopic);
});

qiscusListener.handleTopicDeleted = (function (topicDeletedData, user) {
	var topicId = topicDeletedData.topic_id;
	var room = user.findRoomOfTopic(topicId);

	room.deleteTopic(topicId);
});

// Export this module for CommonJS-compatible library/environment.
if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscusListener;
}
