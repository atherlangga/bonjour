define(['../app', 'offline'],
function(app) {
	app.factory('connectivityEvent', ['$rootScope', function($rootScope) {
		var ConnectivityEvent = function() {
			this.onlineHandlers = [];
			this.offlineHandlers = [];
		};

		ConnectivityEvent.prototype.addOnlineHandler = function(handler) {
			this.onlineHandlers.push(handler);
		};

		ConnectivityEvent.prototype.addOfflineHandler = function(handler) {
			this.offlineHandlers.push(handler);
		};

		var connectivityEvent = new ConnectivityEvent();

		Offline.on('up', function() {
			_.each(connectivityEvent.onlineHandlers, function(handler) {
				handler();
			});
			$rootScope.$apply();
		});
		Offline.on('down', function() {
			_.each(connectivityEvent.offlineHandlers, function(handler) {
				handler();
			});
			$rootScope.$apply();
		});
		Offline.options = {checks: {xhr: {url: 'http://www.google.com/favicon.ico'}}};

		return connectivityEvent;
	}]);
});
