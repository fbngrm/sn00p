var patterns = require('../conf/patterns').patterns;
var sys = require('sys');

/*
 * check if the reuests contains sqli signatures 
 */
 
var SQLi = function() {

	// check request url, data & cookies(if any) against patterns
	// return true if detected
	// else return fase
	this.check = function(request, response, buffer){
		
		for (var i = patterns.sql.length -1; i >= 0; --i) {
			sys.log('sqli check for ip: ' + request.connection.remoteAddress);
			// check the data
			if (patterns.sql[i].test(buffer)) return true;
			// check the cookie
			if (request.headers.cookie) {
				if (patterns.sql[i].test(JSON.stringify(request.headers.cookie))) return true;
			}
			// check the url
			if (patterns.sql[i].test(request.url)) return true;
		}
		return false;
	};
};

exports.SQLi = SQLi;