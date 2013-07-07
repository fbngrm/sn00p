
/*
 * helper functions to work with string objects
 */
 
exports.StringUtils = new function(){
	// check if the given string contains the given char
	this.contains = function(str, char) {
		return str.indexOf(char) !== -1
	};
};