var assert = require("assert");
var qiscusApiClient = require("../lib/qiscus/qiscus-api-client");

describe("Qiscus API Client", function() {
	it ("should be able to generate proper Qiscus' list rooms API", function() {
		var baseUrl = "http://staging.qisc.us";
		var token = "abcdef";

		var expected = "http://staging.qisc.us/api/v1/mobile/rooms_only?token=abcdef";
		assert.equal(expected, qiscusApiClient.generateListRoomsUrl(baseUrl, token));
	});

	it ("should be able to parse GET rooms' response", function() {
		var response = {"results":[{"id":23,"name":"Qiscustest01room","code":"nzsi","code_en":"q3ef634e4dd7a53c1baa32eff65854c86faqe2","last_message":"iso","count_unread":0,"topics":[[25,"General Discussion","edit your description here",false,0],[26,"Topic title","desc : Topic Description",false,0],[27,"A topic title","desc : topic description",false,0],[28,"Randomtopic1389932652599","desc : Topic Description",false,0],[29,"Randomtopic1389932656118","desc : topic description",false,0],[30,"Randomtopic1389932781636","desc : Topic Description",false,0],[32,"Randomtopic1389933364874","desc : Topic Description",false,0],[117,"Randomtopic1392264373553","desc : Topic Description",false,0],[120,"Randomtopic1392264588288","desc : topic description",false,0],[121,"Randomtopic1392264872963","desc : topic description",false,0],[124,"Randomtopic1392279470049","desc : Topic Description",false,0],[131,"Randomtopic1392626989754","desc : Topic Description",false,0],[134,"Randomtopic1392627093603","desc : Topic Description",false,0]],"last_comment_id":1098,"last_topic_id":25,"last_topic_title":"General Discussion","listtopics":[{"id":25,"title":"General Discussion","desc":"","deleted":false,"count_notif":0},{"id":26,"title":"Topic title","desc":"","deleted":false,"count_notif":0},{"id":27,"title":"A topic title","desc":"","deleted":false,"count_notif":0},{"id":28,"title":"Randomtopic1389932652599","desc":"","deleted":false,"count_notif":0},{"id":29,"title":"Randomtopic1389932656118","desc":"","deleted":false,"count_notif":0},{"id":30,"title":"Randomtopic1389932781636","desc":"","deleted":false,"count_notif":0},{"id":32,"title":"Randomtopic1389933364874","desc":"","deleted":false,"count_notif":0},{"id":117,"title":"Randomtopic1392264373553","desc":"","deleted":false,"count_notif":0},{"id":120,"title":"Randomtopic1392264588288","desc":"","deleted":false,"count_notif":0},{"id":121,"title":"Randomtopic1392264872963","desc":"","deleted":false,"count_notif":0},{"id":124,"title":"Randomtopic1392279470049","desc":"","deleted":false,"count_notif":0},{"id":131,"title":"Randomtopic1392626989754","desc":"","deleted":false,"count_notif":0},{"id":134,"title":"Randomtopic1392627093603","desc":"","deleted":false,"count_notif":0}]},{"id":75,"name":"Test04","code":"swog","code_en":"q3e0401b7bb3e79d6dfefd00d20931b0c32qe2","last_message":"jajal posting","count_unread":0,"topics":[[98,"General Discussion","edit your description here",false,0],[112,"A2","desc : ",false,0],[129,"Wow2","desc : ",false,0],[142,"Wow3","desc : ",false,0],[146,"Files","desc : ",false,0]],"last_comment_id":1096,"last_topic_id":146,"last_topic_title":"Files","listtopics":[{"id":98,"title":"General Discussion","desc":"","deleted":false,"count_notif":0},{"id":112,"title":"A2","desc":"","deleted":false,"count_notif":0},{"id":129,"title":"Wow2","desc":"","deleted":false,"count_notif":0},{"id":142,"title":"Wow3","desc":"","deleted":false,"count_notif":0},{"id":146,"title":"Files","desc":"","deleted":false,"count_notif":0}]},{"id":65,"name":"Test03","code":"svha","code_en":"q3e61511f776e297b1f42ea69a9f337aff1qe2","last_message":"ccmcmcm","count_unread":0,"topics":[[75,"General Discussion","edit your description here",false,0],[90,"Test","desc : ",false,0],[108,"E1","desc : ",false,0],[109,"E2","desc : ",false,0],[110,"E3","desc : ",false,0],[141,"Test lagi","desc : ",false,0]],"last_comment_id":1064,"last_topic_id":75,"last_topic_title":"General Discussion","listtopics":[{"id":75,"title":"General Discussion","desc":"","deleted":false,"count_notif":0},{"id":90,"title":"Test","desc":"","deleted":false,"count_notif":0},{"id":108,"title":"E1","desc":"","deleted":false,"count_notif":0},{"id":109,"title":"E2","desc":"","deleted":false,"count_notif":0},{"id":110,"title":"E3","desc":"","deleted":false,"count_notif":0},{"id":141,"title":"Test lagi","desc":"","deleted":false,"count_notif":0}]},{"id":95,"name":"Test05","code":"igqg","code_en":"q3e8a8d06269bdb73a98f3672aa3f0aed6fqe2","last_message":"tata","count_unread":0,"topics":[[156,"General Discussion","edit your description here",false,0]],"last_comment_id":988,"last_topic_id":156,"last_topic_title":"General Discussion","listtopics":[{"id":156,"title":"General Discussion","desc":"","deleted":false,"count_notif":0}]}]};
		var rooms = qiscusApiClient.parseListRoomsResponse(response);

		assert.equal(4, rooms.length);

		assert.equal("Qiscustest01room", rooms[0].name);
		assert.equal(13, rooms[0].topics.length);
		assert.equal("Topic title", rooms[0].topics[1].title);
		
		assert.equal("Test04", rooms[1].name);
		assert.equal(5, rooms[1].topics.length);
		assert.equal("A2", rooms[1].topics[1].title);
	});

	it ("should be able to generate proper Qiscus' list topics API", function() {
		var baseUrl  = "http://staging.qisc.us";
		var expected = "http://staging.qisc.us/api/v1/mobile/topics";

		assert.equal(expected, qiscusApiClient.generateListTopicsUrl(baseUrl, null, null));
	});

	it ("should be able to parse POST list topics' response", function() {
		var response = {"results":{"rooms":{"id":23,"code_en":"q3ef634e4dd7a53c1baa32eff65854c86faqe2"},"topics":[{"id":25,"title":"General Discussion","comment_unread":0,"unread":[],"deleted":false},{"id":26,"title":"Topic title","comment_unread":0,"unread":[],"deleted":false},{"id":27,"title":"A topic title","comment_unread":0,"unread":[],"deleted":false},{"id":28,"title":"Randomtopic1389932652599","comment_unread":0,"unread":[],"deleted":false},{"id":29,"title":"Randomtopic1389932656118","comment_unread":0,"unread":[],"deleted":false},{"id":30,"title":"Randomtopic1389932781636","comment_unread":0,"unread":[],"deleted":false},{"id":32,"title":"Randomtopic1389933364874","comment_unread":0,"unread":[],"deleted":false},{"id":117,"title":"Randomtopic1392264373553","comment_unread":0,"unread":[],"deleted":false},{"id":120,"title":"Randomtopic1392264588288","comment_unread":0,"unread":[],"deleted":false},{"id":121,"title":"Randomtopic1392264872963","comment_unread":0,"unread":[],"deleted":false},{"id":124,"title":"Randomtopic1392279470049","comment_unread":0,"unread":[],"deleted":false},{"id":131,"title":"Randomtopic1392626989754","comment_unread":0,"unread":[],"deleted":false},{"id":134,"title":"Randomtopic1392627093603","comment_unread":0,"unread":[],"deleted":false}]}};
		var topics = qiscusApiClient.parseListTopicsResponse(response);

		assert.equal(13, topics.length);
		assert.equal("Topic title", topics[1].title);
	});
});