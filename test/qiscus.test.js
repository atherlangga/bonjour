var assert = require("assert");
var qiscus = require("../lib/qiscus/qiscus");
var Q      = require("../lib/q/q");

describe("User", function() {
	it ("won't have Room when first instantiated", function() {
		var user = new qiscus.User();
		assert.equal(0, user.rooms.length);
	});

	it ("can retrieve added Room", function() {
		var newRoom = new qiscus.Room(1, "One");
		var user = new qiscus.User();
		user.addRoom(newRoom);
		
		assert.equal(newRoom, user.getRoom(1));
	});

	it ("is able to delete existing Room", function () {
		var user = new qiscus.User();
		var room = new qiscus.Room(1, "One");
		user.addRoom(room);

		// Check the room is indeed being added.
		assert.equal(1, user.rooms.length);

		user.deleteRoom(room.id);

		assert.equal(0, user.rooms.length);
	});

	it ("is able to find room which a certain topic Id is contained", function() {
		var someRoom = new qiscus.Room(1, "One");
		var someTopic = new qiscus.Topic(10, "OneTen");
		var user = new qiscus.User();

		someRoom.addTopic(someTopic);
		user.addRoom(someRoom);

		// Make sure that the Room's topics count is 1
		assert.equal(1, someRoom.topics.length);

		var roomOne = user.findRoomOfTopic(10);

		assert.equal(roomOne, someRoom);
	});

	it ("won't receive new Room with the same existing ID", function() {
		var user = new qiscus.User();
		var oldRoom = new qiscus.Room(1, "One");
		var newRoom = new qiscus.Room(1, "Another one");

		user.addRoom(oldRoom);
		user.addRoom(newRoom); // This should be ignored

		assert.equal(1, user.rooms.length);
		assert.equal(oldRoom, user.getRoom(1));
	});

	it ("will receive all Rooms that successfully loaded by room loader", function() {
		// Prepare the fake Room to be returned.
		var roomOne = new qiscus.Room(1, "One");
		var roomTwo = new qiscus.Room(2, "Two");

		// Create the fake loader.
		var RoomLoader = function(){
		};
		RoomLoader.prototype.listRooms = function(onSuccess, onFailure) {
			onSuccess([roomOne, roomTwo]);
		};

		// Create partial Q promises adapter
		var promisesAdapter = {};
		promisesAdapter.deferred = function() {
			var deferred = Q.defer();
			return {
				promise: deferred.promise,
				resolve: deferred.resolve,
				reject : deferred.reject
			};
		}

		var r = new RoomLoader();
		var user = new qiscus.User("a@a.com", new RoomLoader(), promisesAdapter);

		user.loadRooms();

		assert.equal(2, user.rooms.length);
		assert.equal(roomOne, user.rooms[0]);
		assert.equal(roomTwo, user.rooms[1]);
	});
});

describe("Room", function() {
	it("should be able to contain a new Participant");
	it("should be able to receive existing Participant");
	it("should not have duplicated Participant");
	
	it("should be able to contain a new topic", function() {
		var room = new qiscus.Room(1, "One");
		assert.equal(0, room.topics.length);

		var topic = new qiscus.Topic(10, "OneTen");
		room.addTopic(topic);
		assert.equal(1, room.topics.length);
	});


	it("should be able to get an existing topic", function() {
		var room = new qiscus.Room(1, "One");
		assert.equal(0, room.topics.length);

		var topic = new qiscus.Topic(10, "OneTen");
		room.addTopic(topic);
		assert.equal(topic, room.getTopic(topic.id));
	});

	it("should be able to delete topic based on its ID", function() {
		var room = new qiscus.Room(1, "One");
		var topic = new qiscus.Topic(10, "OneTen");

		room.addTopic(topic);
		assert.equal(1, room.topics.length);

		room.deleteTopic(topic.id);
		assert.equal(0, room.topics.length);
	});

	it ("should not be able to receive room with the same ID", function() {
		var room = new qiscus.Room(1, "One");
		
		var topic = new qiscus.Topic(10, "OneTen");
		room.addTopic(topic);
		assert.equal(1, room.topics.length);

		var topic = new qiscus.Topic(10, "OneTen");
		room.addTopic(topic);
		assert.equal(1, room.topics.length);
	});
});

describe("Topic", function() {
	it("should be able to receive Comment", function() {
		var topic = new qiscus.Topic(10, "TopicNumberTen");
		var comment = new qiscus.Comment(100, "SomeComment");

		topic.addComment(comment);

		assert.equal(1, topic.comments.length);
		assert.equal(comment, topic.comments[0]);
	});
});
