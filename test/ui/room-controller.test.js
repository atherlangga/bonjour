/*var assert = require("assert");
var room   = require("../src/room/room-controller.js");
var Q      = require("../assets/components/q/q");*/

describe("Room Controller", function() {
	beforeEach(module('bonjour'));
	beforeEach(inject(function($controller, $rootScope) {
	    // Create a new scope that's a child of the $rootScope
	    scope = $rootScope.$new();
	    // Create the controller
	    ctrl = $controller('RoomController', {
	      $scope: scope
	    });
	  }));
	it ("success loading room", function() {
		expect(scope.greeting).toBeEqual("Hello");
	});
});
