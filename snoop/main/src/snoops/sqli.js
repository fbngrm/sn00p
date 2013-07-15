var patterns = require('../conf/patterns').patterns;
var sys = require('sys');
var logger = require('../services/logging').Logger;

/*
 * check if the reuests contains sqli signatures 
 */
 
var SQLi = function() {

	if (!logger) throw 'need logger'

	// check request url, data & cookies(if any) against patterns
	// return true if detected
	// else return fase
	this.check = function(request, response, buffer) {
		logger.check('sqli check for ip: ' + request.connection.remoteAddress);
		
		for (var i = patterns.sql.length -1; i >= 0; --i) {
			// check the data
			if (patterns.sql[i].test(buffer)) {
				logger.warn('sqli found for ip: ' + request.connection.remoteAddress);
				return true;
			}
			// check the cookie
			if (request.headers.cookie) {
				if (patterns.sql[i].test(JSON.stringify(request.headers.cookie))) {
					logger.warn('sqli found for ip: ' + request.connection.remoteAddress);
					return true;
				}
			}
			// check the url
			if (patterns.sql[i].test(request.url)) {
				logger.warn('sqli found for ip: ' + request.connection.remoteAddress);
				return true;
			}
		}
		logger.check('sqli check ok - ip: ' + request.connection.remoteAddress);
		return false;
	};
};

exports.SQLi = SQLi;