
var common = require('./common.js');
var util    = common.util;
var connect = common.connect;
var mongo   = common.mongo;



function total(kind,period,startindex,endindex,win){
  mongo.coll('agg',function(agg){
    agg.find(
      {kind:kind,period:period,
       index:{$gte:startindex,$lte:endindex}
      },
      {val:1},
      mongo.res(function(cursor){
        var totalres = 0;
        cursor.each(mongo.res(function(item){
          if( item ) {
            totalres += item.val;
          }
          else {
            win(totalres);
          }
        }));
      })
    )
  })
}


function load(kind,resultperiod,time,win) {
  var sec = common.timesec(time);
  var range = 60;
  var fromsec = sec - range * common.SEC[resultperiod];

  var startval = 0;
  var periods = ['day','hour','minute','second'];

  function totalinperiod(p,startsec,win) {
    var period = periods[p];
    var finalperiod = period == resultperiod;

    var startindex = common[period](startsec);
    var endindex = common[period](fromsec)-(finalperiod?0:1);

    total(kind,period,startindex,endindex,function(totalres){
      startval += totalres;

      if( finalperiod ) {
        win(startval,endindex);
      }
      else {
        totalinperiod(p+1,common.sec(period,endindex),win);
      }
    })
  }

  totalinperiod(0,0,function(startval,startindex){
    var runningtotal = startval;
    var endindex = common[resultperiod](sec);
    var points = [];

    mongo.coll('agg',function(agg){
      agg.find(
        {kind:kind,period:resultperiod,
         index:{$gte:startindex,$lte:endindex}
        },
        {val:1,index:1},
        mongo.res(function(cursor){
          cursor.each(mongo.res(function(item){
            if( item ) {
              runningtotal+=item.val;
              points[item.index-startindex] = 0+runningtotal;
            }
            else {
              var lastval = startval;
              for(var i = 0; i < range; i++) {
                if( !points[i] ) {
                  points[i] = lastval;
                }
                else {
                  lastval = points[i];
                }
              }

              var periodsec = common.SEC[resultperiod];
              win(1000*common.sec(resultperiod,startindex),
                  1000*common.sec(resultperiod,endindex),
                  1000*periodsec,
                  points);
            }
          }));
        })
      )
    })
  })
}



var server = connect.createServer(
  connect.router(function(app){

    // kind   = total,done,notdone; 
    // period = day|hour|minute|second
    // time   = UTC millis
    app.get('/todo/stats/data/:kind/:period/:time',function(req,res,next){
      var kind   = req.params.kind;
      var period = req.params.period;
      var time   = req.params.time;

      load(
        kind,period,time,
        function(start,end,step,points){
          common.sendjson(res,{
            kind:kind,period:period,step:step,start:start,end:end,points:points
          });
        }
      )
    })
  })
)

mongo.init('todo','localhost');
mongo.open();

server.listen(3001);

