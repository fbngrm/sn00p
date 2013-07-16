// imports
var sys  = require('sys');
var fs  = require('fs');
var Snoop = require('./snoops/snoop').Snoop;
var Permissions = require('./snoops/permissions').Permissions;
var BruteForce = require('./snoops/bruteforce').BruteForce;
var SQLi = require('./snoops/sqli').SQLi;
var LFI = require('./snoops/lfi').LFI;
var XSS = require('./snoops/xss').XSS;
var Router = require('./services/router').Router;
var Proxy = require('./server/proxy_commons').Proxy; 
var HttpServer = require('./server/http_proxy').Server; 
var HttpsServer = require('./server/https_proxy').Server; 
var TestApps = require('./server/testapps').Server; 
var FileServer = require('./server/static').FileServer; 
var config = require('./conf/config.json');

/* 
 * all objects beeing used in this application are 
 * created here.
 * all dependencies get supplied to the requiering 
 * object as arguments.
 * dependency injection is used as a design principle
 * to easily replace dependencies by mock objects in tests
 */

// router to provide address resolution for proxy requests
var router = new Router(config.router);

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
// to perform the security checks
var snoop = new Snoop(permissions, [bf, sqli, xss, lfi]);

// fileserver to serve static content
var fileServer = new FileServer();
// proxy-commons to create http/https server
var proxy = new Proxy(fileServer, snoop);
// http-proxy
var httpServer = new HttpServer(proxy, router, fileServer, {});
// start the server
httpServer.start();
// https-proxy
var httpsServer = new HttpsServer(proxy, router, fileServer, config.proxy.https);
// start the server
httpsServer.start();

// test apps
var testApps = new TestApps(fileServer);
// start the http-test-server
testApps.startHttp();
// start the https-test-server
testApps.startHttps();
