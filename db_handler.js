var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var dateFormat = require('dateformat');

/*
Connect the db and assign the connection to this context/scope.
@param db: The name of the database to connect
@param host: The host where the db is running on
@param port: The port used to connect the db
*/
DBHandler = function(db, host, port) {
   this.db = new Db(db, new Server(host, port, {auto_reconnect: true}, {}));
   this.db.open(function(){});
};

/*
Get the collection 'collection' in the this.db.
Call the callback function with either the data/collection or the error returned by the 
db-qeuery as argument. 
@param collection: The name of the collection that should be accessed
@param callback: The callback function to call after the db-query is finished
*/
DBHandler.prototype.getCollection = function(collection, callback) {
   this.db.collection(collection, function(error, res_collection) {
      if(error) {
         callback(error);
      } else {
         callback(null, res_collection);
      }
   });
};

/*
Extract all documents in the collection 'collection' returned by this.getCollection
into an array. Call the callback function with this array as argument.
@param callback: A callback function to call after the query is finished
@param collection: The name of the collection that shoul be accessed
*/
DBHandler.prototype.findDocs = function(collection, query, callback) {
   this.getCollection(collection, function(error, res_collection) {
      if(error) {
         callback(error);
      } else {
         res_collection.find(query).toArray(function(error, results) {
            if(error) {
               callback(error);
            } else {
               callback(null, results);
            }
         });
      }
   });
};

/*
Persist an new document in the collection specified by param collection in the the db-connection bound to "this" context.
@param collection: The name of the collection that shoul be accessed
@param docs: A list of documents or one document
@param callback: A callback function to call after savig the data or to handle the error
*/
DBHandler.prototype.save = function(collection, docs, callback) {
   this.getCollection(collection, function(error, res_collection) {
      if(error) {
         callback(error);
      } else {
         if(typeof(docs.length)=="undefined") {
            docs = [docs];
         }
         for(var i=0; i<docs.length; i++) {
            doc = docs[i];
            doc.created_at = dateFormat();
            if(doc.comments === undefined) doc.comments = [];
            for(var j=0; j<doc.comments.length; j++) {
               doc.comments[j].created_at = dt;
            }
	        if(doc.keywords) {
	           var keywords = doc.keywords.split(',');
	           doc.keywords = [];
	           for(var i=0; i<keywords.length; i++){
	              doc.keywords[i] = keywords[i];
	           }
	        } else {
	         doc.keywords = [];
	        }
         }
         res_collection.insert(docs, function() {
            callback(null, docs);
         });
      }
   });
};

/*
Persist an new user in the collection specified by param collection in the the db-connection bound to "this" context.
@param collection: The name of the collection that shoul be accessed
@param docs: A list of users or one document
@param callback: A callback function to call after savig the data or to handle the error
*/
DBHandler.prototype.saveUser = function(collection, user, callback) {
   this.getCollection(collection, function(error, users) {
      if(error) {
         	    console.log(error);
         callback(error);
      } else {
         if(user.pass_1 != user.pass_2) {
            console.log('Passwords does not match!');
         	callback('Passwords does not match!');
         } else {
	         users.findOne({email: user.email}, {}, function(error, user_email) {
	         	if(error) {
	         	    console.log(error);
	         		callback(error);
	         	}
	            if(user_email) {
	            console.log('Email already exists!');
	               callback('Email already exists!');
	            } else {
			        users.findOne({username: user.username}, {}, function(error, user_name) {
				        if(error) {
	         	    console.log(error);
			         		callback(error);
			         	}
			            if(user_name) {
			            console.log('Username already exists!');
			               callback('Username already exists!');
			            } else {
			            console.log('Alright');
							var new_user = {};
					        new_user.username = user.username;
					        new_user.email = user.email;
					        new_user.password = user.pass_1;
					        new_user.created_at = dateFormat();
					        console.log(new_user);
					        users.insert(new_user, function() {
					           callback(null, new_user);
					        });
					    }
					});
			    }
			});
		}
      }
   });
};

/*
Search for a user in the collection specified by param collection in the the db-connection bound to "this" context.
@param collection: The name of the collection that shoul be accessed
@param email: The email address of the user to search for
@param callback: A callback function to call after savig the data or to handle the error
*/
DBHandler.prototype.getUserByEmail = function(collection, email, callback) {
   this.getCollection(collection, function(error, users) {
      if(error) {
         return callback(error);
      } else {
         users.findOne({email: email}, {}, function(error, user) {
            if(error) {
               return callback(error);
            } else {
		        return callback(null, user);
		    }
		});
      }
   });
};

/*
Find a document in the db by the unique id.
@param collection: The name of the collection that shoul be accessed
@param id: Hexadecimal representation of the _id value
@param callback: A callback function to call with the query result as argument
*/
DBHandler.prototype.findDocById = function(collection, id, callback) {
   this.getCollection(collection, function(error, res_collection) {
      if(error) {
         callback(error);
      } else {
         res_collection.findOne({_id: res_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
            if(error) {
               callback(error);
            } else {
               callback(null, result);
            }
         });
      }
   });
};
/*
Add comments to an document by updating the document with the given id.
@param collection: The name of the collection that shoul be accessed
@param id: Hexadecimal representation of the _id value
@param comment: The comment to add as a String
@param callback: A callback function to call with the query result as argument
*/
DBHandler.prototype.addComment = function(collection, id, comment, callback) {
   this.getCollection(collection, function(error, res_collection) {
      if(error) {
         callback( error );
      } else {
         res_collection.update(
            {_id: res_collection.db.bson_serializer.ObjectID.createFromHexString(id)},
            {"$push": {comments: comment}},
            function(error, doc){
               if(error) {
                  callback(error);
               } else {
                  callback(null, doc);
               }
            });
      }
   });
};
exports.DBHandler = DBHandler;