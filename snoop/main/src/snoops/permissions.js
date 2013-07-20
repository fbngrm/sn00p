var sys  = require('sys');
var fs   = require('fs');
var logger = require('../services/logging').Logger;

/*
 * check if a certain client is allowed to connect by
 * checking its ip against a black- & whitelist.
 * delete the blacklist after a defined timeinterval
 * to unblock ips.
 * changes in the black- & whitelist files will be 
 * updated automatically. restart is not required.
 *
 */

Permissions = function(options) {
   
   // list all ip addresses that should be blocked
	var _blacklist = [];
	// list all ip addresses that should be allowed
	var _whitelist = [];
	
	// options to define thresholds & pathes
	var _options = options || {};
	// path to the blacklist file
	var _blackpath = _options.blacklist;
	// path to the whitelist file
	var _whitepath = _options.whitelist;
	// delete the blacklist after $_unban (seconds)
	var _unban = _options.unban || 120;
	
	// dependency check 
	if (!_blackpath || !_whitepath) throw ('lists not found');
	if (!logger) throw 'need logger'
	
	// ban an ip
	this.ban = function(ip){
		// determine linebreak of the current platform
		var nl = process.platform === 'win32' ? '\r\n' : '\n';
		// check if ip is already in the blacklist
		for (i in _blacklist) {
			if (_blacklist[i] == ip) return;
		}
		// blacklist ip in memory
		_blacklist.push(ip);
		// blacklist ip in file
		fs.appendFile(_blackpath , ip + nl, encoding='utf8', function (err) {
			if(err) logger.error('error in updating blacklist [' + err + ']');
		});
	};

	// check if the ip is blacklisted/banned
	this.isBanned = function(ip) {
		for (i in _blacklist) {
			if (_blacklist[i] == ip) {
				logger.warn('ip: ' + ip + ' is banned');
				return true;
			}
		} 
		return false;
	}
	
	// if the whitelist file is not empty check if the ip is listed/allowed
	this.isAllowed = function(ip) {
		if (_whitelist.length == 0) return true;
		for (i in _whitelist) {
			if (_whitelist[i] == ip) return true;
		}
		logger.warn('ip: ' + ip + 'is not allowed');
		return false;
	}
	
	// unban all blacklisted ips
	// BUGFIX: unban clients individually - ensure ban-time has elapsed 
	var _unBan = function() {
		_blacklist = [];
		fs.writeFile(_blackpath, '', function(err){
			if (err) console.error(err);
			else logger.info('delete blacklist');
		});
		_blacklist = [];
		setTimeout(_unBan, _unban*1000);
	};
	
	// read the allowed and blocked ip addresses from the black- & whitelist
	// is triggered once when server starts & and everytime the config changes
	var _updatePermissions = function() {
		logger.info("update permissions");
		try {
			fs.readFile(_whitepath, encoding='utf8', function(err, data){
				if (err) logger.error('error reading whitelist [' + err + ']');
				else if(data) _whitelist = data.toString().split('\n');
				else _whitelist = [];
			});
			fs.readFile(_blackpath, encoding='utf8', function(err, data){
				if (err) logger.error('error reading blacklistitelist [' + err + ']');
				else if(data) _blacklist = data.toString().split('\n');
				else _blacklist = [];
			});
		} catch (err) {
			logger.error(err);
		}
	}
	
	// watch the config files for black- and whitelist
	// if a file changes update the list at runtime - no restart required
	var _watchPermissions = function(){
		try {
			fs.watchFile(_blackpath, function(c,p) { _updatePermissions(); });
			fs.watchFile(_whitepath, function(c,p) { _updatePermissions(); });
		} catch (err){
			logger.error(err);
		}
	}
	
	// initialize
	_unBan();
	_watchPermissions();
	_updatePermissions();
};

exports.Permissions = Permissions;