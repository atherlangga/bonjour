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

	it ("should be able to generate proper Qiscus' list people API", function() {
		var baseUrl  = "http://staging.qisc.us";
		var expected = "http://staging.qisc.us/api/v1/mobile/listPeople?token=PP5H4HUz7UaiTBfyobzW&room_id=65";

		assert.equal(expected, qiscusApiClient.generateListParticipantsUrl(baseUrl, "PP5H4HUz7UaiTBfyobzW", 65));
	});

	it ("should be able to parse GET list people API", function() {
		var response = {"results":{"people":[{"id":1,"username":"evnpr2","email":"evanpurnama5@gmail.com","avatar":"https://www.qisc.us/images/default-avatar.png"},{"id":20,"username":"evnpr","email":"evanpurnama5@gmailtop.com","avatar":"https://qiscus.s3.amazonaws.com/uploads/396818874fd4b96d1b7272e07fd9720d/Screen_Shot_2014-02-20_at_10.31.09_AM.png"},{"id":22,"username":"QiscusTest01","email":"qiscustest01@dispostable.com","avatar":"https://www.qisc.us/images/default-avatar.png"}]}};
		var avatars = {'1': 'avatar1', '20': 'avatar2', '22': 'avatar3'};
		var participants = qiscusApiClient.parseListParticipantsResponse(response, avatars);

		assert.equal(3, participants.length);
		assert.equal(22, participants[2].id);
		assert.equal("QiscusTest01", participants[2].username);
		assert.equal("qiscustest01@dispostable.com", participants[2].email);
		assert.equal("avatar3", participants[2].avatar);
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

	it ("should be able to generate proper Qiscus' list comments URL", function () {
		var baseUrl = "http://staging.qisc.us";
		var expected = "http://staging.qisc.us/api/v1/mobile/topic/123/comment/456/token/abcd1234";

		assert.equal(expected, qiscusApiClient.generateListCommentsUrl(baseUrl, "abcd1234", 123, 456))
	});

	it ("should be able to parse GET comments' response", function() {
		var response = {"results":{"comments":[{"id":1210,"message":"Test","username_as":"QiscusTest01","username_real":"qiscustest01@dispostable.com","created_at":"2014-09-25 08:56:01","deleted":false},{"id":1209,"message":"Test","username_as":"QiscusTest01","username_real":"qiscustest01@dispostable.com","created_at":"2014-09-25 08:54:19","deleted":false},{"id":1208,"message":"Test","username_as":"QiscusTest01","username_real":"qiscustest01@dispostable.com","created_at":"2014-09-25 08:52:40","deleted":false},{"id":1064,"message":"ccmcmcm","username_as":"evnpr2","username_real":"evanpurnama5@gmail.com","created_at":"2014-05-22 07:36:00","deleted":false},{"id":1063,"message":"famcmcmcmc","username_as":"evnpr2","username_real":"evanpurnama5@gmail.com","created_at":"2014-05-22 07:35:58","deleted":false},{"id":1062,"message":"fsafaf","username_as":"evnpr2","username_real":"evanpurnama5@gmail.com","created_at":"2014-05-22 07:34:16","deleted":false},{"id":1061,"message":"qewkl","username_as":"evnpr2","username_real":"evanpurnama5@gmail.com","created_at":"2014-05-22 07:34:10","deleted":false},{"id":1060,"message":"qiscusqiscus123","username_as":"evnpr","username_real":"evanpurnama5@gmailtop.com","created_at":"2014-04-29 03:14:07","deleted":false},{"id":1059,"message":"user name: jeilerman","username_as":"evnpr","username_real":"evanpurnama5@gmailtop.com","created_at":"2014-04-29 03:13:36","deleted":false},{"id":1058,"message":"refreshed","username_as":"evnpr","username_real":"evanpurnama5@gmailtop.com","created_at":"2014-04-29 03:12:04","deleted":false},{"id":1057,"message":"okk","username_as":"evnpr","username_real":"evanpurnama5@gmailtop.com","created_at":"2014-04-29 03:11:50","deleted":false},{"id":1056,"message":"can refresh ?","username_as":"evnpr2","username_real":"evanpurnama5@gmail.com","created_at":"2014-04-29 03:11:46","deleted":false},{"id":1055,"message":"hmm strange","username_as":"evnpr2","username_real":"evanpurnama5@gmail.com","created_at":"2014-04-29 03:11:43","deleted":false},{"id":1054,"message":"but seems you offline","username_as":"evnpr2","username_real":"evanpurnama5@gmail.com","created_at":"2014-04-29 03:11:40","deleted":false},{"id":1053,"message":"I am calling","username_as":"evnpr2","username_real":"evanpurnama5@gmail.com","created_at":"2014-04-29 03:11:36","deleted":false},{"id":1052,"message":"bro?","username_as":"evnpr","username_real":"evanpurnama5@gmailtop.com","created_at":"2014-04-29 03:11:34","deleted":false},{"id":1051,"message":"i wait","username_as":"evnpr","username_real":"evanpurnama5@gmailtop.com","created_at":"2014-04-29 03:10:38","deleted":false},{"id":1050,"message":"haha okk evan you call","username_as":"evnpr","username_real":"evanpurnama5@gmailtop.com","created_at":"2014-04-29 03:10:36","deleted":false},{"id":1049,"message":"okays back in","username_as":"evnpr","username_real":"evanpurnama5@gmailtop.com","created_at":"2014-04-29 03:09:32","deleted":false},{"id":1048,"message":"you there bro ?","username_as":"evnpr","username_real":"evanpurnama5@gmailtop.com","created_at":"2014-04-29 03:07:03","deleted":false}]}};
		var comments = qiscusApiClient.parseListCommentsResponse(response);

		assert.equal(20, comments.length);
		assert.equal("Test", comments[0].message);
		assert.equal("ccmcmcm", comments[3].message);
	});
});