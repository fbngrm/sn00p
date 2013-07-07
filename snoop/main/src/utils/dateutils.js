
/*
 * helper functions to work with date objects
 */

exports.DateUtils = new function(){

	// get a date in the format: dd mm hh:mm:ss
	this.getDate = function(){
		var _months = new Array ( );
			_months[_months.length] = "Jan";
			_months[_months.length] = "Feb";
			_months[_months.length] = "Mar";
			_months[_months.length] = "Apr";
			_months[_months.length] = "May";
			_months[_months.length] = "Jun";
			_months[_months.length] = "Jul";
			_months[_months.length] = "Aug";
			_months[_months.length] = "Sep";
			_months[_months.length] = "Oct";
			_months[_months.length] = "Nov";
			_months[_months.length] = "Dec";
			
		var _d = new Date();
	    var _date = _d.getDate();
	    var _month = _d.getMonth();
	    var _hours = _d.getHours();
	    var _mins = _d.getMinutes();
	    var _secs = _d.getSeconds();
	    
	    return _date + ' ' + _months[_month] + ' ' + _hours + ':' + _mins + ':' + _secs;
	};
};