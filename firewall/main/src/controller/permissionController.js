var sys  = require('sys');
var fs   = require('fs');

PermissionController = function() {
	var _this = this;
   // list all ip addresses that should be blocked
	var _blacklist = [];
	// list all ip addresses that should be allowed
	var _whitelist = [];
	
	// watch the config files for black- and whitelist
	// if a file changes update the list at runtime - no restart required
	try {
		fs.watchFile('./conf/blacklist', function(c,p) { _this.updatePermissions(); });
		fs.watchFile('./conf/whitelist', function(c,p) { _this.updatePermissions(); });
	} catch (err){
		sys.log(err);
	}
};

// read the allowed and blocked ip addresses from the config files
// triggered once when server starts & and everytime the config changes
PermissionController.prototype.updatePermissions = function() {
	sys.log("Updating permissions");
	try {
		_blacklist = fs.readFileSync('./conf/blacklist', encoding='utf8').split('\n')
						.filter(function(ip) { return ip.length });
		_whitelist = fs.readFileSync('./conf/whitelist', encoding='utf8').split('\n')
						.filter(function(ip) { return ip.length });
	} catch (err) {
		sys.log(err);
	}
}

// check if the ip is blacklisted/banned
// @param ip: the ip address to check
PermissionController.prototype.isBanned = function(ip){
	for (i in _blacklist) {
		if (_blacklist[i] == ip) {
			return true;
		}
	} 
	return false;
}

// if the config file is not empty check if the ip is whitelisted/allowed
// @param ip: the ip address to check
PermissionController.prototype.isAllowed = function(ip) {
	if (_whitelist.length == 0) return true;
	for (i in _whitelist) {
		if (_whitelist[i] == ip) {
			return true;
		}
	}
	return false;
}

// when invalid client deny the response
PermissionController.prototype.deny = function(response, msg) {
  response.writeHead(403);
  response.write(msg);
  response.end();
}

exports.PermissionController = PermissionController;