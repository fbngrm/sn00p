/**
 * A really simple blog to test Code-Injection(XSS, SSJI) and NoSQL-Injections.
 * Contains no security, authentication or session management.
 */

// imports
var express = require('express');
var app = express();
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
var AnimalProvider = require('./animal_provider').AnimalProvider;
var fs = require("fs");
var url = require("url");
var path = require("path");
var Fileserver = require('./static_file_server').Fileserver;

// configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  // use jade to render the html
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  // use stylus to render the css
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
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


//var articleProvider = new ArticleProvider('localhost', 27017);
var animalProvider = new AnimalProvider('localhost', 27017);
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

/*
Render the HTML template index.jade for requests to "/".
Get all documents in the zoo database to use them rendering the HTML data
*/
app.get('/', function(req, res){
   animalProvider.findAllAnimals( function(error, docs){
        res.render('index.jade', { 
                title: 'Zoo',
                articles:docs
        });
    })
});

app.get('/animal/new', function(req, res) {
    res.render('animal_new.jade', { 
        title: 'New Animal'
    });
});

app.post('/animal/new', function(req, res){
    animalProvider.save({
        name: req.param('name'),
        food: req.param('food'),
        neighbors: req.param('neighbors'),
        legs: req.param('legs'),
        color: req.param('color')
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/blog/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        res.render('blog_show-final.jade',
        { 
            title: article.title,
            article:article
        });
    });
});
app.post('/blog/addComment', function(req, res) {
    articleProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'))
       });
});
app.listen(8080);
fileserver.start();
console.log("Express server listening on port in %s mode", app.settings.env);