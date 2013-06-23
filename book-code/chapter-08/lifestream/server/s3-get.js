
var fs   = require('fs')
var knox = require('knox')
var util = require('util')

// amazon keys
var keys = require('./keys.js')

var testfile = 'Ireland_circa_900.png'
var savefile = 'Ireland_circa_900-saved.png'


var client = knox.createClient({
  key:    keys.keyid,
  secret: keys.secret,
  bucket: 'rjrodger-mobile-cloud-apps',
})


var outstream = fs.createWriteStream(savefile)

var req = client.get(testfile)
req.end()

req.on('response',function(res){
  console.log('response: '+res.statusCode)

  res.on('data',function(chunk){
    console.log('get: '+chunk.length)
    outstream.write(chunk)
  })

  res.on('end',function(){
    console.log('done')
    outstream.end()
  })
})

req.on('error',function(err){
  console.log('error: '+err)
})

