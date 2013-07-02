var https = require('https');
var sys = require('sys');
var fs = require('fs');

var Server = function(router, snoop, options) {
	var _router = router;
	var _snoop = snoop;
	var _options = options || {};
	var _keys = _options.keys || {};
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
	
	var a = https.createServer(_options, function (req, res) {
	  res.writeHead(200);
	  res.end("hello world\n");
	}).listen(_port);
	sys.log('starting https proxy firewall on port: ' + _port);
};

exports.Server = Server;