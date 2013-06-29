var winston = require('winston');
var conf = require('../conf/config.js');


var Logger = function(){

	var default_ = {console:{level:"info"},file:{filename:"../../log/server.log", level:"debug"}};
	var logging  = conf.logging || default_ ;
	
	return new (winston.Logger)({
	    transports: [
	      new (winston.transports.Console)(logging.console),
	      new (winston.transports.File)(logging.file)
	    ]
	});
}

exports.Logger = Logger;