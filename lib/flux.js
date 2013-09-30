/*
 * flux.js - Main entry point to the node.js flux module.
 * 
 * See README.md for information and examples. See CONTRIBUTNING.md for
 * instructions on how to contribute to this project.
 *
 * Licensed under the LGPL v3 license.
 */
var	async = require('async'),
	torrentz = require('./torrentz'),
	vodo = require('./vodo'),
	downloaders = require('./downloaders'),
	errors = require('./errors'),
	config = require('./config');

//Export default providers.
module.exports.torrentz = torrentz;
module.exports.vodo = vodo;

/**
 * Configure flux.
 */
module.exports.configure = function(fluxConfig) {
	config.configure(fluxConfig);
}

/**
 * Search for torrents on all configured providers. Callback receives
 * error and torrent result list (JSON-ified!).
 */
module.exports.search = function(text, callback) {
	var processedEntries = [];
	var providers = config.cfg.providers;
	var tasks = [];
	
	for (var c = 0; c < providers.length; c++) {
		with ({ provider: providers[c] }) {
			tasks.push(function(cb) {
				provider.search(text, function(err, torrents) {
					cb(err, torrents);
				});
			});
		}
	}
	
	async.parallel(tasks, function(err, resultList) {
		//resultList is a list of lists (each entry in the main list being
		//a list of results from a provider), so we must merge them into
		//one big list
		var torrents = [];
		for (var c = 0; c < resultList.length; c++) {
			torrents = torrents.concat(resultList[c]);
		}
		callback(err, torrents);
	});
}

/**
 * Find the top torrent file for the given search text from each provider.
 * Returns a list of results.
 */
module.exports.find = function(text, callback) {
	var processedEntries = [];
	var providers = config.cfg.providers;
	var tasks = [];
	
	for (var c = 0; c < providers.length; c++) {
		with ({ provider: providers[c] }) {
			tasks.push(function(cb) {
				provider.find(text, function(err, torrent) {
					cb(err, torrent);
				});
			});
		}
	}
	
	async.parallel(tasks, function(err, torrents) {
		if (torrents && torrents.length > 0) {
			callback(err, torrents);
		}
		else {
			callback(err, null);
		}
	});
}

/**
 * Locate sources for a torrent result or a list of torrent results.
 * Callback receives an error and the list of sources.
 */
module.exports.locate = function(torrents, callback) {
	//torrents can be a single torrent or a list of torrents.
	var processedEntries = [];
	var providers = config.cfg.providers;
	var tasks = [];
	
	//Force into array for single results.
	if (!torrents.length) {
		torrents = [ torrents ];
	}
	
	for (var c = 0; c < providers.length; c++) {	
		for (var x = 0; x < torrents.length; x++) {
			with ({ provider: providers[c], torrent: torrents[x] }) {
				tasks.push(function(cb) {
					//only bother to look at the provider's own torrents.
					//saves requests to the websites.
					if (provider.owns(torrent)) {
						provider.locate(torrent, function(err, sources) {
							//skip over no sources error for multiple providers.
							if (err && providers.length > 1 && err === errors.SOURCE_NOT_FOUND) {
								cb(null, {});
							}
							else {
								cb(err, sources);
							}
						});
					}
					else {
						cb(null, {});
					}
				});
			}
		}
	}
	
	async.parallel(tasks, function(err, results) {
		//async returns a list, so we need to flatten it out so hash => sources.
		var flattened = {};
		for (var c = 0; c < results.length; c++) {
			var currResult = results[c];
			
			for (hash in currResult) {
				flattened[hash] = currResult[hash];
			}
		}
		callback(err, flattened);
	});
}

/**
 * Finds a single source for a torrent result or list of results.
 * Callback receives an error and the found source.
 */
module.exports.source = function(src, torrents, callback) {
	//torrent can be a single torrent or a list of torrents.
	var processedEntries = [];
	var providers = config.cfg.providers;
	var tasks = [];
	
	//Force into array for single results.
	if (!torrents.length) {
		torrents = [ torrents ];
	}
	
	for (var c = 0; c < providers.length; c++) {
		with ({ provider: providers[c] }) {
			tasks.push(function(cb) {				
				for (var x = 0; x < torrents.length; x++) {
					provider.source(src, torrents[x], function(err, sources) {
						//skip over no sources error for multiple providers.
						if (err && providers.length > 1 && err === errors.SOURCE_NOT_FOUND) {
							cb(null, {});
						}
						else {
							cb(err, sources);
						}
					});
				}
			});
		}
	}
	
	async.parallel(tasks, function(err, sources) {
		if (sources && sources.length > 0) {
			console.log('sources are');
			console.log(sources[0]);
			callback(err, sources[0]);
		}
		else {
			callback(err, null);
		}
	});
}

/**
 * Download a torrent. This function takes either a torrent result or
 * a source for a torrent. If given a torrent result, it will download
 * from the first working source. If given a source, it will attempt
 * to download it directly. The torrent will be saved to the given file
 * name in the configured save directory.
 */
module.exports.fetch = function(torrentOrSource, filename, callback) {
	if (torrentOrSource === null) {
		callback(errors.NULL_PARAMETER, null);
		return;
	}
	
	if (typeof torrentOrSource.source !== 'undefined') {
		//operating directly on a torrent source
		if (downloaders.canDownloadFrom(source)) {
			var dlfunc = downloaders.createDownloader(source.href, filename);
			
			dlfunc(function(err) {
				callback(err);
			});
			
			return;
		}
		else {
			callback(errors.NO_SOURCES);
		}
	}
	else if (typeof torrentOrSource.torrentInfo !== 'undefined') {
		//operating on a torrent result. must get torrent source info first.
		module.exports.locate(torrentOrSource, function(err, results) {
			if (err) { callback(err); return; }
			
			var sources = results[torrentOrSource.torrentInfo.hash];
			
			for (sourcename in sources) {
				if (downloaders.canDownloadFrom(sourcename)) {
					var dlfunc = downloaders.createDownloader(sources[sourcename], filename);
					
					dlfunc(function(err) {
						callback(err);
					});
					
					return;
				}
			}
			
			//if all sources have failed, error.
			callback(errors.NO_SOURCES);
		});
	}
}

/**
 * The fastest way to get a torrent file downloaded. This function will
 * download the top result for the query from the first working source
 * and save it to the specified save directory. The filename will be
 * set to the query + ".torrent".
 */
module.exports.acquire = function(query, callback) {
	module.exports.find(query, function(err, torrents) {
		if (err) { callback(err, null); return; }
		
		module.exports.fetch(torrents[0], query + '.torrent', callback);
	});
}
