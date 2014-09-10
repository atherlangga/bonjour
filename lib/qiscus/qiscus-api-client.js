var qiscusApiClient = (function() {
	'use strict';
	var QiscusApiClient = function($http, baseUrl, token) {
		this.$http  = $http;
		this.baseUrl = baseUrl;
		this.token = token;
	};

	QiscusApiClient.prototype.listRooms = function(onSuccess, onFailure) {
		var url = this.baseUrl + "/api/v1/mobile/rooms?token=" + this.token;

		this.$http.get(url).success(function(response) {
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

				return room;
			});
			onSuccess(rooms);
		});
	};

	return {
		QiscusApiClient: QiscusApiClient
	}

})();
