/*
Test the flux core API with mock data.
*/

var	vows = require('vows'),
	assert = require('assert'),
	fluxAssert = require('../test-common/flux-assert'),
	flux = require('../lib/flux');

//set up flux for testing.
flux.configure({
	verbose: false,
	providers: [ flux.torrentz ]
});

vows.describe('Flux Core (Torrentz provider)').addBatch({
	'flux.search': {
		topic: function() {
			flux.search('ubuntu', this.callback);
		},
		'should be array': function(err, torrents) {
			assert.isNull(err);
			assert.isArray(torrents);
			assert.isTrue(torrents.length > 0);
		},
		'should have torrent object structure': function(err, torrents) {
			torrents.forEach(function(torrent) {
				fluxAssert.isTorrent(torrent);
			});
		}
	},
	
	'flux.locate (single torrent)': {
		topic: function() {
			var self = this;
			flux.search('ubuntu', function(err, torrents) {
				flux.locate(torrents[0], self.callback);
			});
		},
		
		'should not be array': function(err, results) {
			assert.isNull(err);
			assert.isObject(results);
		},
		
		'should only be one result': function(err, results) {
			assert.isTrue(Object.keys(results).length == 1);
		},
		
		'should have locate result structure': function(err, results) {
			for (var hash in results) {
				var sources = results[hash];
				for (var sourceName in sources) {
					var source = sources[sourceName];
					fluxAssert.isSource(source);
				}
			}
		}
	},
	
	'flux.locate (multiple torrents)': {
		topic: function() {
			var self = this;
			flux.search('ubuntu', function(err, torrents) {
				//limit list to 2, so we don't slam torrentz.eu servers.
				//also speeds up the test by ~5 seconds.
				flux.locate([ torrents[0], torrents[1] ], self.callback);
			});
		},
		
		'should not be array': function(err, results) {
			assert.isNull(err);
			assert.isObject(results);
		},
				
		'should have locate result structure': function(err, results) {
			for (var hash in results) {
				var sources = results[hash];
				for (var sourceName in sources) {
					var source = sources[sourceName];
					fluxAssert.isSource(source);
				}
			}
		}
	},
	
	'flux.source': {
		topic: function() {
			var self = this;
			flux.search('ubuntu', function(err, torrents) {
				flux.source('1337x.to', torrents[0], self.callback);
			});
		},
		
		'should not be array': function(err, source) {
			assert.isNull(err);
			assert.isObject(source);
		},
		
		'should have source result structure': function(err, source) {
			fluxAssert.isSource(source);
		}
	}
}).export(module);
