var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var dateFormat = require('dateformat');
var Server = require('mongodb').Server;

/*
Connect the db auth and assign the connection to this context/scope.
@param host: The host where the db is running on
@param port: The port used to connect the db
*/
AuthProvider = function(host, port) {
   this.db = new Db('auth', new Server(host, port, {auto_reconnect: true}, {}));
   this.db.open(function(){});
};

/*
Get the collection users in the auth db.
Call the callback function with either the data/collection or the error returned by the 
db-qeuery as argument. 
@param callback: The callback function to call after the db-query is finished
*/
AuthProvider.prototype.getUsers = function(callback){
	this.db.collection('users', function(error, users){
		if(error){
			callback(error);
		} else {
			callback(null, users);
		}
	});
};

AuthProvider.prototype.addUser = function(params, callback){
	this.getUsers(function(error, users){
		if(error){
			callback(error);
		} else {
			callback(null, users);
		}
	});	
};

exports.AuthProvider = AuthProvider;