var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var dateFormat = require('dateformat');

/*
Connect the db zoo and assign the connection to this context/scope.
@param host: The host where the db is running on
@param port: The port used to connect the db
*/
AnimalProvider = function(host, port) {
   this.db = new Db('zoo', new Server(host, port, {auto_reconnect: true}, {}));
   this.db.open(function(){});
};

/*
Get the collection animals in the zoo db.
Call the callback function with either the data/collection or the error returned by the 
db-qeuery as argument. 
@param callback: The callback function to call after the db-query is finished
*/
AnimalProvider.prototype.getAnimals = function(callback) {
   this.db.collection('animals', function(error, animal_collection) {
      if(error) {
         callback(error);
      } else {
         callback(null, animal_collection);
      }
   });
};

/*
Get all documents in the collection animals. Invoking the function this.getAnimals
and pass a callback function that finds the documents based on the result of this.getAnimals
(data or error).
@param callback: A callback function to call after the query is finished
*/
AnimalProvider.prototype.findAllAnimals = function(callback) {
   this.getAnimals(function(error, animal_collection) {
      if(error) {
         callback(error);
      } else {
         animal_collection.find().toArray(function(error, results) {
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
Persist an new document/animal in the collection animals of the zoo db.
@param animals: A list of animals or one animal
@param callback: A callback function to call after savig the data or to handle the error
*/
AnimalProvider.prototype.save = function(animals, callback) {
   this.getAnimals(function(error, animal_collection) {
      if(error) {
         callback(error);
      } else {
         if(typeof(animals.length)=="undefined") {
            animals = [animals];
         }

         for(var i=0; i<animals.length; i++) {
            animal = animals[i];
            animal.created_at = dateFormat();
            if(animal.comments === undefined) animal.comments = [];
            for(var j=0; j<animal.comments.length; j++) {
               animal.comments[j].created_at = dt;
            }
         }
         animal_collection.insert(animals, function() {
            callback(null, animals);
         });
      }
   });
};

/*
Find an animal in the db by the unique id.
@param id: Hexadecimal representation of the _id value
@param callback: A callback function to call with the query result as argument
*/
AnimalProvider.prototype.findAnimalById = function(id, callback) {
   this.getAnimals(function(error, animal_collection) {
      if(error) {
         callback(error);
      } else {
         animal_collection.findOne({_id: animal_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
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
Add comments to an animal by updating the document of the animal with the given id
@param id: Hexadecimal representation of the _id value
@param comment: The comment to add as a String
@param callback: A callback function to call with the query result as argument
*/
AnimalProvider.prototype.addComment = function(id, comment, callback) {
   this.getAnimals(function(error, animal_collection) {
      if(error) {
         callback( error );
      } else {
         animal_collection.update(
            {_id: animal_collection.db.bson_serializer.ObjectID.createFromHexString(id)},
            {"$push": {comments: comment}},
            function(error, animal){
               if(error) {
                  callback(error);
               } else {
                  callback(null, animal);
               }
            });
      }
   });
};
exports.AnimalProvider = AnimalProvider;