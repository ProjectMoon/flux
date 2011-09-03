var	vows = require('vows'),
	assert = require('assert'),
	fluxAssert = require('../test-common/flux-assert.js'),
	torrentz = require('../lib/torrentz/torrentz');
	
vows.describe('Torrentz Provider Internals').addBatch({
	'torrentz.query': {
		topic: function() {
			torrentz.query('ubuntu', this.callback);
		},
		
		'should have no errors': function(err, entries) {
			assert.isNull(err);
		},
		
		'should be array': function(err, entries) {
			assert.isArray(entries);
		},
		
		'should have raw entry structure': function(err, entries) {
			entries.forEach(function(entry) {
				//properties exist?
				assert.isTrue(typeof entry.title !== 'undefined');
				assert.isTrue(typeof entry.href !== 'undefined');
				assert.isTrue(typeof entry.tags !== 'undefined');
				assert.isTrue(typeof entry.description !== 'undefined');
				
				//of the proper type?
				assert.isString(entry.title);
				assert.isString(entry.href);
				assert.isString(entry.tags);
				assert.isString(entry.description);
			});
		},
		
		'torrentz.process': {
			topic: function(entries) {
				return torrentz.process(entries);
			},
			
			'should be an array': function(entries) {
				assert.isArray(entries);
			},
			
			'should adhere to torrent structure': function(processedEntries) {
				processedEntries.forEach(function(entry) {
					fluxAssert.isTorrent(entry);
				});
			}
		}
	}
}).export(module);
