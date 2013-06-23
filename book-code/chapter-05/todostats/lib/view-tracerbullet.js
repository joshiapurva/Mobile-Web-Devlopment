
var common = require('./common.js');
var util    = common.util;
var connect = common.connect;
var mongo   = common.mongo;


var server = connect.createServer(
  connect.router(function(app){

    // kind   = total,done,notdone; 
    // period = day|hour|minute|second
    // time   = UTC millis
    app.get('/todo/stats/data/:kind/:period/:time',function(req,res,next){
      var kind   = req.params.kind;
      var period = req.params.period;
      var time   = req.params.time;

      common.sendjson(res,{
        kind:kind,period:period,step:0,start:0,end:0,points:[]
      });
    })
  })
)

mongo.init('todo','localhost');
mongo.open();

server.listen(3001);

