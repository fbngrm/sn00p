

exports.Type = new function(){

	this.type = function(obj){
		return Object.prototype.toString.apply(obj);
	};
	this.compare = function(obj1, obj2){
		return Object.prototype.toString.apply(obj1) === Object.prototype.toString.apply(obj1);
	};
};