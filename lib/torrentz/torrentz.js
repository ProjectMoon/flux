/*
 * torrentz.js - JavaScript API to the torrentz.eu search engine.
 * 
 * This module provides JavaScript API access to the torrentz.eu website.
 * It parses and processes the RSS feed for search results, turning the
 * results into JSON objects.
 */
var cheerio = require('cheerio'),
	request = require('request'),
	querystring = require('querystring'),
	parserutils = require('../parserutils'),
	movieprocessor = require('./movieprocessor'),
	audioprocessor = require('./audioprocessor');

/**
 * Query torrentz.eu for data. Creates a list of unprocessed entries,
 * which can then be further transformed by the various processor modules.
 */
module.exports.query = function(text, callback) {
	var query = querystring.stringify({
		q: text
	});

	query = 'http://torrentz.eu/feed?' + query;
	var entries = [];

	request({url: query, headers: {'user-agent': 'Mozilla/5.0'}}, function (err, response, body) {
		if (err || response.statusCode != 200) { callback(err, null); return; }
	    var $ = cheerio.load(body, {xmlMode: true});
	    $('item').each(function(i, item) {
	    	var title = $(item).children('title').text();
	    	var link = $(item).children('link').text();
	    	var tags = $(item).children('category').text();
	    	var description = $(item).children('description').text();
	    	
	    	entries.push({
	    		title: title,
	    		href: link,
	    		tags: tags,
	    		description: description
	    	});
	    });
		callback(null, entries);
	});
}

/**
 * Process a list of unprocessed entries. The module will call all transformation
 * modules it knows about in order to transform the results into friendly
 * information. If the module does not have a processor implemented for
 * an entry, it will set the category to unknown and contentInfo will
 * be blank.
 */
module.exports.process = function(entries) {
	var processedEntries = [];
	
	for (var c = 0; c < entries.length; c++) {
		var processedEntry = processEntry(entries[c]);
		processedEntries.push(processedEntry);
	}
	
	return processedEntries;
}

//Given an unprocessed entry, change into awesomesauce.
function processEntry(entry) {
	var processedEntry = {};
	processedEntry.title = entry.title;
	processedEntry.torrentInfo = processTorrentInfo(entry);
	processedEntry.provider = 'Torrentz';
	
	//process content info based on content type.
	if (movieprocessor.matches(entry)) {
		processedEntry.category = movieprocessor.category;
		processedEntry.contentInfo = movieprocessor.process(entry);
	}
	else if (audioprocessor.matches(entry)) {
		processedEntry.category = audioprocessor.category;
		processedEntry.contentInfo = audioprocessor.process(entry);
	}
	else {
		processedEntry.category = 'Unknown';
		processedEntry.contentInfo = {};
	}

	return processedEntry;
}

//Retrieve information about the torrent (size, seeds, etc) by parsing
//the description line.
function processTorrentInfo(entry) {
	var info = {};
	
	var desc = entry.description;
	
	//size
	//There is a space between the number and the units (Mb, Kb, etc)
	//so, need to skip that space.
	var sizeStart = desc.indexOf('Size: ') + 6;
	info.size = desc.substring(sizeStart, desc.indexOf(' ', desc.indexOf(' ', sizeStart) + 1));
	
	//seeds
	var seedStart = desc.indexOf('Seeds: ') + 7;
	info.seeds = desc.substring(seedStart, desc.indexOf(' ', seedStart));

	//peers
	var peersStart = desc.indexOf('Peers: ') + 7;
	info.peers = desc.substring(peersStart, desc.indexOf(' ', peersStart));	
	
	//hash
	var hashStart = desc.indexOf('Hash: ') + 6;
	info.hash = desc.substring(hashStart);
	
	return info;
}
