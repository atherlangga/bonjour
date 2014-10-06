var qiscusPromises = qiscusPromises || {};

/**
 * Promises/A+ adapter for Angular's $q.
 */
qiscusPromises.Angular = function($q) {
	return {
		all:      $q.all,
		when:     $q.when,
		resolved: $q.resolve,
		rejected: $q.reject,
		deferred: function() {
			var deferred = $q.defer();

			return {
				promise: deferred.promise,
				resolve: deferred.resolve,
				reject:  deferred.reject
			};
		}
	}
};
