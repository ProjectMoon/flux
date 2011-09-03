/*
 * vodo.js - JavaScript API to VODO.
 * 
 * This module provides JavaScript API access to the VODO website.
 * It parses and processes the RSS feed for search results, turning
 * the results into JSON objects.
 */
var jsdom = require('jsdom'),
	querystring = require('querystring'),
	parserutils = require('../parserutils'),
	movieprocessor = require('./movieprocessor');

module.exports.query = function(text, callback) {
	var url = 'http://www.vodo.net/feeds/mrss/promoted';
	var entries = [];
	
	jsdom.env({ html: url, src: [ parserutils.jquery() ], done: function(err, window) {
		if (err) { callback(err, null); return; }
		
		var $ = window.$;
		var rss = $('rss');
		
		rss.find('item').each(function(i, item) {
			var title = $(item).children('title').text();
			
			if (title.toLowerCase().indexOf(text) !== -1) {
				var content = $(item).children('media\\:content');
				
				var url = content.attr('url');
				var height = content.attr('height');
				var width = content.attr('width');
				var fileSize = content.attr('fileSize');
				var bitrate = content.attr('bitrate');
				var duration = content.attr('duration');
				var hash = content.children('media\\:hash').text();
				
				var entry = {
					title: title,
					url: url,
					height: +height,
					width: +width,
					fileSize: fileSize,
					bitrate: bitrate,
					duration: duration,
					hash: hash
				};
				
				entries.push(entry);
			}
		});
		
		callback(null, entries);
	}});
}

module.exports.process = function(entries) {
	var processedEntries = [];
	
	for (var c = 0; c < entries.length; c++) {
		var processedEntry = processEntry(entries[c]);
		processedEntries.push(processedEntry);
	}
	
	return processedEntries;	
}

function processEntry(entry) {
	var processedEntry = {};

	processedEntry.title = entry.title;
	processedEntry.torrentInfo = processTorrentInfo(entry);
	processedEntry.provider = 'VODO';
	
	//process content info based on content type.
	if (movieprocessor.matches(entry)) {
		processedEntry.category = movieprocessor.category;
		processedEntry.contentInfo = movieprocessor.process(entry);
	}
	else {
		processedEntry.category = 'Unknown';
		processedEntry.contentInfo = {};
	}

	return processedEntry;
}

function processTorrentInfo(entry) {
	var info = {};
	
	info.size = entry.fileSize;
	info.seeds = -1; //until a way to get this is found.
	info.peers = -1; //until a way to get this is found.
	info.hash = entry.hash;
		
	return info;
}
