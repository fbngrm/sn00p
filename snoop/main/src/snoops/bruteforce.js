var sys  = require('sys');

BruteForce = function(options) {

	var _options = options || {};	
	var _time = _options.time || 30;
	var _max_tries = _options.max_tries || 10;
	var _free_mem = _options.free_mem || 120;
	var _connections = {};
	var _urls = _options.urls;
	
	if (!_urls) throw 'no urls supplied';
	
	// garbage collection to delete old connections & release memory
	var _releaseMem = function(){
		sys.log('free memory / delete connections');
		now = Date.now();
		for (i in _connections) {
			if (_connections[i]['timestamp'] + _time*1000 < now) {
				// BUGFIX: does deleting elements change length/shift indices?
				delete _connections[i];
			}
		}
		setTimeout(_releaseMem, _free_mem*1000);
	};
	
	var _reset = function(ip){
		_connections[ip]['tries'] = 1;
		_connections[ip]['timestamp'] = Date.now();
	};

	var _addConnection = function(ip){
		if (_connections[ip]) {
			_connections[ip]['tries'] += 1;
		} else {
			_connections[ip] = {'tries': 1, 'timestamp': Date.now()};
		}
	};
	
	this.check = function(request, response, buffer){
		// ip address of the crrent request
		var ip = request.connection.remoteAddress;
		var url = request.url;		
		var protect = false;
		
		for (i in _urls) {
			if (_urls[i] === url) protect = true;
		}
		if (!protect) return false;
		
		sys.log('bruteForce check ip: ' + ip + ' - url: ' + url);
		
		if (_connections[ip])  {
			tries = _connections[ip]['tries'];
			timestamp  = _connections[ip]['timestamp'];
			
			too_much = tries >= _max_tries;
			in_time  = timestamp + _time*1000 > Date.now();
			
			if (too_much && in_time){
				sys.log('ip: ' + ip + ' blocked');
				return true;
			} else if (!in_time) {
				sys.log('reset counter for ip: ' + ip);
				_reset(ip);
			} else {
				_addConnection(ip);
			} 
		} else{
			_addConnection(ip);
		}
		return false;
	};
	
	_releaseMem();
};
exports.BruteForce = BruteForce;