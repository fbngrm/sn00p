var sys  = require('sys');
var fs  = require('fs');
var Snoop = require('./snoops/snoop').Snoop;
var Permissions = require('./snoops/permissions').Permissions;
var BruteForce = require('./snoops/bruteforce').BruteForce;
var SQLi = require('./snoops/sqli').SQLi;
var LFI = require('./snoops/lfi').LFI;
var XSS = require('./snoops/xss').XSS;
var Router = require('./services/router').Router;
var Logger = require('./services/logging').Logger;
var HttpServer = require('./server/http').Server; 
var HttpsServer = require('./server/https').Server; 
var TestApps = require('./server/testapps').Server; 
var FileServer = require('./server/static').FileServer; 
var config = require('./conf/config.json');

// router to provide options for proxy requests
var router = new Router(config.router);

// logger to log to console and file
var logger = new Logger(config.logging);

// module to read permissions from white- & blacklists
var permissions = new Permissions(config.permissions);
// module to detect requests at frequent intervals
var bf = new BruteForce(config.bruteforce);
// module to detect sql syntax/metachars in request data
var sqli = new SQLi();
// module to detect javascript syntax/metachars in request data
var xss = new XSS();
// module to detect directory-traversal syntax in url
var lfi = new LFI();
// load the snoop with permissions & detection modules
var snoop = new Snoop(permissions, [bf, sqli, xss, lfi]);

// fileserver to serve static content
var fileServer = new FileServer();
// http-proxy
var httpServer = new HttpServer(router, snoop, fileServer, {});
httpServer.start();
// https-proxy
var httpsServer = new HttpsServer(router, snoop, fileServer, config.https);
httpsServer.start();

// test apps
var testApp = new TestApp(fileServer);
testApps.startHttp();
testApps.startHttps();
