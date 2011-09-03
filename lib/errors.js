//Collect all possible flux exceptions here.
module.exports = {
	//for search results.
	NO_RESULTS: { message: 'No results found' },
	//for finding of sources.
	SOURCE_NOT_FOUND: { message: 'Source(s) not found' },
	//attempting to download from an unimplemented source.
	UNKNOWN_SOURCE: { message: 'Cannot download from this source' },
	//bad parameter to something that takes a source.
	INVALID_SOURCE: { message: 'Source-like object is invalid' },
	//for attempting download.
	NO_SOURCES: { message: 'No implemented sources for torrent' },
	//bad parameter to something generic.
	NULL_PARAMETER: { message: 'Required parameter was null' }
};
