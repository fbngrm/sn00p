var mysql = require('mysql');

MySqlHandler = function(host, database, user, password) {
	console.log('try to connect to mysql');
	this.connection = mysql.createConnection({
		host	 : host, 
		database : database, 
		user	 : user, 
		password : password
	
	});
	this.connection.connect(function(error){
		if(error){
			console.log("CONNECTION ERROR: " + error);
		}
	});
	this.initUserTable(function(error){
		if(error){
			console.log("CONNECTION ERROR: " + error);
		}
	});
	this.addUser('user', 'mail', 'pass', function(error){
		if(error){
			console.log("CONNECTION ERROR: " + error);
		}
	});
	console.log('initialized connection');
}

/*
Insert user data into the users table. 
Rely on properly escaped input data to prevent sql-injection flaws!!!
The password should be a salted hash - never use plaintext to store a pasword!!!
*/
MySqlHandler.prototype.addUser = function(username, email, password, callback){
	
	var query = 'insert into users (username, email, password) values ' + 
		'("' + username + '", "' + email + '", "' + password + '")'
	
	this.connection.query( query, function(error) {
      if(error) {
         callback(error);
      } else {
         callback(null);
      }
   });
}

MySqlHandler.prototype.initUserTable = function(callback){
	var query = 'CREATE TABLE IF NOT EXISTS users ' +
		'(id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, ' +
		'username VARCHAR(50) NOT NULL, ' +
		'email VARCHAR(255) NOT NULL, ' +
		'password VARCHAR(255) NOT NULL, ' +
		'created TIMESTAMP DEFAULT NOW())';
	this.connection.query( query, function(error) {
      if(error) {
         callback(error);
      } else {
         callback(null);
      }
   });
}

exports.MySqlHandler = MySqlHandler;