var	fs = require('fs');

module.exports.jquery = function() {
	return fs.readFileSync(__dirname + '/jquery-1.6.2.min.js').toString();
}

module.exports.containsTag = function(delimiter) {
	return function(text) {
		var tagTests = Array.prototype.slice.call(arguments, 1);
		
		if (typeof tagTests === 'undefined' || tagTests.length == 0) {
			return false;
		}
		
		text = text.toLowerCase();
		var tags = text.split(delimiter);
		
		for (var c = 0; c < tagTests.length; c++) {
			var tag = tagTests[c].toLowerCase();
		
			for (var x = 0; x < tags.length; x++) {
				if (tags[x] == tag) {
					return true;
				}
			}
		}
	}
}
