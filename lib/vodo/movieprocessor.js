/*
 * movieprocessor.js - Process torrent results that are movies.
 * 
 * Processes torrent results from VODO that are considered to be movies.
 * Turns all of the semi-not-really organized information on the webpage
 * into very friendly JSON objects that describe each torrent.
 */
var containsTag = require('../parserutils').containsTag('.'); //vodo uses dots

/**
 * The category of things coming from this processor.
 */
module.exports.category = 'Movies';

/**
 * Determine whether or not a given result entry can be processed by
 * this processor.
 */
module.exports.matches = function(entry) {
	return true;
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

//HD resolutions:
//1280x544 (anamorphic widescreen)
//1280x720 (720p)
//#x640 (?)
//1280x688 (720p?)
function processHD(entry) {
	return (
		(entry.width === 1280 && entry.height === 544) ||
		(entry.width === 1280 && entry.height === 720) ||
		(entry.width === 1280 && entry.height === 688) ||
		(entry.width === 1920 && entry.height === 1080)
	);
}

function processQuality(entry) {
	if (entry.width === 1280 && entry.height === 544) {
		return 'Anamorphic Widescreen';
	}
	else if	(entry.width === 1280 && entry.height === 720) {
		return '720p';
	}
	else if	(entry.width === 1280 && entry.height === 688) {
		return '720p';
	}
	else if (entry.width === 1920 && entry.height === 1080) {
		return '1080p';
	}
	else {
		return 'SD';
	}
}

function processDigitalMedium(entry) {
	return 'Unknown';
}

function processOriginalMedium(entry) {
	return 'Digital';
}

function processCodec(entry) {
	var codecs = {
		'h.264': 'H.264',
		'x264': 'H.264',
		'divx': 'DivX',
		'xvid': 'XviD',
		'theora': 'Theora',
		'vp3': 'Theora',
		//vodo-specific. too lazy to do a real split.
		'h.264-vodo': 'H.264',
		'x264-vodo': 'H.264',
		'divx-vodo': 'DivX',
		'xvid-vodo': 'XviD',
		'theora-vodo': 'Theora',
		'vp3-vodo': 'Theora'
	};
	
	for (codec in codecs) {
		if (containsTag(entry.url, codec)) {
			return codecs[codec];
		}
	}
	
	return 'Unknown';
}
