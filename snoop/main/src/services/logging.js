var winston = require('winston');
var dateUtils = require('../utils/dateutils').DateUtils;


var Logger = function(conf){

	var _conf = conf || {};
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