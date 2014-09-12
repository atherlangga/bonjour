var assert = require("assert");
var qiscus = require("../lib/qiscus/qiscus");
var qiscusListener = require("../lib/qiscus/qiscus-listener-base");

describe("Qiscus Listener", function() {
	
	it("should be able to handle Room Joined event", function() {
		var eventData = {"id":187,"name":"Test10","code":"thef","code_en":"q3e1225ee3a4184e815f4a6eb02fdae6625qe2","last_message":"welcome to Test10","count_unread":0,"topics":[[268,"General Discussion","edit your description here",false,0]],"last_comment_id":1180,"last_topic_id":268,"last_topic_title":"General Discussion","listtopics":[{"id":268,"title":"General Discussion","desc":"","deleted":false,"count_notif":0}]};
		var user = new qiscus.User();

		qiscusListener.handleRoomJoined(eventData, user);

		assert.equal(1, user.rooms.length);
		assert.equal(187, user.rooms[0].id);
		assert.equal("Test10", user.rooms[0].name);
	});

	it("should be able to handle Room Left event", function() {
		var someRoom = new qiscus.Room(187, "NameDoesntMatter");
		var user = new qiscus.User();
		user.addRoom(someRoom);

		// Make sure user have 1 room by now.
		assert.equal(1, user.rooms.length);
		
		var eventData = {"room_id":187,"timestamp":1410482397956,"event":"deleteRoom"};

		qiscusListener.handleRoomLeft(eventData, user);

		// Make sure the room has been deleted.
		assert.equal(0, user.rooms.length);
	});

	it("should be able to handle Topic Created event", function() {
		var someRoom = new qiscus.Room(95, "NameDoesntMatter");
		var user = new qiscus.User();
		user.addRoom(someRoom);

		// Make sure that the Room's topics count is 0
		assert.equal(0, someRoom.topics.length);

		var eventData = {"topic_id":271,"title":"Three","description":"desc : ","room_id":95,"timestamp":1410491101249,"event":"newtopic"};

		qiscusListener.handleTopicCreated(eventData, user);

		// Make sure that now, the Room's topics count is 1
		assert.equal(1, someRoom.topics.length);
	});

	it ("should be able to handle Topic Deleted event", function() {
		var someRoom = new qiscus.Room(95, "NameDoesntMatter");
		var someTopic = new qiscus.Topic(271, "TitleDoesntMatter");
		var user = new qiscus.User();

		someRoom.addTopic(someTopic);
		user.addRoom(someRoom);

		// Make sure that the Room's topics count is 1
		assert.equal(1, someRoom.topics.length);

		var eventData = {"topic_id":271,"timestamp":1410491485941,"event":"deleteTopic"};

		qiscusListener.handleTopicDeleted(eventData, user);

		// Make sure that now, the Room's topics count is 0
		assert.equal(0, someRoom.topics.length);
	});
});
