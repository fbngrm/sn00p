var sys  = require('sys');
var logger = require('../services/logging').Logger;

/*
 * counts the request from every client. can be used to 
 * determine if the defined threshold for requests per client 
 * in a certain timeframe is reached.
 */

BruteForce = function(options) {

	// options for defining the thresholds
	var _options = options || {};	
	// time(in seconds) to count requests
	var _time = _options.time || 30;
	// maximum amount of requests allowed to make by clients in $_time
	var _max_reqs = _options.max_reqs || 10;
	// interval(in seconds) to free memory
	var _free_mem = _options.free_mem || _time;
	// save the connections
	var _connections = {};
	// urls that should be protected/counted
	var _urls = _options.urls;
	
	// check dependencies
	if (!_urls) throw 'no urls to protect supplied';
	if (!logger) throw 'need logger'
	
	// delete old connections & free memory recursively in an
	// interval of $_free_mem
	var _freeMem = function(){
		logger.info('free memory / delete connections');
		now = Date.now();
		for (i in _connections) {
			if (_connections[i]['timestamp'] + _time*1000 < now) {
				// BUGFIX: does deleting elements change length/shift indices?
				delete _connections[i];
			}
		}
		setTimeout(_freeMem, _free_mem*1000);
	};
	
	// reset the counter for a client
	var _reset = function(ip) {
		_connections[ip] = {'tries': 1, 'timestamp': Date.now()};
	};

	// increment a connection counter
	var _incConnection = function(ip){
		if (_connections[ip]) {
			_connections[ip]['tries'] += 1;
		} else {
			_reset(ip);
		}
	};
	
	// detect requests at frequent intervals from a certain ip
	this.check = function(request, response, buffer){
		// ip address of the current request
		var ip = request.connection.remoteAddress;
		// url the request
		var url = request.url;
		// flag to determine if this url should be protected
		var protect = false;
		
		for (i in _urls) {
			if (_urls[i] === url) protect = true;
		}
		
		logger.info('bruteForce check ip: ' + ip + ' - url: ' + url);
		
		// if this url should be protected and the client 
		// already mead a requests check if the threashold is reached 
		// otherwise increment the counter
		// return true if too many requests are made else return false
		if (protect && _connections[ip]) {
			tries = _connections[ip]['tries'];
			timestamp  = _connections[ip]['timestamp'];
			
			too_much = tries >= _max_reqs;
			in_time  = timestamp + _time*1000 > Date.now();
			
			// to much requests - return true 
			if (too_much && in_time) {
				logger.warn('blcok request from ip: ' + ip);
				return true;
			// timeframe exceeded - reset the counter
			} else if (!in_time) {
				logger.info('reset counter for ip: ' + ip);
				_reset(ip);
			// timeframe not exceeded - increment the counter
			} else {
				_incConnection(ip);
			}
		// first request in this timeframe
		} else if (protect && !_connections[ip]) {
			_incConnection(ip);
		}
		// everything is alright - return false
		return false;
	};
	
	// initialize garbage collection
	_freeMem();
};
exports.BruteForce = BruteForce;