var https = require('https');
var sys = require('sys');
var fs = require('fs');

var Server = function(router, snoop, options) {
	var _router = router;
	var _snoop = snoop;
	var _options = options || {};
	var _keys = _options.keys;
	var _port = _options.port || 8021;
	
	if (!_snoop) throw 'need snoop to sniff traffic';
	if (!_router) throw 'need router';
	if (! _keys.key || !_keys.cert) throw 'need path to certs';
	
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
		https.createServer(_options, function (req, res) {
			// ip address of the crrent request
			var ip = request.connection.remoteAddress;
			sys.log(ip + ": " + request.method + " " + request.url);
	
			// options for the proxy request
			request.headers.host = '';
			var options = {
				hostname: 'localhost',
				port: 9021,
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
			sys.log('BUFFER ' + buffer);
				var perms = _snoop.checkPermissions(request);
				var ptrns = _snoop.checkPatterns(request, response, buffer);
				// preform checks on the current request
				if (perms && ptrns) {
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
		sys.log('starting https proxy firewall on port: ' + _port);
	};
};

exports.Server = Server;