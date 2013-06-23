
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


fs.stat(testfile, function(err, stat){
  if (err) throw err;

  var filesize = stat.size
  var instream = fs.createReadStream(testfile)

  var req = client.put(
    testfile,
    {
      'Content-Length':filesize,
      'x-amz-acl': 'public-read'
    }
  )

  instream.on('data',function(chunk){
    console.log('sending: '+chunk.length)
    req.write(chunk)
  })

  instream.on('end',function(){
    req.end()
    console.log('waiting for amazon...')
  })

  req.on('error',function(err){
    console.log('error: '+err)
  })

  req.on('response',function(res){
    console.log('response: '+res.statusCode)
  })
})
