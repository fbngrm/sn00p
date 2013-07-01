var sys = require('sys');
var type = require('../utils/type').Type;

var Snoop = function(router, permissions, snoops){
	var _router = router;
	var _permissions = permissions;
	var _snoops = snoops || [];
	
	if (!_permissions) throw 'need permissions to check';
	if (!_router) throw 'need router to route';
	
	
	this.check = function(request, response, buffer){
		// check if the ip is allowed/banned
		if (!_checkPermissions(request, response)) return false;
		// check if the data/cookies contain attack signatures
		return _checkPatterns(request, response, buffer);
	};
	
	var _checkPermissions = function(request, response){
		// ip address of the crrent request
		var ip = request.connection.remoteAddress;
		
		// check the requests against blacklist
		if (permissions.isBanned(ip)) {
			router.drop(response);
			msg = "ip " + ip + " is banned";
			sys.log(msg);
			return false;
		}
		// check the requests against whitelist
		if (!permissions.isAllowed(ip)) {
			msg = "ip " + ip + " is not allowed to use this proxy";
			router.reject(response, msg);
			sys.log(msg);
			return false;
		}
		return true;
	};
	
	var _checkPatterns = function(request, response, buffer) {
		// ip address of the crrent request
		var ip = request.connection.remoteAddress;
		if (type.compare(_snoops, [])) {
			for (var i in _snoops) {
				var snoop = _snoops[i];
				// check the request for brute-force attacks
				if (snoop.check(request, response, buffer)) {
					// add ip to the blacklist
					permissions.ban(ip);
					// dropping the request by ending the response
					router.drop(response);
					msg = "ip " + ip + " is blocked - suspicious behavoir detected";
					sys.log(msg);
					return false;
				}
			}
		}
		return true;
	};
};

exports.Snoop = Snoop;