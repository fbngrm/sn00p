var patterns = require('../conf/patterns').patterns;
var sys = require('sys');

/*
 * check if the url of the reuests contains patterns 
 * of directories traversal/local ile inclusion
 */
 
var LFI = function() {
	// perform the check
	// return true if patterns are detected else false
	this.check = function(request, response, buffer){
		
		for (var i = patterns.lfi.length -1; i >= 0; --i) {
			sys.log('lfi check for ip: ' + request.connection.remoteAddress);
			if (patterns.lfi[i].test(request.url)) return true;
		}
		return false;
	};
};

exports.LFI = LFI;