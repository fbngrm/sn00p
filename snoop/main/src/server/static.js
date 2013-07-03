var http = require("http");
var path = require('path');
var fs = require("fs");
 
var FileServer = function() {

	this.serve = function(response, state, msg) {	
		var filename = path.join(process.cwd(), 'views', state);
	  
		fs.exists(filename, function(exists) {
			if (!exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}

			fs.readFile(filename, "binary", function(err, file) {
				if (err) {        
					response.writeHead(500, {"Content-Type": "text/plain"});
					response.write(err + "\n");
					response.end();
			        return;
				}
				response.writeHead(200);
				response.write(file, "binary");
				response.end();
			});
		});
	}
};

exports.FileServer = FileServer;