var patterns = require('../conf/patterns').patterns;
var sys = require('sys');


var SQLi = function() {

	this.check = function(request, response, buffer){
		
		for (var i = patterns.sql.length -1; i >= 0; --i) {
			sys.log('sqli check for ip: ' + request.connection.remoteAddress);
			// check the data
			sys.log('checking data ...');
			if (patterns.sql[i].test(buffer)) return true;
			// check the cookie
			sys.log('checking cookie ...');
			if (request.headers.cookie ) {
				if (patterns.sql[i].test(JSON.stringify(request.headers.cookie))) return true;
			}
			// check the url
			sys.log('checking url ...');
			if (patterns.sql[i].test(request.url)) return true;
		}
		return false;
	};
};

exports.SQLi = SQLi;