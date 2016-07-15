#sn00py

sn00py is a proof of concept application firewall written in node.js. Although it is recognizing harmul patterns in network traffic it is not meant to usen in production environments. 

#Modus Operandi
sn00py runs as a proxy in front of one or several apps. The incoming traffic is analyzed with regular expressions for several harmful patterns. If an IP is identified to send attack vectors it is blocked for future requests. The timespan of blocking an attacker can be configured. Patterns are searched in the URL, Cookies and POST data. IPs can be blacklisted and whitelisted.

#Usage
In the default configuration sn00py runs on port 8000 for http and 8080 for https. The repository contains a test app running on port 9000 for http and 9090 for https traffic. After cloning the repo install the dependencies via `npm install`. You can start the app by running `node snoop/main/src/main.js`. Navigate to localhost:9000/login/ and try to bypass the login form. 

#Attack Vectors
Incoming traffic is analyzed for the follwoing attack vectors and patterns.

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

**SQL Injection**

**XSS - Cross Site Scripting**
