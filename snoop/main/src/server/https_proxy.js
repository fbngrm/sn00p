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
 
var Server = function(router, snoop, fileServer, options) {

	// router to get options & adress resolution for proxy-requests
	var _router = router;
	// "snoop" to detect attack-signatures
	var _snoop = snoop;
	// serve static files
	var _fileServer = fileServer;
	// options to configure the server
	var _options = options || {};
	// certificate & key for to provide ssl/tls functionality
	var _keys = _options.keys;
	// get the port the server should listen at
	var _port = _options.port || 8021;
	
	// check if all neccessary objects are provided
	if (!_snoop) throw 'need snoop to sniff traffic';
	if (!_router) throw 'need router';
	if (!_fileServer) throw 'need fileserver to serve static files';
	if (! _keys.key || !_keys.cert) throw 'need pathes to certs';
	if (!logger) throw 'need logger'
		
	// start the server
	this.start = function(){
		// load the key files for ssl/tls support
		var keys = {
			key: fs.readFileSync(_keys.key),
			cert: fs.readFileSync(_keys.cert)
		};
		// create the server
		https.createServer(keys, function (request, response) {
			// ip address of the crrent request
			var ip = request.connection.remoteAddress;
			logger.info(ip + ": " + request.method + " " + request.url);
	
			// options for the proxy request
			var options = router.getByHost(request, 'https');
			// if no options are found return 404 - address is not supported/configured
			if (options === {}) _fileServer.serve(response, '404', '');
			// buffer for the request data
			var buffer = '';
			// buffer for the proxy-request data
			var proxy_buffer = '';

			// add the listeners for the requests
			request.on('data', function(chunk) {
				buffer += chunk;
			});
			request.on('end', function() {
				// check if the connecting client is allowed to use the proxy
				var perms = _snoop.checkPermissions(request);
				// check if the request data contains suspicious signatures
				var ptrns = _snoop.checkPatterns(request, response, buffer);
				
				// handle the request according to the check results
				if (perms && ptrns) {
					// forward the request if nothing suspicious detected
					_forward(request, response, buffer, options);
				} else if(!perms) {
					// reject response
					msg = ip + 'is banned'
					_reject(response, msg);
				} else {
					// drop response
					_drop(response);
				}
			});
			// error listener for the result
			request.on('error', function(error) {
				logger.error('error in request: ' + err);
			});
		// provide port to listen
		}).listen(_port);
		logger.info('starting https proxy firewall on port: ' + _port);
	};
	
	//****************************************//
	// functions to handle requests properly  //
	// drop, deny, forward, allow             //
	//****************************************//
	 
	// when the client is not valid drop the response
	var _drop = function(response) {
		_fileServer.serve(response, 'forbidden', '');
	}
	
	// when the request is not valid deny the response
	// tell the client that the response is denied
	var _reject = function(response, msg) {
		_fileServer.serve(response, 'banned', msg);
	}
	// forward the proxy-response by ending the response 
	var _forward = function(request, response, buffer, options) {
		// create the proxy request object
		var proxy_request = https.request(options);
		proxy_request.write(buffer, 'binary');
		proxy_request.end();
		// add listeners to the proxy request
		proxy_request.on('response', function(proxy_response) {
			proxy_response.on('data', function(chunk) {
				response.write(chunk, 'binary');
			});
			proxy_response.on('end', function() {
				response.end();
			});
			proxy_response.on('error', function(error) {
				logger.error('proxy_response - error: ' + error);
			});
			response.writeHead(proxy_response.statusCode, proxy_response.headers);
		});
	}
	
	this.allow = function(response, msg) {
		// TODO: use for outgoing traffic
	}
};

exports.Server = Server;