var http = require('http');
var sys  = require('sys');

var Server = function(router, snoop, options){
	var _snoop = snoop;
	var _router = router;
	var _options = options || {};
	var _port = _options.port || 8000;
	if (!_router) throw 'need router';
	if (!_snoop) throw 'need snoop';
	
	// when invalid client deny the response
	var _drop = function(response) {
		response.writeHead(403);
		response.end();
	}
	
	// when invalid request deny the response
	// tell the client that the response is denied
	var _reject = function(response, msg) {
		response.writeHead(403);
		response.write(msg);
		response.end();
	}
	
	var _forward = function(request, response) {
		response.end();
	}
	
	this.allow = function(response, msg) {
		// TODO: use for outgoing traffic
	}
	
	this.start = function(){
		// create the proxy server
		http.createServer(function(request, response) {
			// ip address of the crrent request
			var ip = request.connection.remoteAddress;
			sys.log(ip + ": " + request.method + " " + request.url);

			// options for the proxy request
			request.headers.host = '';
			var options = {
				hostname: 'localhost',
				port: 8080,
				path: request.url,
				method: request.method,
				headers: request.headers
			};
			var buffer = '';
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
							_forward(request, response);
						});
						proxy_response.on('error', function(error) {
							sys.log('proxy_response - error: ' + error);
						});
						response.writeHead(proxy_response.statusCode, proxy_response.headers);
					});
				} else if(!perms) {
					// reject response
					msg = ip + 'is banned'
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
		sys.log('starting http proxy firewall on port: ' + _port);
	};
};

exports.Server = Server;