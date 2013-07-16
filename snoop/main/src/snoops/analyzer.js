var typeUtils = require('../utils/typeutils').TypeUtils;

var Analyzer = function(snoops){
	// pattern detection modules to search for malicious signatures
	var _snoops = snoops || [];
	
	// check for malicious signatures
	// return true if not detected
	// else return false
	this.checkPatterns = function(request, response, buffer) {
		if (typeUtils.compare(_snoops, [])) {
			for (var i in _snoops) {
				var snoop = _snoops[i];
				// check the request for brute-force attacks
				if (snoop.check(request, response, buffer)) {
					return false;
				}
			}
		}
		return true;
	};
};

exports.Analyzer = Analyzer;
