/*
 * helper functions to work with date objects
 */

exports.TypeUtils = new function(){

	// get the tyoe of an object - works only for build in types
	this.type = function(obj){
		return Object.prototype.toString.apply(obj);
	};
	// compare the types of two objects - returns true if equal
	this.compare = function(obj1, obj2){
		return Object.prototype.toString.apply(obj1) === Object.prototype.toString.apply(obj1);
	};
};
