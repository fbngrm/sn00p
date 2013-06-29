var mysql = require('mysql');

MySqlHandler = function(host, database, user, password) {
  console.log('try to connect to mysql');
  _this = this;
  _this.connection = mysql.createConnection({
    host   : host, 
    database : database, 
    user   : user, 
    password : password
  
  });
  _this.connection.connect(function(error){
    if(error){
      console.log("CONNECTION ERROR: " + error);
    }
  });
  _this.initUserTable(function(error){
    if(error){
      console.log("CONNECTION ERROR: " + error);
    }
  });
  console.log('initialized connection to ' + database + ' on ' + host);
}

/*
Insert user data into the users table. 
Rely on properly escaped input data to prevent sql-injection flaws!!!
The password should be a salted hash - never use plaintext to store a pasword!!!
*/
MySqlHandler.prototype.addUser = function(user, callback) {
  // check if passwords match
  if (user.pass_1 != user.pass_2 ) {
    callback({user: user.username, email: user.email});
  } else {
    // check if email exists
    _this.getUserByEmail(user.email, null, function(error, user_mail){
      if(error){
        callback(error);
      } else if (user_mail != '') {
        callback({user: user.username, email: ''});
      } else {
        // check if username exists
        _this.getUserByName(user.username, function(error, user_name){
          if (error) {
            callback(error);
          } else if (user_name != ''){
            callback({user: '', email: user.email});
          } else {
            // everything is fine - add user
            _this.saveUser(user, callback);
          }
        });
      }
    });
  }
}

MySqlHandler.prototype.saveUser = function(user, callback){
  var query = 'INSERT INTO users (username, email, password) VALUES ' + 
    '("' + user.username + '", "' + user.email + '", "' + user.pass_1 + '")'
  this.connection.query( query, function(error, user) {
    if(error) {
     callback(error);
    } else {
      callback(null, user);
    }
   });
}

/*
Search for an email in the users table. 
Rely on properly escaped input data to prevent sql-injection flaws!!!
The password should be a salted hash - never use plaintext to store a pasword!!!
*/
MySqlHandler.prototype.getUserByEmail = function( email, password, callback){
  if(password) {
    // BUGFIX: A not properly escaped input could be:  " or '1'='1' -- '
    // This would result in the manipulated query: 
    // SELECT * FROM users WHERE email = "" or '1'='1' -- '" AND password = " "
    // where '1'='1' is always true
    var query = 'SELECT * FROM users WHERE email = "' + email + '" AND password = "' + password + '"';
    console.log('DANGER: Ensure input data is properly escaped before performing database queries!!!');
    console.log('Try to log user in - using query: \n' + query);
  } else {
    var query = 'SELECT * FROM users WHERE email = "' + email + '"';
    console.log('DANGER: Ensure input data is properly escaped before performing database queries!!!');
    console.log('Try to find user by email - using query: \n' + query);
  }
  this.connection.query( query, function(error, user) {
    if(error) {
     callback(error);
    } else {
     callback(null, user);
    }
   });
}

/*
Search for a username in the users table. 
Rely on properly escaped input data to prevent sql-injection flaws!!!
The password should be a salted hash - never use plaintext to store a pasword!!!
*/
MySqlHandler.prototype.getUserByName = function( name, callback){
  var query = 'SELECT * FROM users WHERE username = "' + name + '"';
  this.connection.query( query, function(error, user) {
    if(error) {
     callback(error);
    } else {
     callback(null, user);
    }
   });
}

/*
Search for an id in the users table. 
Rely on properly escaped input data to prevent sql-injection flaws!!!
The password should be a salted hash - never use plaintext to store a pasword!!!
*/
MySqlHandler.prototype.getUserById = function(id, callback){
  var query = 'SELECT * FROM users WHERE id = "' + id + '"';
  this.connection.query( query, function(error, user) {
    if(error) {
     callback(error);
    } else {
     callback(null, user);
    }
   });
}
/*
Initializes the user table
*/
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