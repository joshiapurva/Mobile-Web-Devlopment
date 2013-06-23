
var common = require('./common.js');
var util    = common.util;
var connect = common.connect;
var mongo   = common.mongo;


var server = connect.createServer(
  connect.router(function(app){

    // POST {id:<string>}
    app.post('/todo/stats/init',function(req,res,next){
      common.readjson(req,function(json){
        common.sendjson(res,{ok:true,id:json.id});
      })
    })

    // POST {time:<UTC-millis>,total:<todos>,done:<done todos>}
    app.post('/todo/stats/collect/:id',function(req,res,next){
      var id = req.params.id;
      common.sendjson(res,{ok:true,id:id});
      common.readjson(req);
    })
  })
);


mongo.init('todo','localhost');
mongo.open()

server.listen(3000);

