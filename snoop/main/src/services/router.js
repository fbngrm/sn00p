var http = require('http');
var sys = require('sys');
var stringUtils = require('../utils/stringutils').StringUtils;

var Router = function(options){
	
	var _options = options;
	if (!_options) throw 'need route options';
	
	this.getByHost = function(request, protocol) {
	
		// extract hostname from host by removing port(if specified)
		if (stringUtils.contains(request.headers.host, ':')) {
			var host = request.headers.host.split(':')[0];
		} else {
			var host = request.headers.host;
		}
		
		try {
			var hostname = _options[protocol][host]['hostname'];
			var port = _options[protocol][host]['port'];
			// options for the proxy request
			request.headers.host = '';
			return options = {
				hostname: hostname,
				port: port,
				path: request.url,
				method: request.method,
				headers: request.headers
			};
		} catch (err) {
			// BUGFIX: 
			return {};
		}
	};
};

exports.Router = Router;