var assert = require("assert");
var Q      = require("q");
var qiscus = require("../lib/qiscus/qiscus");

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

	it ("should not have the same Rooms when Rooms are reloaded", function() {
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
		user.loadRooms();

		assert.equal(2, user.rooms.length);
		assert.equal(roomOne, user.rooms[0]);
		assert.equal(roomTwo, user.rooms[1]);
	});

	it ("should be able to sort Rooms based on each Room's last active Topic ID", function() {
		var roomOne = new qiscus.Room(1, "One");
		var roomTwo = new qiscus.Room(2, "Two");
		var roomThree = new qiscus.Room(3, "Three");

		var user = new qiscus.User();

		roomOne.setLastTopicAndComment(102, 102);
		roomTwo.setLastTopicAndComment(103, 103);
		roomThree.setLastTopicAndComment(101, 101);

		user.addRoom(roomOne);
		user.addRoom(roomTwo);
		user.addRoom(roomThree);

		user.sortRooms();

		assert.equal(roomTwo, user.rooms[0]);
		assert.equal(roomOne, user.rooms[1]);
		assert.equal(roomThree, user.rooms[2]);
	});

	it ("should set loaded Room's loading flag to true when the loading is done", function(done) {
		// Create Q promises adapter
		var fakePromisesAdapter = {
			all:      Q.all,
			when:     Q.when,
			resolved: Q.resolve,
			rejected: Q.reject,
			deferred: function() {
				var deferred = Q.defer();

				return {
					promise: deferred.promise,
					resolve: deferred.resolve,
					reject:  deferred.reject
				};
			}
		};

		var fakeAgent = {
			'listTopics': function(roomId, callback) {
				// Make sure when the agent is loading the Topics,
				// flag `isBeingLoaded` is set to true.
				assert.equal(roomOne.isBeingLoaded, true);
				callback();
			},
			'listParticipants': function(roomId, callback) {
				// Make sure when the agent is loading the Participants,
				// flag `isBeingLoaded` is set to true.
				assert.equal(roomOne.isBeingLoaded, true);
				callback();
			}
		};

		var roomOne = new qiscus.Room(1, "One");
		var user = new qiscus.User("a@a.com", fakeAgent, fakePromisesAdapter);

		user.addRoom(roomOne);

		// Make sure that currently roomOne is not being loaded.
		assert.equal(roomOne.isBeingLoaded, false);
		user.loadRoom(roomOne.id)
		.then(function() {
			// Make sure that now loading is done.
			assert.equal(roomOne.isBeingLoaded, false);
			done();
		});
	});

	it ("should set loaded Topic's loading flag to true when the loading is done", function(done) {
		// Create Q promises adapter
		var fakePromisesAdapter = {
			all:      Q.all,
			when:     Q.when,
			resolved: Q.resolve,
			rejected: Q.reject,
			deferred: function() {
				var deferred = Q.defer();

				return {
					promise: deferred.promise,
					resolve: deferred.resolve,
					reject:  deferred.reject
				};
			}
		};

		var fakeAgent = {
			'listComments': function(topicId, lastCommentId, callback) {
				// Make sure when the agent is loading the Topics,
				// flag `isBeingLoaded` is set to true.
				assert.equal(topicEleven.isBeingLoaded, true);
				callback();
			}
		};

		var roomOne = new qiscus.Room(1, "One");
		var topicEleven = new qiscus.Topic(11, "Eleven");
		var user = new qiscus.User("a@a.com", fakeAgent, fakePromisesAdapter);

		roomOne.addTopic(topicEleven);
		user.addRoom(roomOne);

		// Make sure that currently topicEleven is not being loaded.
		assert.equal(topicEleven.isBeingLoaded, false);
		user.loadTopic(topicEleven.id)
		.then(function() {
			// Make sure that now loading is done.
			assert.equal(topicEleven.isBeingLoaded, false);
			done();
		});
	});

	it ("should be able to clear its internal data", function() {
		var roomOne = new qiscus.Room(1, "One");
		var roomTwo = new qiscus.Room(2, "Two");
		var roomThree = new qiscus.Room(3, "Three");

		var user = new qiscus.User();

		user.addRoom(roomOne);
		user.addRoom(roomTwo);
		user.addRoom(roomThree);

		// Create another variable that holds reference to the
		// user's Rooms.
		var userRooms = user.rooms;

		// Make sure the length is correct: 3
		assert.equal(user.rooms.length, 3);
		assert.equal(userRooms.length, 3);

		// Start clearing.
		user.clearData();

		// Make sure the length is now equal to 0.
		assert.equal(user.rooms.length, 0);
		assert.equal(userRooms.length, 0);

		// Equally important, make sure that the previous
		// reference is still valid.
		assert.equal(userRooms, user.rooms);
	});

	it ("should be able to receive Comment", function() {
		var roomOne = new qiscus.Room(1, "One");
		var topicEleven = new qiscus.Topic(11, "Eleven");
		var user = new qiscus.User("a@a.com");
		var participant = new qiscus.Participant(1, "a", "a@a.com");
		var comment = new qiscus.Comment(100, "SomeComment", participant);

		roomOne.addTopic(topicEleven);
		user.addRoom(roomOne);

		user.receiveComment(11, comment);

		assert.equal(topicEleven.comments.length, 1);
		assert.equal(topicEleven.comments[0], comment);
	});

	it ("should update last Topic ID and last Comment ID of a Room when receiving new Comment", function() {
		var roomOne = new qiscus.Room(1, "One");
		var topicEleven = new qiscus.Topic(11, "Eleven");
		var topicTwelve = new qiscus.Topic(12, "Twelve");

		var user = new qiscus.User("a@a.com");
		var participant = new qiscus.Participant(1, "a", "a@a.com");
		
		var commentOneHundred = new qiscus.Comment(100, "Comment", participant);
		var commentOneHunderdAndOne = new qiscus.Comment(101, "AnotherComment", participant);

		roomOne.addTopic(topicEleven);
		roomOne.addTopic(topicTwelve);
		user.addRoom(roomOne);

		user.receiveComment(11, commentOneHundred);
		
		assert.equal(roomOne.lastTopicId, 11);
		assert.equal(roomOne.lastCommentId, 100);

		user.receiveComment(12, commentOneHunderdAndOne);

		assert.equal(roomOne.lastTopicId, 12);
		assert.equal(roomOne.lastCommentId, 101);
	});

	it ("should not increase unread count when newly-received comment is from the user itself");

	it ("should not change the selected Topic when selected Room is not changed");

});

