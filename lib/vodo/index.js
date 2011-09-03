/*
 * VODO index.js - Exposure of API for VOOD
 * 
 * Exports the standard flux API for VODO.
 */

var vodo = require('./vodo'),
	cache = require('../cache'),
	logging = require('../logging')('VODO'),
	errors = require('../errors');

//cache keys
var RAW_PREFIX = 'vodo:raw:';
var SEARCH_PREFIX = 'vodo:search:';
var SEARCH_ONE_PREFIX  = 'vodo:searchOne:';

//Information about this provider.
module.exports.name = 'VODO Films (vodo.net)';

function cacheRawEntries(entries) {
	entries.forEach(function(entry) {
		cache.put(RAW_PREFIX + entry.hash, entry);
	});
}

/**
 * Find out if a torrent is owned by this provider.
 */
module.exports.owns = function(torrent) {
	return torrent.provider === 'VODO';
}

module.exports.search = function(text, callback) {
	logging.searchingProvider();
	if (cache.has(SEARCH_PREFIX + text)) {
		var processedEntries = cache.get(SEARCH_PREFIX + text);
		logging.resultsFromCache(processedEntries.length, text);
		callback(processedEntries);
	}
	else {
		vodo.query(text, function(err, entries) {
			if (err) { callback(err, null); return; }
			
			if (entries.length > 0) {
				logging.foundResults(entries.length, text);
				var processedEntries = vodo.process(entries);
				
				//we must cache the raw entries as well, for locate and source.
				cacheRawEntries(entries);
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
		vodo.query(text, function(err, entries) {
			if (err) { callback(err, null); return; }
			
			if (entries.length > 0) {
				logging.foundResults(entries.length, text);
				entries = entries.slice(0, 1); //only select one.
				var processedEntries = vodo.process(entries);
				
				//must cache raw entry and processed results.
				cacheRawEntries(entries);
				cache.put(SEARCH_ONE_PREFIX + text, processedEntries);
				
				callback(null, processedEntries[0]);
			}
			else {
				logging.noResults(text);
				callback(errors.NO_RESULTS, null);
			}
		});
	}
}

module.exports.locate = function(torrent, callback) {
	logging.sourcingProvider();
	if (cache.has(RAW_PREFIX + torrent.torrentInfo.hash)) {
		var rawEntry = cache.get(RAW_PREFIX + torrent.torrentInfo.hash);
		
		var result = {};
		var sources = {};
		
		sources['vodo.net'] = {
			name: 'vodo.net',
			href: rawEntry.url
		};
		
		result[torrent.torrentInfo.hash] = sources;
		
		logging.foundSources(1, torrent.torrentInfo.hash);
		callback(null, result);
	}
	else {
		callback(errors.SOURCE_NOT_FOUND, null);
	}
}

module.exports.source = function(src, torrent, callback) {
	if (src !== 'vodo.net') {
		callback(errors.SOURCE_NOT_FOUND, null);
		return;
	}
	
	logging.sourcingProvider();
	if (cache.has(RAW_PREFIX + torrent.torrentInfo.hash)) {
		var sources = {};
		var rawEntry = cache.get(RAW_PREFIX + torrent.torrentInfo.hash);
		
		var source = {
			name: 'vodo.net',
			href: rawEntry.url
		};
	
		logging.foundSources(1, torrent.torrentInfo.hash);
		callback(null, source);
	}
	else {
		callback(errors.SOURCE_NOT_FOUND, null);
	}
}
