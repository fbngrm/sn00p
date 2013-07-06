/* 
 * patterns to detect sqli-, xss- & lfi-attacks with regular expressions
 * starting point for defining these patterns was:
 * http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
 */

/*-----------------*/
/*  sql-injection  */
/*-----------------*/

/*
 * sql meta-characters
 *
 * (\%3D)|(=) 	- matches "=" or its hex equivalent "%3D"
 * [^\n]*		- zero or more non-newline characters
 * (\%27)|(\')	- matches "'" or its hex equivalent "%27"
 * (\-\-)		- matches "--" - mssql & oracle comment - it is not 
 				  neccessary to check for hex equivalent because "-" 
 				  is not a html metacharacter and wont be encoded by the browser.
 				  using "%2D" (hex encoded "-") wont work in sqli
 * (\%23)|(#)	- matches "#" or its hex equivalent - mysql comment
 * i			- ignore case
 */
var metaChars = /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%23)|(#))/i;

/*
 * typical sqli
 *
 * \w* 				- zero or more alphanumeric or underscore characters
 * (\%27)|(\')		- matches "'" or its hex equivalent "%27"
 * (\%6F)|o|(\%4F)	- matches lowercase "o", its hex equivalent or the hex 
 *					  equivalent for capital "O". checking for capital ascii "O"
 *					  is not neccessary because of flag "i" - ignorecase
 * (\%72)|r|(\%52)	- matches lowercase "r", its hex equivalent or the hex 
 *					  equivalent for capital "R". checking for capital ascii "R"
 *					  is not neccessary because of flag "i" - ignorecase
 * i				- ignore case
 */
var typicalSqli = /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i;


/*
 * microsoft-sqli
 *
 * exec 	- the keyword required to run stored or extended procedures
 * (\s|\+)+ - one or more whitespaces or their HTTP encoded equivalents
 * (s|x)p 	- the letters 'sp' or 'xp' to identify stored or extended 
 			  procedures respectively
 * \w+ 		- one or more alphanumeric or underscore characters to complete 
 			  the name of the procedure
 * i		- ignore case
*/
var msSqli = /exec(\s|\+)+(s|x)p\w+/i;

/*
 * sqli keywords
 *
 * matches one or more whitespaces
 * followed by a sql keyword
 * followed by one or more whitespaces
 */
var union  =  /(\s|\+)+(UNION)(\s|\+)+/i;
var select  = /(\s|\+)+(SELECT)(\s|\+)+/i;
var insert  = /(\s|\+)+(INSERT)(\s|\+)+/i;
var update  = /(\s|\+)+(UPDATE)(\s|\+)+/i;
var delete_ = /(\s|\+)+(DELETE)(\s|\+)+/i;
var drop    = /(\s|\+)+(DROP)(\s|\+)+/i;


/*------------------------*/
/*  cross-site-scripting  */
/*------------------------*/

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
				
				
/*------------------------*/
/*  local-file-inclusion  */
/*------------------------*/

/*
 * lfi
 *
 * \.\.\/ - matches "../" - used for directory-traversal attacks as url parameter
 */
var lfi = /\.\.\//; 

// store all patterns in a dict
var patterns = {};

// add sqli regexes
patterns.sql = [metaChars, typicalSqli, msSqli, union, select, insert, update, delete_, drop];
// add xss regexes
patterns.xss = [simpleXss, imageSrc, paranoid];
// add lfi regexes
patterns.lfi = [lfi];

exports.patterns = patterns;
