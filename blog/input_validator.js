/*
Class to validate all input data that the application is using.
*/

var InputValidator = function(conf){
  this.conf = conf;
};

/*
Convert a JavaScript-Object to lowercase. All keys and values of type "string" will be converted. 
*/
InputValidator.prototype.lower = function(data){
  var lower = null;
  
  
  if (typeof(data) == "number"){
    return data;
  } else if (typeof(data) == "string"){
    return data.toLowerCase();
  } else if (data && typeof(data.length) != "undefined") {
    lower = [];
  } else {
    lower = {};
  }
  
  for (var key in data){
    lower[String(key).toLowerCase()] = this.lower(data[key]);
  }
  return lower;
}
// export module
exports.InputValidator = InputValidator;