
var util    = require('util');

// USE npm mongo
var mongolib = require('./node/node-mongodb-native/lib/mongodb');

var name   = "test";
var server = "localhost";
var port   = mongolib.Connection.DEFAULT_PORT;

var db = 
  new mongolib.Db(
    name, 
    new mongolib.Server(server, port, {}), 
    {native_parser:true,auto_reconnect:true}
  );
util.debug('mongo:name='+name+',server='+server+',port='+port);

function res(win) {
  return function(err,result){
    if( err ) {
      util.debug('mongo:err='+err);
      db.close();
    }
    else {
      win(result);
    }
  }
}

db.open(res(function(){
  util.debug('mongo:ok');

  db.collection('fruit',res(function(fruit){
    util.debug('mongo:fruit:ok');

    fruit.insert(
      {name:'apple',price:0.99},
      res(function(apple){
        util.debug('mongo:insert:'+
                   JSON.stringify(apple));

        fruit.update(
          {name:'apple'},
          {$set:{price:1.99}},
          res(function(){
            util.debug('mongo:update');

            fruit.find(
              {name:'apple'},
              res(function(cursor){
                util.debug('mongo:cursor');

                cursor.each(
                  res(function(item){
                    if( item ) {
                      util.debug('mongo:item:'+
                                 JSON.stringify(item));
                    }
                    else {
                      db.close();
                    }
                  })
                )
              })
            )
          })
        )
      })
    )
  }))
}));

