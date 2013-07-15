var http = require('http');
var sys = require('sys');
var stringUtils = require('../utils/stringutils').StringUtils;
var logger = require('../services/logging').Logger;

/*
 * provide options for proxy-requests
 * address resolution for multiple applications is 
 * provided by the options argument
 *
 * example config:
 * "router" : {
 *		"http" : {
 *			"foo-bar.com" : {
 *				"hostname" : "localhost",
 *				"port" : 9000
 *			}
 *		}, 
 *		"https" : {
 * 			"foo-foo.com" : {
 *				"hostname" : "localhost",
 *				"port" : 9021
 *			}
 *		}
 *	}
 */
 
var Router = function(options){
	// options for routing
	var _options = options;
	// check if options are provided
	if (!_options) throw 'need route options';
	if (!logger) throw 'need logger'
	
	// get the proxy-request options by request-host and protocol
	this.getByHost = function(request, protocol) {
	
		// extract hostname from host by removing port(if specified)
		if (stringUtils.contains(request.headers.host, ':')) {
			var host = request.headers.host.split(':')[0];
		} else {
			var host = request.headers.host;
		}
		
		// get hostname and port from the request
		var hostname = _options[protocol][host]['hostname'];
		var port = _options[protocol][host]['port'];
		logger.info('get options for host: ' + hostname + ':' + port);
			
		// overwrite the host header in dev-mode or if localhost should be used as host
		request.headers.host = '';
			
		// options for the proxy request
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