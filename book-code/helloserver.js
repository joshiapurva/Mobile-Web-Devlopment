
// import standard modules
var http = require('http');
var util = require('util');

var server = http.createServer(
  function(request, response){

    // print a debug message to standard output
    util.debug(request.method+' request, '+new Date());

    // send headers to HTTP client
    response.writeHead(
      200, 
      { 'Content-Type': 'text/plain' }
    );

    // send final content to HTTP client
    response.end('Hi! Your request URL was: '+request.url);
  }
);

// start up the server!
server.listen(3000, "127.0.0.1");
util.debug('Server running at http://127.0.0.1:3000');
