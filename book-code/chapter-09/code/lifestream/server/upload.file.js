
var common = require('./common.js')

var connect = common.connect
var util    = common.util
var fs      = common.fs


var bs = 48

var server = connect.createServer(
  connect.router(function(app){
 
    app.post('/lifestream/api/upload',function(req,res) {
      util.debug('upload start')

      var w = fs.createWriteStream('pic.jpg')
      var remain = ''

      req.on('data', function(chunk) {
        var ascii = remain + chunk.toString('ascii')
        var bslen = bs * Math.floor( ascii.length / bs )

        var base64     = ascii.substring(0,bslen)
        var binary     = new Buffer(base64,'base64')
        var newremain  = ascii.substring(bslen)

        util.debug('in='+ascii.length+' out='+binary.length )
  
        remain = newremain
        w.write(binary)
      });
    
      req.on('end', function() {
        if( 0 < remain.length ) {
          w.write(new Buffer(remain,'base64'))
        }
        w.end()

        util.debug('upload end')

        res.writeHead(200, "OK", {'Content-Type': 'application/json'});
        res.end('{"ok":true}')
      });

    })
  }),
  connect.static('../public')
)

server.listen(3009)
