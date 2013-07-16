var logger = require('../services/logging').Logger;
 
var Proxy = function(fileServer, snoop) {

	// "snoop" to detect attack-signatures
	var _snoop = snoop;
	// serve static files
	var _fileServer = fileServer;
	
	// check if all neccessary objects are provided
	if (!_fileServer) throw 'need fileserver';
	if (!logger) throw 'need logger';

	this.createServer = function(request, response, proxy_request) {
		// ip address of the crrent request
		var ip = request.connection.remoteAddress;
		logger.info(ip + ": " + request.method + " " + request.url);

		// buffer for the request data
		var buffer = '';
		// buffer for the proxy-request data
		var proxy_buffer = '';
	
		// add the listeners for the requests
		request.on('data', function(chunk) {
			buffer += chunk;
		});
		request.on('end', function() {
			var perms = true;
			var ptrns = true;
			
			// if a snoop is provided
			if (_snoop) {
				// check if the connecting client is allowed to use the proxy
				var perms = _snoop.checkPermissions(request);
				// check if the request data contains suspicious signatures
				var ptrns = _snoop.analyze(request, response, buffer);
			}
			
			// handle the request according to the check results
			if (perms && ptrns) {
				// forward the request if nothing suspicious has been detected
				_forward(request, response, proxy_request, buffer);
			} else if (!perms) {
				// reject response
				msg = ip + ' is banned'
				_reject(response, proxy_request, msg);
			} else {
				// drop response
				_drop(response, proxy_request);
			}
		});
		// error listener for the result
		request.on('error', function(error) {
			logger.error('error in request: ' + err);
		});
		
	};
	
	//****************************************//
	// functions to handle requests properly  //
	// drop, deny, forward, allow             //
	//****************************************//
	 
	// when the client is not valid drop the response
	var _drop = function(response, proxy_request) {
		// ip address of the current request
		var ip = response.connection.remoteAddress;
		// end the proxy request 
		proxy_request.end();
		// server response from file
		_fileServer.serve(response, '403', 'forbidden');
		logger.drop('drop request from ip: ' + ip);
	}
	
	// when the request is not valid deny the response
	// tell the client that the response is denied
	var _reject = function(response, proxy_request, msg) {
		// ip address of the current request
		var ip = response.connection.remoteAddress;
		// end the proxy request 
		proxy_request.end();
		// server response from file
		_fileServer.serve(response, '403', 'banned');
		logger.reject('reject request from ip: ' + ip);
	}

	// forward the proxy-response by endind the response
	var _forward = function(request, response, proxy_request, buffer) {

		proxy_request.write(buffer, 'binary');
		proxy_request.end();
		// add listeners to the proxy request
		proxy_request.on('response', function(proxy_response) {
			// add headers
			response.writeHead(proxy_response.statusCode, proxy_response.headers);
			// add listener
			proxy_response.on('data', function(chunk) {
				response.write(chunk, 'binary');
			});
			proxy_response.on('end', function() {
				response.end();
			});
			proxy_response.on('error', function(error) {
				logger.error('proxy_response - error: ' + error);
			});
		});
	}

	var _allow = function(response, msg) {
		// TODO: use for outgoing traffic
	}
};

exports.Proxy = Proxy;