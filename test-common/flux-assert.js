var	vows = require('vows'), //to get assert extensions.
	assert = require('assert');
	
module.exports.isTorrent = function(torrent) {
	//test base torrent structure.
	assert.isTrue(typeof torrent.title !== 'undefined');
	assert.isTrue(typeof torrent.category !== 'undefined');
	assert.isTrue(typeof torrent.provider !== 'undefined');
	assert.isTrue(typeof torrent.torrentInfo !== 'undefined');
	assert.isTrue(typeof torrent.contentInfo !== 'undefined');
	
	//test torrent info structure.
	var info = torrent.torrentInfo;
	assert.isTrue(typeof info.size !== 'undefined');
	assert.isTrue(typeof info.seeds !== 'undefined');
	assert.isTrue(typeof info.peers !== 'undefined');
	assert.isTrue(typeof info.hash !== 'undefined');
	
	//not testing contentInfo here.
}

module.exports.isSource = function(source) {
	assert.isTrue(Object.keys(source).length == 2);
	assert.isTrue(typeof source.name !== 'undefined');
	assert.isTrue(typeof source.href !== 'undefined');
	assert.isString(source.name);
	assert.isString(source.href);
}
