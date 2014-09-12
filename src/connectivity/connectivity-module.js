angular.module('connectivityModule')
.factory('connectivityEvent', function() {
	var ConnectivityEvent = function() {
		this.onlineHandlers = [];
		this.offlineHandlers = [];
	};

	ConnectivityEvent.prototype.addOnlineHandler = function(handler) {
		this.onlineHandlers.push(handler);

		// Give a chance to the handler to execute the first time.
		if (window.onLine === true) {
			handler();
		}
	};

	ConnectivityEvent.prototype.addOfflineHandler = function(handler) {
		this.offlineHandlers.push(handler);

		// Give a chance to the handler to execute the first time.
		if (window.onLine === false) {
			handler();
		}
	};

	var connectivityEvent = new ConnectivityEvent();

	// We're gonna use OfflineJS as our backend.
	// So, we register its onLineHandler to our connectivityEvent, ..
	window.onLineHandler = function() {
		_.each(connectivityEvent.onlineHandlers, function(handler) {
			handler();
		});
	};

	// .. and also its offLineHandler, ..
	window.offLineHandler = function() {
		_.each(connectivityEvent.offlineHandlers, function(handler) {
			handler();
		});
	};

	// ..and we can also define our own check URL here.
	//window.onLineURL = "http://staging.qisc.us";

	return connectivityEvent;
})
;
