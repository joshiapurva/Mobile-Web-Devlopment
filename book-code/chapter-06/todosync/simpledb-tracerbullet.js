
var simpledb = require('simpledb')
var eyes     = require('eyes')

var keys = require('./keys.js')


var debug = 'debug' == process.argv[2]


var sdb = new simpledb.SimpleDB(
  {keyid:keys.keyid,secret:keys.secret},
  debug?simpledb.debuglogger:null
)


function error(win){
  return function(error,result,metadata){
    if( error ) {
      eyes.inspect(error)
    }
    else {
      eyes.inspect(result)
      win(result,metadata)
    }
  }
}


sdb.createDomain(
  'test',
  error(function(res,meta){

;sdb.putItem(
  'test',
  'item1',
  {attr1:'value1',attr2:'value2'},
  error(function(res,meta){
  
;sdb.getItem(
  'test',
  'item1',
  error(function(res,meta){

})) })) }))
