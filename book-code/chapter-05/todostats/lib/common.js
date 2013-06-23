
var util    = exports.util    = require('util');
var connect = exports.connect = require('connect');

// Time functions

exports.MINUTE = 60;
exports.HOUR   = 60 * exports.MINUTE;
exports.DAY    = 24 * exports.HOUR;

exports.SEC = {
  'second':1,
  'minute':exports.MINUTE,
  'hour':exports.HOUR,
  'day':exports.DAY,
}

exports.timesec = function(time) {
  return Math.floor( time / 1000 );
}

exports.second = function(second) {
  return second;
}

exports.minute = function(second) {
  return Math.floor( second / exports.MINUTE );
}

exports.hour = function(second) {
  return Math.floor( second / exports.HOUR );
}

exports.day = function(second) {
  return Math.floor( second / exports.DAY );
}

exports.sec = function(period,index) {
  return index * exports.SEC[period];
}


// JSON functions

exports.readjson = function(req,win) {
  var bodyarr = [];
  req.on('data',function(chunk){
    bodyarr.push(chunk);
  })
  req.on('end',function(){
    var bodystr = bodyarr.join('');
    util.debug('READJSON:'+req.url+':'+bodystr);
    var body = JSON.parse(bodystr);
    win && win(body);
  })
}

exports.sendjson = function(res,obj){
  res.writeHead(200,{
    'Content-Type': 'text/json',
  });
  var objstr = JSON.stringify(obj);
  util.debug('SENDJSON:'+objstr);
  res.end( objstr );
}


// MongoDB functions

// USE npm mongo
var mongodb = require('./node-mongodb-native/lib/mongodb');

var mongo = {
  mongo: mongodb,
  db: null,
}

mongo.init = function( name, server, port ){
  port = port || mongodb.Connection.DEFAULT_PORT;
  util.log('mongo:name='+name+',server='+server+',port='+port);
  mongo.db = 
    new mongodb.Db(
      name, 
      new mongodb.Server(server, port, {}), 
      {native_parser:true,auto_reconnect:true});
}

// version of the res function from mongo.js that
// has a callback for both success (win), and
// failure (fail)
mongo.res = function( win, fail ){
  return function(err,res) {
    if( err ) {
      util.log('mongo:err:'+JSON.stringify(err));
      fail && 'function' == typeof(fail) && fail(err);
    }
    else {
      win && 'function' == typeof(win) && win(res);
    }
  }
}

mongo.open = function(win,fail){
  mongo.db.open(mongo.res(function(){
    util.log('mongo:ok');
    win && win();
  },fail))
}

mongo.coll = function(name,win,fail){
  mongo.db.collection(name,mongo.res(win,fail));
}

exports.mongo = mongo;
