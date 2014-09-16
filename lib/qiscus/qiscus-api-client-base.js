// Declare or get `qiscusApiClient` namespace.
var qiscusApiClient = qiscusApiClient || {};

// Import dependencies
var _ = _ || require('../../assets/components/lodash/dist/lodash');
var qiscus = qiscus || require('./qiscus');

qiscusApiClient.generateListRoomsUrl = function(baseUrl, token) {
	return baseUrl + "/api/v1/mobile/rooms?token=" + token;
};

qiscusApiClient.parseListRoomsResponse = function(response) {
	var rooms = _.map(response.results.rooms, function(rawRoomData) {
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

		return room;
	});

	return rooms;
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscusApiClient;
}
