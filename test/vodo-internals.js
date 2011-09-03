var	vows = require('vows'),
	assert = require('assert'),
	fluxAssert = require('../test-common/flux-assert'),
	vodo = require('../lib/vodo/vodo');
	
vows.describe('VODO Provider Internals').addBatch({
	'vodo.query': {
		topic: function() {
			vodo.query('zenith', this.callback);
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
				assert.isTrue(typeof entry.url !== 'undefined');
				assert.isTrue(typeof entry.height !== 'undefined');
				assert.isTrue(typeof entry.width !== 'undefined');
				assert.isTrue(typeof entry.fileSize !== 'undefined');
				assert.isTrue(typeof entry.bitrate !== 'undefined');
				assert.isTrue(typeof entry.duration !== 'undefined');
				assert.isTrue(typeof entry.hash !== 'undefined');
				
				//properties of correct type?
				assert.isString(entry.title);
				assert.isString(entry.url);
				assert.isNumber(entry.height);
				assert.isNumber(entry.width);
				assert.isString(entry.fileSize);
				assert.isString(entry.bitrate);
				assert.isString(entry.duration);
				assert.isString(entry.hash);
			});
		},
		
		//test processed entries.
		'vodo.process': {
			topic: function(entries) {
				return vodo.process(entries);
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
