// Declare or get `qiscusApiClient` namespace.
var qiscusApiClient = qiscusApiClient || {};

// Import dependencies
var _ = _ || require('../lodash/lodash');
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

		// Insert also the last active topic ID.
		room.setLastActiveTopicId(rawRoomData.last_comment_topic_id);

		return room;
	});

	return rooms;
};

qiscusApiClient.generateListTopicsUrl = function(baseUrl, token, roomId) {
	return baseUrl + "/api/v1/mobile/topics";
};

qiscusApiClient.parseListTopicsResponse = function(response) {
	var topics = _.map(response.results.topics, function(rawTopicData) {
		// Get the required data for constructing Topic.
		var id = rawTopicData.id;
		var title = rawTopicData.title;

		return new qiscus.Topic(id, title);
	});

	return topics;
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscusApiClient;
}
