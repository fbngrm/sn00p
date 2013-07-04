var winston = require('winston');
var dateUtils = require('../utils/dateutils').DateUtils;

/*
 * provide logging to console & file
 * use winston module: 
 * https://github.com/flatiron/winston
 */
var Logger = function(conf){
	// get the configuration from param
	var _conf = conf || {};
	// if not supplied use default 
	var default_ = {
			console: {
				level:"info", 
				colorize: 'true', 
				timestamp: dateUtils.getDate
			},
			file: {
				filename:"../../log/server.log", 
				level:"debug"
			}
	};
	// config
	var logging  = _conf.logging || default_ ;
	
	// BUGFIX: check if file exists
	return new winston.Logger({
	    transports: [
	      new winston.transports.Console(logging.console),
	      new winston.transports.File(logging.file)
	    ]
	});	
}

exports.Logger = Logger;