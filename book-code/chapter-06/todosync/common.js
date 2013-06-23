
var util     = exports.util     = require('util');
var connect  = exports.connect  = require('connect');
var simpledb = exports.simpledb = require('simpledb');
var eyes     = exports.eyes     = require('eyes');


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

exports.sendjson = function(code,res,obj,sendtime){
  res.writeHead(code,{
    'Content-Type': 'text/json',
  });
  if( sendtime ) {
    obj.sendtime = new Date().getTime()
  }
  var objstr = JSON.stringify(obj);
  util.debug('SENDJSON:'+objstr);
  res.end( objstr );
}


