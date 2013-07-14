var winston = require('winston');
var dateUtils = require('../utils/dateutils').DateUtils;
var config = require('../conf/config.json');
var sys = require('sys');

/*
 * provide logging to console & file
 * use winston module: 
 * https://github.com/flatiron/winston
 */
exports.Logger = new function() {
	// if not supplied use default 
	var default_ = {
			console: {
				level:"info", 
				colorize: 'true'
			},
			file: {
				filename:"../../log/server.log", 
				level:"warn",
				json : false
			}
	};
	// config
	var conf = config || {};
	var logging  = conf.logging || default_ ;
	
	try {
		logging.console.timestamp = dateUtils.getDate;
		logging.file.timestamp = dateUtils.getDate;
	} catch (err) {
		sys.log('could not set common timestamp');
	}
	
	winston.Logger.prototype.block = function(ip){
		this.warn('BLOCKED REQUEST FROM IP: ' + ip);
	}
	
	// BUGFIX: check if file exists
	return new winston.Logger({
	    transports: [
	      new winston.transports.Console(logging.console),
	      new winston.transports.File(logging.file)
	    ]
	});	
}

