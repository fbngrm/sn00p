var http = require('http');
var sys  = require('sys');

var Server = function(snoop){

	var _snoop = snoop;
	if (!_snoop) throw 'need snoop to snoop traffic';

	this.start = function(){
		// create the proxy server
		http.createServer(function(request, response) {
			//sys.log(request.connection.remoteAddress + ": " + request.method + " " + request.url);
			
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
				// preform checks on the current request
				if (_snoop.check(request, response, buffer)) {
					sys.log('PROXY');
					// create the proxy request object
					var proxy_request = http.request(options);
					proxy_request.write(buffer, 'binary');
					proxy_request.end();
					// add listeners to the proxy request
					proxy_request.on('response', function(proxy_response) {
					
						proxy_response.on('data', function(chunk) {
							sys.log('proxy_response got data: ' + chunk);
							response.write(chunk, 'binary');
						});
				
						proxy_response.on('end', function() {
							sys.log('proxy_response end');
							response.end();
						});
				
						proxy_response.on('error', function(error) {
							sys.log('proxy_response - error: ' + error);
						});
				
						response.writeHead(proxy_response.statusCode, proxy_response.headers);
						sys.log('response head');
					});
				} else {
					// response ended
					sys.log('END');
				}
			});
			
			request.on('error', function(error) {
				sys.log('error in request: ' + err);
			});
			
		}).listen(8000);
		sys.log('starting http proxy firewall on port 8081');
	};
};

exports.Server = Server;