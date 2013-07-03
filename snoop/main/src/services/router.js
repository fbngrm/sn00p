var http = require('http');
var sys = require('sys');
var stringUtils = require('../utils/stringutils').StringUtils;

var Router = function(options){

	var _options = options;
	if (!_options) throw 'need route options';
	
	this.getByUrl = function(request, protocol) {
		// extract hostname from host
		if (stringUtils.contains(request.headers.host, ':')) {
			var host = request.headers.host.split(':')[0];
		} else {
			var host = request.headers.host;
		}
		try {
			var hostname = _options[protocol][host]['hostname'];
			var port = _options[protocol][host]['port'];
		} catch (err) {
			sys.log(host + ' not found in router opts');
			return {};
		}
		// options for the proxy request
		request.headers.host = '';
		return options = {
			hostname: hostname,
			port: port,
			path: request.url,
			method: request.method,
			headers: request.headers
		};
	};
};

exports.Router = Router;