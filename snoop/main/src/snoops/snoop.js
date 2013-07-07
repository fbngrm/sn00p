var sys = require('sys');
var typeUtils = require('../utils/typeutils').TypeUtils;

/*
 * perform security checks on a request
 * check if the ip is allowed to connect by using "permissions" module
 * check if the request contains malicious signatures by using the
 * given pattern detection modules
 */
 
var Snoop = function(permissions, snoops) {
	// permission module to check if ip is allowed to connect
	var _permissions = permissions;
	// pattern detection modules to search for malicious signatures
	var _snoops = snoops || [];
	
	// dependency check
	if (!_permissions) throw 'need permissions to check';	
	
	// check if ip is allowed/banned
	// return true if allowed
	// lese return falses
	this.checkPermissions = function(request, response){
		// ip address of the crrent request
		var ip = request.connection.remoteAddress;
		
		// check the requests against blacklist
		if (permissions.isBanned(ip)) return false;
		// check the requests against whitelist
		if (!permissions.isAllowed(ip)) return false;
		return true;
	};
	
	// check for malicious signatures
	// return true if not detected
	// else return false
	this.checkPatterns = function(request, response, buffer) {
		// ip address of the crrent request
		var ip = request.connection.remoteAddress;
		if (typeUtils.compare(_snoops, [])) {
			for (var i in _snoops) {
				var snoop = _snoops[i];
				// check the request for brute-force attacks
				if (snoop.check(request, response, buffer)) {
					// add ip to the blacklist
					permissions.ban(ip);
					return false;
				}
			}
		}
		return true;
	};
	
	// call check functions
	this.check = function(request, response, buffer){
		// check if the ip is allowed/banned
		if (!_checkPermissions(request, response)) return false;
		// check if the data/cookies contain attack signatures
		return _checkPatterns(request, response, buffer);
	};
};

exports.Snoop = Snoop;