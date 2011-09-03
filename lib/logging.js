var cfg = require('./config').cfg;

var PREFIX = '[flux] ';
var SEP = ' :: ';

module.exports = function(providerName) {
	return {
		searchingProvider: function() {
			if (cfg.verbose) {
				console.log(PREFIX + providerName + SEP + 'searching provider');
			}
		},
		
		sourcingProvider: function() {
			if (cfg.verbose) {
				console.log(PREFIX + providerName + SEP + 'finding sources');
			}
		},
		
		foundResults: function(number, text) {
			if (cfg.verbose) {
				if (number != 1) {
					console.log(PREFIX + providerName + SEP + 'found ' + number + ' results for "' + text + '"');
				}
				else {
					console.log(PREFIX + providerName + SEP + 'found ' + number + ' result for "' + text + '"');
				}
			}
		},
		
		noResults: function(text) {
			if (cfg.verbose) {
				console.log(PREFIX + 'no results found for "' + text + '"');
			}
		},
		
		resultsFromCache: function(number, text) {
			if (cfg.verbose) {
				if (number != 1) {
					console.log(PREFIX + providerName + SEP + 'retrieving' + number + ' results from cache for "' + text + '"');
				}
				else {
					console.log(PREFIX + providerName + SEP + 'retrieving' + number + ' result from cache for "' + text + '"');
				}
			}
		},
		
		noResultsFromCache: function(text) {
			if (cfg.verbose) {
				console.log(PREFIX + providerName + SEP + 'no results found in cache for "' + text + '"');
			}
		},
		
		downloadingFrom: function(href) {
			if (cfg.verbose) {
				console.log(PREFIX + providerName + SEP + 'downloading from ' + href);
			}
		},
		
		foundSources: function(number, hash) {
			if (cfg.verbose) {
				if (number != 1) {
					console.log(PREFIX + providerName + SEP + 'found ' + number + ' sources for ' + hash);
				}
				else {
					console.log(PREFIX + providerName + SEP + 'found ' + number + ' source for ' + hash);
				}
			}
		},
		
		noSources: function(hash) {
			if (cfg.verbose) {
				console.log(PREFIX + providerName + SEP + 'found no sources for ' + hash);
			}
		}
	};
}
