define(['../app', 'chroma', 'seedrandom', '../qiscus/qiscus-service', '../connectivity/connectivity-service'],
function(app, chroma, seedrandom) {
	app.controller('ChatroomContentController', ['$scope', '$timeout', 'startupTimestamp', 'user', 'connectivityEvent',
		function($scope, $timeout, startupTimestamp, user, connectivityEvent) {
			// Connect model and view.
			$scope.rooms        	= user.rooms;
			$scope.selected     	= user.selected;
			$scope.currentEmail 	= user.email;
			$scope.loadMoreLoading 	= false;

			$scope.selectRoom = function(id, initialTopicId){
				return user.selectRoom(id)
				.then(function() {
					// "Colorize" each participant.
					colorizeParticipants(user.selected.room.id + startupTimestamp,
						user.selected.room.participants);

					// Determine initial Topic to load based on
					// this priority:
					// 1. The initial Topic that user wants to
					//    load.
					// 2. Next alternative: the last active Topic
					//    of the selected Room.
					var topicIdToLoad = initialTopicId ||
						user.selected.room.lastTopicId;
					
					return $scope.selectTopic(topicIdToLoad);
				});
			}

			$scope.selectTopic = function(id){
				return user.selectTopic(id)
				.then(function() {
					return user.markTopicAsRead(id);
				});
			}

			// Handle connectivity event.
			connectivityEvent.addOnlineHandler(function() {
				// Reload all Rooms when we got back our Internet
				// connection.

				// Wait one second to reload. We need to wait a while
				// before reloading because the backend library *might*
				// try to replay our previously-failed requests. In
				// that case, we need to wait for the data source (most
				// likely a server) to be done processing.
				$timeout(function() {
					user.loadRooms()
					.then(function() {
						return $scope.selectRoom(user.selected.room.id,
							user.selected.topic.id);
					});
				}, 1000);
			});

			// Start loading.
			user.loadRooms()
			.then(function(){
				return $scope.selectRoom(user.rooms[0].id);
			});
		}]
	);

	var colorizeParticipants = function(seed, participants) {
		// Define base and range parameters.
		var lightnessBase  =  20;
		var lightnessRange =  30;
		var chromaBase     =  60;
		var chromaRange    =  20;
		var hueBase        =   0;
		var hueRange       = 360;

		// Set the seed, so we can be sure that we get "controlled" random.
		Math.seedrandom(seed);

		// Start colorizing.
		_.each(participants, function(participant) {
			var l = lightnessBase + Math.floor(Math.random() * lightnessRange);
			var c = chromaBase + Math.floor(Math.random() * chromaRange);
			var h = hueBase + Math.floor(Math.random() * hueRange);
			participant.color = chroma.lch(l, c, h).hex();
		});
	};
});
