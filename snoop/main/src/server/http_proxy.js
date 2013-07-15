var http = require('http');
var logger = require('../services/logging').Logger;


/*
 * the server provides proxy functionality for http requests.
 * requests can be forwarded to multiple applications. the options for 
 * the proxy-requests are provided by the router object.
 * the input data is inspected by the snoop object to identify
 * suspicious signatures like sql or javascript syntax/meta-character.
 */

var Server = function(proxy, router, fileServer, options) {

	// proxy-commons to create the server
	var _proxy = proxy;
	// router to get options & adress resolution for proxy-requests
	var _router = router;
	// serve static files
	var _fileServer = fileServer;
	// options to configure the server
	var _options = options || {};
	// get the port the server should listen at
	var _port = _options.port || 8000;
	
	// check if all neccessary objects are provided
	if (!_proxy) throw 'need proxy-commons';
	if (!_fileServer) throw 'need fileserver';
	if (!logger) throw 'need logger';
	if (!_router) throw 'need router';
	
	// start the server
	this.start = function() {
		// create the proxy server
		http.createServer(function(request, response) {
			
			try {
				// options for the proxy request
				var options = _router.getByHost(request, 'http');
				// create the proxy request object
				var proxy_request = http.request(options);
				// create the http server
				_proxy.createServer(request, response, proxy_request);
			} catch (err) {
				// if no options are found return 404
				_fileServer.serve(response, '404', ''); 
				logger.error('failed to get options for proxy request - ' + err);
			}
				
		// provide port to listen
		}).listen(_port);
		logger.info('starting http proxy firewall on port ' + _port);
	};
};

exports.Server = Server;