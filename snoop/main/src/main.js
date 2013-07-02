var sys  = require('sys');
var Snoop = require('./snoops/snoop').Snoop;
var Permissions = require('./snoops/permissions').Permissions;
var BruteForce = require('./snoops/bruteforce').BruteForce;
var SQLi = require('./snoops/sqli').SQLi;
var LFI = require('./snoops/lfi').LFI;
var XSS = require('./snoops/xss').XSS;
var Router = require('./services/router').Router;
var Logger = require('./services/logging').Logger;
var HttpServer = require('./server/http').Server; 

var bruteOptions = {
		urls: ['/login', '/sign'],
		time: 30,
		max_tries: 10,
		free_mem: 120
	};

var permOptions = {
		blacklist: './conf/blacklist',
		whitelist: './conf/whitelist',
		unban: 30
	};

var router = new Router();
var logger = new Logger();

// detectives
var permissions = new Permissions(permOptions);
var bf = new BruteForce(bruteOptions);
var sqli = new SQLi();
var xss = new XSS();
var lfi = new LFI();
var snoop = new Snoop(router, permissions, [bf, sqli, xss, lfi]);
var httpServer = new HttpServer(snoop);
httpServer.start();

/*
var options = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/cert.pem')
};

var a = https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8021);
sys.log('starting https proxy firewall on port 8021');

*/
/*
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('request successfully proxied: ' + req.url +'\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9000);
*/