/*
 * torrentz.eu index.js - Exposure of API for Torrentz.
 * 
 * Exports standard flux API for torrentz.eu.
 */
var	torrentz = require('./torrentz'),
	resultparser = require('./resultparser'),
	cache = require('../cache'),
	errors = require('../errors'),
	logging = require('../logging')('Torrentz');

//cache keys
var SEARCH_PREFIX = 'torrentz:search:';
var SEARCH_ONE_PREFIX = 'torrentz:searchOne:';

//Information about this provider.
module.exports.name = 'Torrentz (torrentz.eu)';

/**
 * Find out if a torrent is owned by this provider.
 */
module.exports.owns = function(torrent) {
	return torrent.provider === 'Torrentz';
}

/**
 * Search for torrents. Attempts to pull from cache first, then hits
 * torrentz.eu RSS feed. Callback receives error and torrent result
 * list (JSON-ified!).
 */
module.exports.search = function(text, callback) {
	logging.searchingProvider();
	
	if (cache.has(text)) {
		var processedEntries = cache.get(SEARCH_PREFIX + text);
		logging.resultsFromCache(processedEntries.length, text);
		callback(cache.get(SEARCH_PREFIX + text));
	}
	else {
		torrentz.query(text, function(err, entries) {
			if (err) { callback(err, null); return; }
			
			if (entries.length > 0) {
				logging.foundResults(entries.length, text);
				var processedEntries = torrentz.process(entries);
				cache.put(SEARCH_PREFIX + text, processedEntries);
				callback(null, processedEntries);
			}
			else {
				logging.noResults(text);
				cache.put(SEARCH_PREFIX + text, []);
				callback(errors.NO_RESULTS, null);
			}
		});
	}
}

/**
 * Find a single torrent file for the given search text. Does the same
 * thing as search() except returns a single result rather than a list.
 */
module.exports.find = function(text, callback) {
	//we always operate on a list, so the callback receives
	//index 0.
	logging.searchingProvider();
	
	if (cache.has(SEARCH_ONE_PREFIX + text)) {
		var processedEntries = cache.get(SEARCH_ONE_PREFIX + text);
		
		if (processedEntries.length > 0) {
			logging.resultsFromCache(1, text);
			callback(null, cache.get(SEARCH_ONE_PREFIX + text)[0]);
		}
		else {
			logging.noResultsFromCache(text);
			callback(errors.NO_RESULTS, null);
		}
	}
	else {
		torrentz.query(text, function(err, entries) {
			if (err) { callback(err, null); return; }
			
			if (entries.length > 0) {
				logging.foundResults(entries.length, text);
				entries = entries.slice(0, 1); //only select one.
				var processedEntries = torrentz.process(entries);
				cache.put(SEARCH_ONE_PREFIX + text, processedEntries);
				callback(null, processedEntries[0]);
			}
			else {
				logging.noResults(text);
				cache.put(SEARCH_ONE_PREFIX + text, []);
				callback(errors.NO_RESULTS, null);
			}
		});
	}
}

/**
 * Locate sources for a torrent result or hash (string) via torrentz.eu. 
 * Callback receives an error and the list of sources.
 */
module.exports.locate = function(torrent, callback) {
	logging.sourcingProvider();
	
	if (typeof torrent.torrentInfo !== 'undefined') {
		var hash = torrent.torrentInfo.hash;
	}
	else {
		callback(errors.NULL_PARAMETER, null);
		return;
	}
	
	resultparser.parse(hash, callback);
}

/**
 * Finds a single source for a torrent result or hash via torrentz.eu.
 * Callback receives an error and the found source.
 */
module.exports.source = function(src, torrent, callback) {
	logging.sourcingProvider();
	
	if (typeof torrent.torrentInfo !== 'undefined') {
		var hash = torrent.torrentInfo.hash;
	}
	else {
		callback(errors.NULL_PARAMETER, null);
		return;
	}
	
	
	resultparser.parseOne(src, hash, callback);	
}
