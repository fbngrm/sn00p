var http = require("http");
var path = require('path');
var fs = require("fs");

/*
 * serve content from files and write it 
 * to a response object
 */

var FileServer = function() {

	// try to read the content from a file
	// if the file does not exsist send a 404 - not found response
	// if an error occures send a 500 - internal server error response
	this.serve = function(response, state, msg) {	
		// get the absolute path to the file
		var filename = path.join(process.cwd(), 'views', state);
	  
	  	// check if the file exists
		fs.exists(filename, function(exists) {
			// if file does not exist send 404
			if (!exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}
			// try to read the file
			// if an error occures send 500
			fs.readFile(filename, "binary", function(err, file) {
				// hanlde the error
				if (err) {
					response.writeHead(500, {"Content-Type": "text/plain"});
					response.write(err + "\n");
					response.end();
			        return;
				}
				// if successfull - sne dfile content in resonse - 200
				response.writeHead(200);
				// write file content to the response as binary data
				response.write(file, "binary");
				response.end();
			});
		});
	}
};

exports.FileServer = FileServer;