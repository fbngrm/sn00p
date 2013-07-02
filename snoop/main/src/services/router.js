var http = require('http');
var sys = require('sys');

var Router = function(){
	
	// when invalid client deny the response
	this.drop = function(response) {
		response.writeHead(403);
		response.end();
	}
	
	// when invalid request deny the response
	// tell the client that the response is denied
	this.reject = function(response, msg) {
		response.writeHead(403);
		response.write(msg);
		response.end();
	}
	
	this.forward = function(request, response) {
		response.writeHead(301,{
		    'Location': "http://" + host
		  });
		  response.end();
	}
	
	this.allow = function(response, msg){
		// ... use for outoing traffic
	}
}

exports.Router = Router;