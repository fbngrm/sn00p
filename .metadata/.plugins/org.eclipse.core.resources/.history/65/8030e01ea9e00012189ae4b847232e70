
var Router = function(){

	var _reject = {head: 403, msg: ''}
	
	// when invalid client deny the response
	this.drop = function(response) {
		response.end();
	}
	
	// when invalid request deny the response
	// tell the client that the response is denied
	this.reject = function(response, msg) {
		response.writeHead(403);
		response.write(msg);
		response.end();
	}
}

exports.Router = Router;