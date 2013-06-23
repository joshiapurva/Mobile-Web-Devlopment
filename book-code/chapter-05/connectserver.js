
var connect = require('connect');
var util    = require('util');

function sendjson(res,obj){
  res.writeHead(200,{
    'Content-Type': 'text/json',
  });
  var objstr = JSON.stringify(obj);
  util.debug('SENDJSON:'+objstr);
  res.end( objstr );
}


var server = connect.createServer(
  connect.router(function(app){

    app.get('/foo',function(req,res){
      sendjson(res,{path:'foo'});
    })

    app.get('/bar',function(req,res){
      sendjson(res,{path:'bar'});
    })
  })
);

server.listen(3000);
util.debug('Server running at http://127.0.0.1:3000');