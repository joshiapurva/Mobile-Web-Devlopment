
var fs   = require('fs')
var knox = require('knox')

// amazon keys
var keys = require('./keys.js')

var testfile = 'Ireland_circa_900.png'


var client = knox.createClient({
  key:    keys.keyid,
  secret: keys.secret,
  bucket: 'rjrodger-mobile-cloud-apps',
})


client.del(testfile).on('response', function(res){
  console.dir(res);
}).end();
