var logger = require('../services/logging').Logger;

/*
 * perform security checks on a request
 * check if the ip is allowed to connect by using "permissions" module
 * check if the request contains malicious signatures by using the
 * given pattern detection modules
 */
 
var Snoop = function(permissions, analyzer) {
	// permission module to check if ip is allowed to connect
	var _permissions = permissions;
	// analyze the incoming requests for malicious patterns
	var _analyzer = analyzer;
	
	// dependency check
	if (!_permissions) throw 'need permissions to check';	
	if (!logger) throw 'need logger'
	
	// check if ip is allowed/banned
	// return true if allowed
	// lese return falses
	this.checkPermissions = function(request, response) {
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
	this.analyze = function(request, response, buffer){
		// ip address of the crrent request
		var ip = request.connection.remoteAddress;
		// flag for determining if patterns havbeen found
		var found = _analyzer.checkPatterns(request, response, buffer);
		// add ip to the blacklist if neccessary
		if (found === false) permissions.ban(ip);
		return found;
	};
	
	// call check functions
	this.check = function(request, response, buffer) {
		// check if the ip is allowed/banned
		if (!checkPermissions(request, response)) return false;
		// check if the data/cookies contain attack signatures
		return analyze(request, response, buffer);
	};
};

exports.Snoop = Snoop;