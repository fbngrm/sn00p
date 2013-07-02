var patterns = require('../conf/patterns').patterns;
var sys = require('sys');

var LFI = function() {

	this.check = function(request, response, buffer){
		
		for (var i = patterns.lfi.length -1; i >= 0; --i) {
			sys.log('lfi check for ip: ' + request.connection.remoteAddress);
			// check the url
			sys.log('checking url ...');
			sys.log(request.url);
			if (patterns.lfi[i].test(request.url)) return true;
		}
		return false;
	};
};

exports.LFI = LFI;