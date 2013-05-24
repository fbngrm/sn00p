/**
 * A really simple blog to test Code-Injection(XSS, SSJI) and NoSQL-Injections.
 * Contains no security, authentication or session management.
 */
// imports
var express = require('express');
var app = express();
var fs = require("fs");
var url = require("url");
var path = require("path");
var passport = require('passport');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var DBHandler = require('./db_handler').DBHandler;
var AuthProvider = require('./auth_provider').AuthProvider;
var Fileserver = require('./static_file_server').Fileserver;

var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

// configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  // use jade to render the html
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(flash());
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  // use stylus to render the css
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
});

// configure the app to show errors when running in development mode
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});
// do not show errors in production mode
app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var animalProvider = new DBHandler('zoo', 'localhost', 27017);
var authProvider = new AuthProvider('localhost', 27017);

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account.jade', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login.jade', { user: req.user, message: req.flash('error') });
});
// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/sign', function(req, res){
  res.render('sign.jade', { user: req.user, message: req.flash('error') });
});

app.post('/sign', function(req, res){
	authProvider.addUser({
		username: req.param('username'), 
		email: req.param('email'), 
		pass_1: req.param('pass_1'),
		pass_2: req.param('pass_2')
		}, 
		function(error, user){
			if(error){
				res.redirect('/sign');
			} else {
	        	res.redirect('/');
			}
        });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

/*
Render the HTML template startpage when a GET requests for "/" is received.
Get all documents in the zoo database to use them rendering the HTML data
*/
app.get('/', ensureAuthenticated, function(req, res){
   animalProvider.findAllDocs('animals', function(error, docs){
        res.render('index.jade', { 
                title: 'Loose Node',
                animals: docs
        });
    })
});

/*
Render the form to add a new animal when an GET request 
for "/animal/new" is received.
*/
app.get('/animal/new', function(req, res) {
    res.render('animal_new.jade', { 
        title: 'New Animal'
    });
});

/*
Add a new animal to the db when a POST request for "/animal/new" is received.
NOTE: No validation of the input data is performed!!!
*/
app.post('/animal/new', function(req, res){
    animalProvider.save('animals', {
        name: req.param('name'),
        food: req.param('food'),
        neighbors: req.param('neighbors'),
        legs: req.param('legs'),
        color: req.param('color')
    }, function(error, docs) {
        res.redirect('/')
    });
});

/*
Render the view for an specific animal in the db when a GET 
request is received for "/animal/:id"
NOTE: No validation of the input data is performed!!!
*/
app.get('/animal/:id', function(req, res) {
    animalProvider.findDocById('animals', req.params.id, function(error, animal) {
        res.render('show_animal.jade',
        { 
            title: animal.name,
            animal: animal
        });
    });
});

/*
Add a new comment to an animal when a POST request for "/animal/comment" is received.
NOTE: No validation of the input data is performed!!!
*/
app.post('/animal/comment', function(req, res) {
    animalProvider.addComment('animals', req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/animal/' + req.param('_id'))
       });
});

app.listen(8080);
//fileserver.start();
console.log("Express server listening on port in %s mode", app.settings.env);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

/*
var fileserver = new Fileserver();

// routes
app.get('/upload', function(req, res){
	res.render('upload.jade', { 
        title: 'Image Upload'
    });
});

app.post('/upload', function(req, res){
	fs.readFile(req.files.displayImage.path, function (err, data) {
		var name = req.files.displayImage.name; 
		var newPath = __dirname + "/public/uploads/" + name;
		fs.writeFile(newPath, data, function (err) {
		    res.redirect("back");
		});
	});
});

app.get('/img', function(req, res){
	try{
		var url_parts = url.parse(req.url, true);
		var file_name = url_parts.query.img;
		var full_path = path.join(__dirname, 'public', 'uploads', file_name);
		
		fs.exists(full_path, function(exists){
			if(!exists){
				res.render('404.jade', {});
			}
			else{
				fs.readFile(full_path, "binary", function(err, file) {
					res.writeHeader(200);  
			        res.write(file, "binary"); 
			        res.end();
				});
			}
		});
	}catch (err){
		res.render('500.jade', {});
	}
});
*/
