var https = require('https');
var fs = require('fs');
var logger = require('../services/logging').Logger;

/*
 * the server provides proxy functionality for https-request.
 * requests can be forwarded to multiple applications. the options for 
 * the proxy-requests are provided by the router object.
 * the input data is inspected by the snoop object to identify
 * suspicious signatures like sql or javascript syntax/meta-characters.
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
	// certificate & key for to provide ssl/tls functionality
	var _keys = _options.keys;
	// get the port the server should listen at
	var _port = _options.port || 8021;
	
	// check if all neccessary objects are provided
	if (!_router) throw 'need router';
	if (!_fileServer) throw 'need fileserver to serve static files';
	if (! _keys.key || !_keys.cert) throw 'need pathes to certs';
	if (!logger) throw 'need logger'
		
	// start the server
	this.start = function() {
		// load the key files for ssl/tls support
		var keys = {
			key: fs.readFileSync(_keys.key),
			cert: fs.readFileSync(_keys.cert)
		};
		// create the server
		https.createServer(keys, function (request, response) {
			try {
				// options for the proxy request
				var options = _router.getByHost(request, 'https');
				// create the proxy request object
				var proxy_request = https.request(options);
				// create the http server
				_proxy.createServer(request, response, proxy_request);
			} catch (err) {
				// if no options are found return 404
				_fileServer.serve(response, '404', '404'); 
				logger.error('failed to get options for proxy request - ' + err);
			}
		// provide port to listen
		}).listen(_port);
		logger.info('start https proxy firewall on port: ' + _port);
	};
};

exports.Server = Server;