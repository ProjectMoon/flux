/*
 * resultsparser.js - parse torrentz.eu results pages.
 * 
 * This file takes care of screen scraping information from torrentz.eu
 * results pages and turning them into friendly flux sources, which can
 * then be used to download torrent files.
*/
var jsdom = require('jsdom'),
	parserutils = require('../parserutils'),
	errors = require('../errors'),
	cfg = require('../config').cfg,
	logging = require('../logging')('Torrentz');

/**
 * Go to the results page for the given torrent hash and find all sources
 * on the page. Will ignore any sources specified by configuration. The
 * callback receives an error object and the list of sources.
 */
module.exports.parse = function parse(hash, callback) {
	var url = 'http://torrentz.eu/' + hash;
	var sources = {};
	
	jsdom.env({ html: url, src: [ parserutils.jquery() ], done: function(err, window) {
		if (err) { callback(err, null);	return; }
		var $ = window.$;
		
		var downloads = $('div.download');
		
		downloads.find('dl').each(function(i, dl) {
			var ageText = $(dl).find('dd').text();
			if (ageText !== 'Sponsored Link') {
				var sourceName = $(dl).find('dt a span.u').text();
				
				if (cfg.ignoredSources.indexOf(sourceName) === -1) {
					var href = $(dl).find('dt a').attr('href');
					
					sources[sourceName] = {
						name: sourceName,
						href: href
					};
				}
			}
		});
		
		if (Object.keys(sources).length > 0) {
			logging.foundSources(Object.keys(sources).length, hash);
			
			var result = {};
			result[hash] = sources;
			callback(null, result);
		}
		else {
			logging.noSources(hash);
			callback(errors.SOURCE_NOT_FOUND, null);
		}
	}});
}

/**
 * Go to the torrentz.eu results page for the given torrent hash and see
 * if the specified site (source name) is available. If it is, return
 * that single source. Callback receives error and a single source.
 */
module.exports.parseOne = function parse(site, hash, callback) {
	var url = 'http://torrentz.eu/' + hash;
	var sources = {};
	
	jsdom.env({ html: url, src: [ parserutils.jquery() ], done: function(err, window) {
		if (err) { callback(err, null); return; }
		var $ = window.$;
		
		var found = false;
		var downloads = $('div.download');
		
		downloads.find('dl').each(function(i, dl) {
			var sourceName = $(dl).find('dt a span.u').text();
			
			if (sourceName === site && cfg.ignoredSources.indexOf(sourceName) === -1) {
				logging.foundSources(1, hash);
				found = true;
				var href = $(dl).find('dt a').attr('href');
				
				callback(null, {
					name: sourceName,
					href: href
				});
				
				return false;
			}
		});
		
		if (!found) {
			logging.noSources(hash);
			callback(errors.SOURCE_NOT_FOUND, null);
		}
	}});
}
