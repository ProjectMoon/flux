var torrentz = require('./torrentz');

var fluxConfig = module.exports.cfg = {
	saveDir: '.',
	ignoredSources: [],
	verbose: false,
	providers: [ torrentz ]
};

module.exports.configure = function(config) {
	for (prop in config) {
		module.exports.cfg[prop] = config[prop];
	}
}
