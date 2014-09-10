var assert = require("assert");
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

		var r = new RoomLoader();
		var user = new qiscus.User(new RoomLoader());

		user.loadRooms();

		assert.equal(2, user.rooms.length);
		assert.equal(roomOne, user.rooms[0]);
		assert.equal(roomTwo, user.rooms[1]);
	});
});
