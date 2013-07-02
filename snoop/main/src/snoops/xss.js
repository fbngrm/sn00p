var patterns = require('../conf/patterns').patterns;
var sys = require('sys');

var XSS = function() {

	this.check = function(request, response, buffer){
		
		for (var i = patterns.xss.length -1; i >= 0; --i) {
			sys.log('xss check for ip: ' + request.connection.remoteAddress);
			// check the data
			if (patterns.xss[i].test(buffer)) return true;
			// check the cookie
			if (request.headers.cookie ) {
				if (patterns.xss[i].test(JSON.stringify(request.headers.cookie))) return true;
			}
			// check the url
			if (patterns.xss[i].test(request.url)) return true;
		}
		return false;
	};
};

exports.XSS = XSS;