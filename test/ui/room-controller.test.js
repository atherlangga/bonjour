/*var assert = require("assert");
var room   = require("../src/room/room-controller.js");
var Q      = require("../assets/components/q/q");*/

describe("Room Controller", function() {
	var user,room1;
	
	beforeEach(module('bonjour'));
	beforeEach(inject(function($controller, $rootScope, $q) {
	    // Create a new scope that's a child of the $rootScope
	    scope = $rootScope.$new();
	    room1 = new qiscus.Room(1,"sesuatu");
		var agent = {
			listRooms:function(){
				return [room1]
			}
		}
	    var promiseAdapter = new qiscusPromises.Angular($q);
	    user = new qiscus.User("y@qiscus.com",agent,promiseAdapter);
	    // Create the controller
	    ctrl = $controller('RoomController', {
	      $scope: scope,
	      user:user
	    });
	  }));

	it ("success loading room", function() {
		expect(scope.rooms).toBeDefined();
		expect(scope.rooms).toEqual([]);
	});

	it ("check user to be defined", function(){
		user.rooms.push(room1);
		expect(scope.rooms).toEqual([room1]);
	})
});
