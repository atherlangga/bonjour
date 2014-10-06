var qiscusPromises = qiscusPromises || {};

/**
 * Promises/A+ adapter for Q.
 */
qiscusPromises.Q = function(Q) {
	return {
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
	}
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = qiscusPromises;
}
