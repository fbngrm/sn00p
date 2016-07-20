#sn00p

<img src="snoop/px/sn00py.jpg" width="400px"></img>

sn00p is a proof of concept application firewall written in node.js. Although it is recognizing harmul patterns in network traffic it is not meant to be used in production environments. 

#Modus Operandi

sn00py runs as a proxy in front of one or several apps. The incoming traffic is analyzed with regular expressions for several harmful patterns. If an IP is identified to send attack vectors it is blocked for future requests. The timespan of blocking can be configured. Patterns are searched in the URL, Cookies and POST data. IPs can be blacklisted and whitelisted.

#Usage

In the default configuration sn00py runs on port 8000 for http and 8080 for https. The repository contains a test app running on port 9000 for http and 9090 for https traffic as well as the required certs for https. After cloning the repo install the dependencies via `npm install`. You can start the app by running `node snoop/main/src/main.js`. Navigate to `localhost:9000/login/` and start hacking. 

#Attack Vectors

Incoming traffic is analyzed for the following attack vectors and patterns.

**SQL Injection**

```javascript
/*
 * simple-xss
 *
 * ((\%3C)|<) 	- matches the opening angle bracket or its hex equivalent
 * ((\%2F)|\/)* - matches the forward slash for a closing tag or its hex equivalent
 * [a-z0-9\%]+ 	- matches an alphanumeric string inside the tag, or hex representation of these
 * ((\%3E)|>) 	- matches the closing angle bracket or hex equivalent
 */
var simpleXss = /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i;

/*
 * image-src xss
 * 
 * (\%3C)|<) 		- matches the opening angle bracket or its hex equivalent
 * (\%69)|i|(\%49)	- matches lowercase "i", its hex equivalent or the hex representation "I"
 * (\%6D)|m|(\%4D)	- matches lowercase "m", its hex equivalent or the hex representation "M"
 * (\%67)|g|(\%47)	- matches lowercase "g", its hex equivalent or the hex representation "G"
 * [^\n]+ 			- matches any character other than a new line following the <img
 * (\%3E)|>) 		- matches the closing angle bracket or its hex equivalent
 */
var imageSrc = /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/i;

/*
 * pranoid xss
 *
 * (\%3C)|<) 		- matches the opening angle bracket or its hex equivalent
 * [^\n]+ 			- matches any character other than a new line
 * (\%3E)|>) 		- matches the closing angle bracket or its hex equivalent
 */
var paranoid = /((\%3C)|<)[^\n]+((\%3E)|>)/i;
```

**XSS - Cross Site Scripting**

```javascript
/*
 * simple-xss
 *
 * ((\%3C)|<) 	- matches the opening angle bracket or its hex equivalent
 * ((\%2F)|\/)* - matches the forward slash for a closing tag or its hex equivalent
 * [a-z0-9\%]+ 	- matches an alphanumeric string inside the tag, or hex representation of these
 * ((\%3E)|>) 	- matches the closing angle bracket or hex equivalent
 */
var simpleXss = /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i;

/*
 * image-src xss
 * 
 * (\%3C)|<) 		- matches the opening angle bracket or its hex equivalent
 * (\%69)|i|(\%49)	- matches lowercase "i", its hex equivalent or the hex representation "I"
 * (\%6D)|m|(\%4D)	- matches lowercase "m", its hex equivalent or the hex representation "M"
 * (\%67)|g|(\%47)	- matches lowercase "g", its hex equivalent or the hex representation "G"
 * [^\n]+ 			- matches any character other than a new line following the <img
 * (\%3E)|>) 		- matches the closing angle bracket or its hex equivalent
 */
var imageSrc = /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/i;

/*
 * pranoid xss
 *
 * (\%3C)|<) 		- matches the opening angle bracket or its hex equivalent
 * [^\n]+ 			- matches any character other than a new line
 * (\%3E)|>) 		- matches the closing angle bracket or its hex equivalent
 */
var paranoid = /((\%3C)|<)[^\n]+((\%3E)|>)/i;
```

**LFI - Local File Inclusion**

```javascript
/*
 * lfi
 *
 * \.\.\/ - matches "../" - used for directory-traversal attacks as url parameter
 */
var lfi = /\.\.\//; 
```

**Bruteforce Attacks**

The count of allowed requests as well as failed login attempts in a certain timespan can be configured.

#Credits

Strongly inspired by [Contra](https://github.com/contra). Lost the link to the repo :(


#License

GNU GPL 3.0
