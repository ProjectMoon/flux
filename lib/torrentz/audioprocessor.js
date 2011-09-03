/*
 * audioprocessor.js - Process torrent results that are audio.
 * 
 * Processes torrent results from torrentz.eu that are considered to be
 * audio by the search engine. Turns all of the semi-not-really organized
 * information on the webpage into very friendly JSON objects that describe
 * each torrent.
 */
var containsTag = require('../parserutils').containsTag(' ');

/**
 * The category of things processed by this processor.
 */
module.exports.category = 'Audio';

/**
 * Determine whether or not a given result entry can be processed by
 * this processor.
 */
module.exports.matches = function(entry) {
	return containsTag(entry.title, 'audio', 'music', 'soundtrack', 'soundtracks');
}

/**
 * Process a result entry as audio.
 */
module.exports.process = function(entry) {
	var info = {};
	
	info.type = processType(entry);
	info.codec = processCodec(entry);
	
	return info;
}

function processType(entry) {
	if (containsTag(entry.title, 'Soundtrack') || containsTag(entry.tags, 'soundtrack', 'soundtracks')) {
		return 'Soundtrack';
	}
	else if (containsTag(entry.tags, 'music')) {
		return 'Music';
	}
	else {
		return 'Unsorted';
	}
}

function processCodec(entry) {
	var codecs = {
		'mp3': 'MP3',
		'flac': 'FLAC'
	};
	
	for (codec in codecs) {
		if (containsTag(entry.tags, codec)) {
			//translate to friendly name from tag.
			return codecs[codec];
		}
		else if (containsTag(entry.title, codec)) {
			return codecs[codec];
		}
	}
	
	return 'Unknown';
}
