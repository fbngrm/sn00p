var http = require('http');
var https = require('https');
var sys = require('sys');
var fs = require('fs');
var logger = require('../services/logging').Logger;

/*
 * create some test apps to test the proxy-functionality
 * provide http & https servers serving the request-
 * headers as response to root url "/"
 * the http server provides serving of static files
 * the filename is specified by the url
 * provided urls: "/login"
 */

var Server = function(fileServer) {
	// support file serving
	var _fileServer = fileServer;
	// check arg
	if (!fileServer) 'nedd fileserver for test-apps'
	if (!logger) throw 'need logger'

	// start the http server
	this.startHttp = function(){
		// create the server
		http.createServer(function (req, res) {
			// serve file by url param or write request headers to response
			if (req.url != '/') {
				// serve files
				_fileServer.serve(res, req.url, '');
			} else {
				// write headers to response
				res.writeHead(200, { 'Content-Type': 'text/plain' });
			  	res.write("hello world\n\n");
			 	res.write('request successfully proxied: ' + req.url +'\n' + JSON.stringify(req.headers, true, 2));
			  	res.end();
			}
		// listen on port 9000
		}).listen(9000);
		logger.info('starting http app on port 9000');
	};
	// start the https server
	this.startHttps = function(){
		// certs for ssl/tls support
		var options = {
		  key: fs.readFileSync('./keys/key.pem'),
		  cert: fs.readFileSync('./keys/cert.pem')
		};
		// create the server
		https.createServer(options, function (req, res) {
			// serve file by url param or write request headers to response
			if (req.url != '/') {
				// serve files
				_fileServer.serve(res, req.url, '');
			} else {
				// write headers to response
				res.writeHead(200, { 'Content-Type': 'text/plain' });
			  	res.write("hello world\n\n");
			 	res.write('request successfully proxied: ' + req.url +'\n' + JSON.stringify(req.headers, true, 2));
			  	res.end();
			}
		// listen on port 9021
		}).listen(9021);
		logger.info('starting https app on port 9021');
	};
};

exports.Server = Server;