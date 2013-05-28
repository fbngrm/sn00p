var InputValidator = function(conf){
	this.conf = conf;
};

InputValidator.prototype.lower = function(data){
	var lower = null;
	
    if (typeof(data) == "number"){
        return data;
    } else if (typeof(data) == "string"){
    	return data.toLowerCase();
    } else if (data.push) {
        lower = [];
    } else {
        lower = {};
	}
	
    for (var key in data){
        lower[String(key).toLowerCase()] = this.lower(data[key]);
    }
    return lower;
}

var l = new InputValidator(null);
var r = l.lower({1:"UPPER", 2:"lower", 3:"CamelCase", "four":{1:"fourOne", "Two":2}, "five":["ONE", 2, {1:"THree"}]});
console.log(r);


exports.InputValidator = InputValidator;