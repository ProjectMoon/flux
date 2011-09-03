/*
 * movieprocessor.js - Process torrent results that are movies.
 * 
 * Processes torrent results from torrentz.eu that are considered to be
 * movies by the search engine. Turns all of the semi-not-really organized
 * information on the webpage into very friendly JSON objects that describe
 * each torrent.
 */
var containsTag = require('../parserutils').containsTag(' ');

/**
 * The category of things coming from this processor.
 */
module.exports.category = 'Movies';

/**
 * Determine whether or not a given result entry can be processed by
 * this processor.
 */
module.exports.matches = function(entry) {
	return containsTag(entry.tags, 'movies', 'movie');
}

/**
 * Process a result entry as a movie.
 */
module.exports.process = function(entry) {
	var info = {};
	info.isHD = processHD(entry);
	info.quality = processQuality(entry);
	
	info.codec = processCodec(entry);
	info.digitalMedium = processDigitalMedium(entry);
	info.originalMedium = processOriginalMedium(entry);
	
	return info;	
}

function processHD(entry) {
	if (containsTag(entry.tags, 'hd') | containsTag(entry.tags, 'highres')) {
		return true;
	}
	else if (containsTag(entry.title, '720p') ||
			 containsTag(entry.title, '1080p') ||
			 containsTag(entry.title, '720') ||
			 containsTag(entry.title, '1080') ||
			 containsTag(entry.title, 'HD') ||
			 containsTag(entry.title, 'BRRip') ||
			 containsTag(entry.title, 'BDRip')) {
		return true;
	}
	else {
		return false;
	}
}

function processQuality(entry) {
	if (containsTag(entry.title, '720p') || containsTag(entry.title, '720')) {
		return '720p';
	}
	else if (containsTag(entry.title, '1080p') || containsTag(entry.title, '1080') || containsTag(entry.title, 'BRRip') || containsTag(entry.title, 'BDRip')) {
		return '1080p';
	}
	else if (containsTag(entry.title, '480p') || containsTag(entry.title, '480')) {
		return '480p';
	}
	else {
		return 'Unknown';
	}
}

function processDigitalMedium(entry) {
	if (containsTag(entry.tags, 'dvd') || containsTag(entry.tags, 'dvdr')) {
		return 'DVDRip';
	}
	else if (containsTag(entry.title, 'DVDRip') || containsTag(entry.title, 'DVD')) {
		return 'DVDRip';
	}
	else if (containsTag(entry.title, 'BRRip') || containsTag(entry.title, 'BluRayRip')) {
		return 'BRRip';
	}
	else if (containsTag(entry.title, 'BDRip') || containsTag(entry.title, 'BluRay')) {
		return 'BDRip';
	}
	
	return 'Unknown';
}

function processOriginalMedium(entry) {
	if (containsTag(entry.tags, 'dvd') || containsTag(entry.tags, 'dvdr')) {
		return 'DVD';
	}
	else if (containsTag(entry.title, 'DVDRip') || containsTag('DVD')) {
		return 'DVD';
	}
	else if (containsTag(entry.title, 'BRRip') || containsTag(entry.title, 'BluRayRip')) {
		return 'Blu-ray';
	}
	else if (containsTag(entry.title, 'BDRip') || containsTag(entry.title, 'BluRay')) {
		return 'Blu-ray';
	}
	
	return 'Unknown';
}

function processCodec(entry) {
	var codecs = {
		'h.264': 'H.264',
		'x264': 'H.264',
		'divx': 'DivX',
		'xvid': 'XviD',
		'theora': 'Theora',
		'vp3': 'Theora'
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
