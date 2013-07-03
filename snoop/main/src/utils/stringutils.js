

exports.StringUtils = new function(){

	this.contains = function(str, char) {
		return str.indexOf(char) !== -1
	};
};