describe("Room", function() {
	it("should be able to contain a new Participant", function() {
		var room = new qiscus.Room(1, "One");
		var participant = new qiscus.Participant(1, "SomeParticipant", "someone@somewhere.net");
		assert.equal(room.participants.length, 0);

		room.addParticipant(participant);
		assert.equal(room.participants.length, 1);
	});

	it("should be able to receive existing Participant", function() {
		var room = new qiscus.Room(1, "One");
		var participant = new qiscus.Participant(1, "SomeParticipant", "someone@somewhere.net");

		room.addParticipant(participant);
		assert.equal(room.participants[0], participant);
	});

	it("should not have duplicated Participant", function() {
		var room = new qiscus.Room(1, "One");
		var participant = new qiscus.Participant(1, "SomeParticipant", "someone@somewhere.net");

		room.addParticipant(participant);
		assert.equal(room.participants.length, 1);

		room.addParticipant(participant);
		assert.equal(room.participants.length, 1);
	});
	
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

	it("should not receive duplicated Comment", function() {
		var topic = new qiscus.Topic(10, "TopicNumberTen");
		var commentOne = new qiscus.Comment(100, "SomeComment");
		var commentTwo = new qiscus.Comment(100, "SomeComment");

		topic.addComment(commentOne);
		topic.addComment(commentTwo); // should be ignored.

		assert.equal(1, topic.comments.length);
		assert.equal(commentOne, topic.comments[0]);
	});

	it ("should always have its Comments sorted", function() {
		var topic = new qiscus.Topic(10, "TopicNumberTen");

		var commentOne = new qiscus.Comment(101, "SomeComment");
		var commentTwo = new qiscus.Comment(102, "SomeComment");
		var commentThree = new qiscus.Comment(103, "SomeComment");

		// Adding comments *not* according to order.
		topic.addComment(commentTwo);
		topic.addComment(commentThree);
		topic.addComment(commentOne);

		assert.equal(topic.comments[0], commentOne);
		assert.equal(topic.comments[1], commentTwo);
		assert.equal(topic.comments[2], commentThree);
	});

	it ("should be able to sort pending Comment", function() {
		var topic = new qiscus.Topic(10, "TopicNumberTen");

		var commentOne = new qiscus.Comment(101, "SomeComment");
		var commentTwo = new qiscus.Comment(102, "SomeComment");
		var commentThree = new qiscus.Comment(103, "SomeComment");
		var pendingComment = new qiscus.Comment(-1, "SomeComment");

		// Adding comments *not* according to order.
		topic.addComment(commentTwo);
		topic.addComment(pendingComment);
		topic.addComment(commentThree);
		topic.addComment(commentOne);

		assert.equal(topic.comments[0], commentOne);
		assert.equal(topic.comments[1], commentTwo);
		assert.equal(topic.comments[2], commentThree);
		assert.equal(topic.comments[3], pendingComment);
	});

	it ("should be able to change pending Comment attributes when new valid Comment arrive", function() {
		var topic = new qiscus.Topic(10, "TopicNumberTen");
		
		var pendingComment = new qiscus.Comment(-1, "SomeComment", null, "" + (Date.now() - 100));
		pendingComment.attachUniqueId("abc");
		topic.addComment(pendingComment);

		var validDate = "" + Date.now();
		var validComment = new qiscus.Comment(100, "SomeComment", null, validDate);
		validComment.attachUniqueId("abc");
		topic.addComment(validComment);

		assert.equal(topic.comments.length, 1);
		assert.equal(topic.comments[0], pendingComment);
		assert.equal(pendingComment.id, 100);
		assert.equal(pendingComment.dateTime, validDate);
	});

	it ("should be able to find the first Comment since a specified date", function() {
		var topic = new qiscus.Topic(10, "TopicNumberTen");

		var commentLast = new qiscus.Comment(104, "last", null, new Date("2014-10-16 00:07:55 GMT"));
		var commentLastMinusOne = new qiscus.Comment(103, "last - 1", null, new Date("2014-10-15 23:33:24 GMT"));
		var commentLastMinusTwo = new qiscus.Comment(102, "last - 2", null, new Date("2014-10-14 21:20:14 GMT"));
		var commentLastMinusThree = new qiscus.Comment(101, "last - 3", null, new Date("2014-09-26 07:47:22 GMT"));

		topic.addComment(commentLast);
		topic.addComment(commentLastMinusOne);
		topic.addComment(commentLastMinusTwo);
		topic.addComment(commentLastMinusThree);

		var timezoneOffset = 7;
		assert.equal(topic.getFirstCommentSince(commentLast.dateTime, timezoneOffset), commentLastMinusOne);
		assert.equal(topic.getFirstCommentSince(commentLastMinusTwo.dateTime, timezoneOffset), commentLastMinusTwo);
		assert.equal(topic.getFirstCommentSince(commentLastMinusThree.dateTime, timezoneOffset), commentLastMinusThree);
	});
});
