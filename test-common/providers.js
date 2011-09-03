/*
Test the flux core API with mock data.
*/

exports.provider1 = {
	name: 'provider1',
	
	owns: function(torrent) {
		return torrent.provider === 'provider1';
	},
	
	search: function(text, callback) {
		var result = {
			title: 'Test torrent',
			provider: 'provider1',
			category: 'Unknown',
			contentInfo: null,
			torrentInfo: {
				size: '200 Mb',
				seeds: 10,
				peers: 10,
				hash: '12345'
			}
		};
		
		callback(null, [ result ]);
	},
	
	find: function(text, callback) {
		var result = {
			title: 'Test torrent',
			provider: 'provider1',
			contentInfo: null,
			torrentInfo: {
				size: '200 Mb',
				seeds: 10,
				peers: 10,
				hash: '12345'
			}
		};
		
		callback(null, result);
	},
	
	locate: function(torrent, callback) {		
		var sources = {};
		sources['example.com'] = {
			name: 'example.com',
			href: 'http://www.example.com/torrents/example.torrent'
		};
		
		var result = {};
		result[torrent.torrentInfo.hash] = sources;
		callback(null, result);
	},
	
	source: function(torrent, callback) {
		callback(null, {
			name: 'example.com',
			href: 'http://www.example.com/torrents/example.torrent'
		});
	}
};
