var http = require('http');
var sys  = require('sys');

var Server = function(router, snoop, fileServer, options) {

	var _snoop = snoop;
	var _router = router;
	var _fileServer = fileServer;
	var _options = options || {};
	var _port = _options.port || 8000;
	
	if (!_router) throw 'need router';
	if (!_snoop) throw 'need snoop';
	if (!_fileServer) throw 'new fileserver'
	
	
	// when invalid client drop the response
	var _drop = function(response) {
		_fileServer.serve(response, 'forbidden', '');
	}
	
	// when invalid request deny the response
	// tell the client that the response is denied
	var _reject = function(response, msg) {
		_fileServer.serve(response, 'banned', msg);
	}
	
	// forward the proxy-response by endind the response 
	var _forward = function(request, response, buffer, options) {
		// create the proxy request object
		var proxy_request = http.request(options);
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
				sys.log('proxy_response - error: ' + error);
			});
			response.writeHead(proxy_response.statusCode, proxy_response.headers);
		});
	}
	
	var _allow = function(response, msg) {
		// TODO: use for outgoing traffic
	}
	
	this.start = function() {
		// create the proxy server
		http.createServer(function(request, response) {
			// ip address of the crrent request
			var ip = request.connection.remoteAddress;
			sys.log(ip + ": " + request.method + " " + request.url);

			// options for the proxy request
			var options = router.getByUrl(request, 'http');
			// if no options are found return 404
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
				var perms = _snoop.checkPermissions(request);
				var ptrns = _snoop.checkPatterns(request, response, buffer);
				// preform checks on the current request
				if (perms && ptrns) {
					// forward the request if nothing suspicious detected
					_forward(request, response, buffer, options);
				} else if (!perms) {
					// reject response
					msg = ip + ' is banned'
					_reject(response, msg);
				} else {
					// drop response
					_drop(response);
				}
			});
			request.on('error', function(error) {
				sys.log('error in request: ' + err);
			});
		}).listen(_port);
		sys.log('starting http proxy firewall on port ' + _port);
	};
};

exports.Server = Server;