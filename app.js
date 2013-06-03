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
var InputValidator = require('./input_validator').InputValidator;
var Fileserver = require('./static_file_server').Fileserver;
var dateFormat = require('dateformat');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  authProvider.findDocById('users', id, function (err, user) {
    done(err, user);
  });
});

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy( function(email, password, done) {
		authProvider.getUserByEmail('users', email, function(error, user){
				if(error) {
					return done(error);
				}
	        	if (!user) {
	        		return done(null, false, { message: '' }); 
	        	}
	        	if (user.password != password) { 
	        		return done(null, false, { message: user.email }); 
	        	}
	        	return done(null, user);
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
  app.use(express.session({cookie:{httpOnly: false}, secret: 'keyboard dog' }));
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

var dbHandler = new DBHandler('loose-node', 'localhost', 27017);
var authProvider = new DBHandler('auth', 'localhost', 27017);
var inputValidator = new InputValidator(null);

/*
If the user is authenticated, render the account page
*/
app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account.jade', { user: req.user, title: 'account' });
});

/*
Render the login page
*/
app.get('/login', function(req, res){
  res.render('login.jade', { user: req.user, message: req.flash('error'), title: 'login' });
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
  
/*
Render the sign in page.
*/
app.get('/sign', function(req, res){
  res.render('sign.jade', { user: req.user, email: req.flash('email'), 
  	user: req.flash('user'), title: 'sign' });
});
  
/*
Add a user to the database - sign in.
*/
app.post('/sign', function(req, res){
	req.logout();
	authProvider.saveUser('users', inputValidator.lower({
			username: req.param('user'), 
			email: req.param('username'), 
			pass_1: req.param('password'), 
			pass_2: req.param('pass_2')
		}), 
		function(error, user){
			if(error){
  				req.flash('user', error.user);
  				req.flash('email', error.email);
				res.redirect('/sign');
			} else {
	          	passport.authenticate('local')(req, res, function () {
	                res.redirect('/');
	            })
	        }
        });
});

/*
Log the user out and kill the session.
*/
app.get('/logout', ensureAuthenticated, function(req, res){
  req.logout();
  res.redirect('/');
});

/*
Render the HTML template startpage when a GET requests for "/" is received.
Get all documents in the zoo database to use them rendering the HTML data
*/
app.get('/', ensureAuthenticated, function(req, res){
   dbHandler.findDocs('nodes', {}, function(error, docs){
        res.render('index.jade', { 
                title: 'nodes',
                nodes: docs
        });
    })
});

/*
Render the HTML template startpage when a GET requests for "/" is received.
Get all documents in the zoo database to use them rendering the HTML data
*/
app.get('/cookie/:value', function(req, res) {
    console.log(req.params.value);
});

/*
Render the form to add a new animal when an GET request 
for "/animal/new" is received.
*/
app.get('/node/new', ensureAuthenticated, function(req, res) {
    res.render('node_new.jade', { 
        title: 'new node'
    });
});

/*
Add a new node to the db when a POST request for "/node/new" is received.
NOTE: No validation of the input data is performed!!!
*/
app.post('/node/new', ensureAuthenticated, function(req, res){
    fs.readFile(req.files.node_imgs.path, function (err, data) {
		var name = inputValidator.lower(req.files.node_imgs.name); 
		var newPath = __dirname + "/public/uploads/" + name;
		fs.writeFile(newPath, data, function (error) {
			if(error){
			   res.redirect('back');
			} else {
			    dbHandler.save('nodes', inputValidator.lower({
			        title: req.param('node_title'),
			        info: req.param('node_info'),
			        imgs: req.files.node_imgs.name,
			        keywords: req.param('node_keywords'),
			        username: req.user.username,
			        user_id: req.user._id
			    	}), 
			    	function(error, docs) {
			        	res.redirect('/');
			    });
			}
		});
	});
});

/*
Render the view for an specific node in the db when a GET 
request is received for "/animal/:id"
NOTE: No validation of the input data is performed!!!
*/
app.get('/node/:id', ensureAuthenticated, function(req, res) {
    dbHandler.findDocById('nodes', req.params.id, function(error, node) {
    	if(error || !node){
    		res.render('404.jade');
    	} else {
	        res.render('show_node.jade',
	        { 
	            title: node.title,
	            node: node
	        });
	   }
    });
});

/*
Render the view for an specific user in the db when a GET 
request is received for "/animal/:id"
NOTE: No validation of the input data is performed!!!
*/
app.get('/user/:name', ensureAuthenticated, function(req, res) {
    dbHandler.findDocs('nodes', inputValidator.lower({username: req.params.name}), 
    function(error, nodes) {
    	if(error || nodes.length == 0){
    		res.render('404.jade');
    	} else {
	        res.render('user_nodes.jade',
	        { 
	            title: req.params.name,
	            nodes: nodes
	        });
	    }
    });
});
/*
Render the view for an specific user in the db when a GET 
request is received for "/animal/:id"
NOTE: No validation of the input data is performed!!!
*/
app.get('/keyword/:word', ensureAuthenticated, function(req, res) {
    dbHandler.findDocs('nodes', inputValidator.lower({keywords: req.params.word}),
    function(error, nodes) {
    	if(error || nodes.length == 0){
    		res.render('404.jade');
    	} else {
	        res.render('keyword_nodes.jade',
	        { 
	            title: req.params.word,
	            nodes: nodes
	        });
	    }
    });
});
/*
Add a new comment to an animal when a POST request for "/animal/comment" is received.
NOTE: No validation of the input data is performed!!!
*/
app.post('/node/comment', ensureAuthenticated, function(req, res) {
    var created_at = inputValidator.lower(dateFormat());
    dbHandler.addComment('nodes', req.param('_id'), 
    inputValidator.lower({
        head: req.param('head'),
        comment: req.param('comment'),
        created_at: created_at,
        username: req.user.username,
        user_id: req.user._id
       }) , function( error, docs) {
           res.redirect('/node/' + req.param('_id'))
       });
});

app.listen(8080);
//fileserver.start();
console.log("Express server listening on port 8080 in %s mode", app.settings.env);

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
