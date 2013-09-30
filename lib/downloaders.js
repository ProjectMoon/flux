var http = require('http'),
	fs = require('fs'),
	cheerio = require('cheerio'),
	request = require('request'),
	parserutils = require('./parserutils'),
	errors = require('./errors'),
	cfg = require('./config').cfg,
	logging = require('./logging')('download');

function genericTorrentDownload(options, filename, callback) {
	http.get(options, function(res) {
		res.setEncoding('binary');
		var torrentData = '';
		
		res.on('data', function(data) {
			torrentData += data;
		});
		
		res.on('end', function() {
			fs.writeFile(cfg.saveDir + '/' + filename, torrentData, 'binary', function(err) {
				if (err) {
					callback(err);
				}
				else {
					callback(null);
				}
			});
		});
	});
}

/// Begin downloaders. One for each supported torrentz.eu result. ///
var downloaders = {};
// downloaders['1337x.org'] = function(url, filename, callback) {
// 	//1337x.org can be downloaded easily:
// 	//http://1337x.org/torrent/<id>/0/ -> http://1337x.org/download/<id>/	
// 	var idRegex = /(?:torrent\/)(\d+)/;
// 	var id = idRegex.exec(url)[1]; //0 is torrent/<id>
	
// 	var options = {
// 		host: '1337x.org',
// 		port: 80,
// 		path: '/download/' + id + '/'
// 	};
	
// 	genericTorrentDownload(options, filename, function(err) {
// 		callback(err);
// 	});
// }

downloaders['thepiratebay.org'] = function(url, filename, callback) {
	request({url: url, headers: {'user-agent': 'Mozilla/5.0'}}, function (err, response, body) {
		var $ = cheerio.load(body);
		var torrentURL = $('a[title="Download this torrent"]').attr('href');
		
		var torrentRegex = /(\/\d+\/.*)/;
		var torrentPath = torrentRegex.exec(torrentURL)[0]; //also puts it in [1] apparently
		
		var options = {
			host: 'torrents.thepiratebay.org',
			port: 80,
			path: torrentPath
		};
		
		genericTorrentDownload(options, filename, function(err) {
			callback(err);
		});
	});
}

downloaders['torlock.com'] = function(url, filename, callback) {
	//easy conversion:
	//http://www.torlock.com/torrent/<id>/<junk> -> http://www.torlock.com/tor/<id>.torrent
	var idRegex = /(?:torrent\/)(\d+)/;
	var id = idRegex.exec(url)[1]; //0 is torrent/<id>
	var options = {
		host: 'www.torlock.com',
		port: 80,
		path: '/tor/' + id + '.torrent'
	};
	
	genericTorrentDownload(options, filename, function(err) {
		callback(err);
	});
}

downloaders['btjunkie.org'] = function(url, filename, callback) {
	//very easy conversion: just stick "dl." in front of url and "/download.torrent" on end.
	var everythingAfter = url.substring(url.indexOf('/', 7));

	var options = {
		host: 'dl.btjunkie.org',
		port: 80,
		path: everythingAfter + '/download.torrent'
	};
	
	genericTorrentDownload(options, filename, function(err) {
		callback(err);
	});
}

downloaders['vodo.net'] = function(url, filename, callback) {
	//VODO gives us the torrent URL straight-up.
	var path = url.substring(url.indexOf('/', 7));
	
	var options = {
		host: 'vodo.net',
		port: 80,
		path: path
	};
	
	genericTorrentDownload(options, filename, function(err) {
		callback(err);
	});
}

downloaders['unknown'] = function(url, filename, callback) {
	callback(errors.UNKNOWN_SOURCE + ': ' + url);
}

/// End Downloaders. Exports follow ///
module.exports.createDownloader = function(source, filename) {
	if (downloaders[source.name]) {
		var dlFunc = downloaders[source.name];
	}
	else {
		var dlFunc = downloaders['unknown'];
	}
	
	return function(callback) {
		logging.downloadingFrom(source.href);
		dlFunc(source.href, filename, callback);
	}
}

module.exports.canDownloadFrom = function(sourcenameOrSource) {
	if (typeof sourcenameOrSource === 'object') {
		return sourcenameOrSource.name in downloaders;
	}
	else if (typeof sourcenameOrSource === 'string') {
		return sourcenameOrSource in downloaders;
	}
	else {
		throw errors.INVALID_SOURCE;
	}
}
