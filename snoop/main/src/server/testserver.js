var http = require('http');
var https = require('https');
var sys = require('sys');
var fs = require('fs');

var Server = function(){
	this.startHttp = function(){
		http.createServer(function (req, res) {
		  res.writeHead(200, { 'Content-Type': 'text/plain' });
		  res.write('request successfully proxied: ' + req.url +'\n' + JSON.stringify(req.headers, true, 2));
		  res.end();
		}).listen(9000);
		sys.log('starting https server on port 8080');
	};
	
	this.startHttps = function(){
		var options = {
		  key: fs.readFileSync('./keys/key.pem'),
		  cert: fs.readFileSync('./keys/cert.pem')
		};
		
		https.createServer(options, function (req, res) {
			res.writeHead(200);
			res.end("hello world\n");
		}).listen(8021);
		sys.log('starting https server on port 8021');
	};
};

exports.Server = Server;