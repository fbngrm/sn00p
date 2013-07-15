var patterns = require('../conf/patterns').patterns;
var sys = require('sys');
var logger = require('../services/logging').Logger;

/*
 * check if the url of the reuests contains patterns 
 * of directories traversal/local ile inclusion
 */
 
var LFI = function() {
	if (!logger) throw 'need logger'
	// perform the check
	// return true if patterns are detected else false
	this.check = function(request, response, buffer) {
		logger.check('lfi check for ip: ' + request.connection.remoteAddress);
		
		for (var i = patterns.lfi.length -1; i >= 0; --i) {
			if (patterns.lfi[i].test(request.url)) {
				logger.warn('found lfi patterns - ip: ' + request.connection.remoteAddress);
				return true;
			}
		}
		logger.check('finish lfi check for ip: ' + request.connection.remoteAddress);
		return false;
	};
};

exports.LFI = LFI;