/*
 * cache.js - Store search results in a cache.
 * 
 * Keep search results from torrentz.eu here, so we don't have to
 * continuously hit the site for new results.
 */
var cache = {};

/**
 * Does the cache have something?
 */
module.exports.has = function(search) {
	if (typeof cache[search] !== 'undefined') {
		return true;
	}
	else {
		return false;
	}
}

/**
 * Retrieve from the cache.
 */
module.exports.get = function(search) {
	if (module.exports.has(search)) {
		return cache[search];
	}
	else {
		return null;
	}
}

/**
 * Put something in the cache.
 */
module.exports.put = function(search, results) {
	cache[search] = results;
}

/**
 * Clear the cache. Currently not exposed or used.
 */
module.exports.clear = function() {
	cache = {};
	entries = 0;
}
