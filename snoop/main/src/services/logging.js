var winston = require('winston');
var dateUtils = require('../utils/dateutils').DateUtils;
var config = require('../conf/config.json');
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
				colorize: 'true', 
				timestamp: dateUtils.getDate
			},
			file: {
				filename:"../../log/server.log", 
				level:"debug",
				json : false
			}
	};
	// config
	var conf = config || {};
	var logging  = conf.logging || default_ ;
	
	// BUGFIX: check if file exists
	return new winston.Logger({
	    transports: [
	      new winston.transports.Console(logging.console),
	      new winston.transports.File(logging.file)
	    ]
	});	
}

