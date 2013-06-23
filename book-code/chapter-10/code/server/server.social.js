
var common  = require('./common.js')
var config  = common.config
var mongo   = common.mongo

var util    = common.util
var connect = common.connect
var knox    = common.knox
var uuid    = common.uuid
var oauth   = common.oauth
var url     = common.url
var request = common.request
var Cookies = common.Cookies


// API functions

function upload(req,res) {

  var bs = 48
  var bytes = 0
  
  var s3client = knox.createClient({
    key:    config.amazon.keyid,
    secret: config.amazon.secret,
    bucket: config.amazon.s3bucket,
  })

  var conlen   = parseInt( req.headers['content-length'], 10 )
  var padding  = parseInt( req.headers['x-lifestream-padding'], 10 ) 
  var bytelen = Math.floor( ((conlen-padding)*3)/4 )

  var picid = uuid()

  var s3req = s3client.put(
    picid+'.jpg',
    {
      'Content-Length':bytelen,
      'x-amz-acl': 'public-read'
    }
  )

  s3req.on('error',function(err){
    err400(res,'S3')(''+err)
  })

  var remain = ''

  req.streambuffer.ondata(function(chunk) {
    var ascii = remain + chunk.toString('ascii')
    var bslen = bs * Math.floor( ascii.length / bs )

    var base64     = ascii.substring(0,bslen)
    var binary     = new Buffer(base64,'base64')
    var newremain  = ascii.substring(bslen)

    bytes+=binary.length

    remain = newremain
    s3req.write(binary)
  })
  
  req.streambuffer.onend(function() {
    if( 0 < remain.length ) {
      var binary = new Buffer(remain,'base64')
      bytes+=binary.length
      s3req.write(binary)
    }
    s3req.end()
    common.sendjson(res,{ok:true,picid:picid})
  })
}

function stream(req,res) {
  finduser(true,['stream'],req,res,function(user,coll){
    common.sendjson(res,{ok:true,stream:user.stream})
  })
}


function post(req,res) {
  var merr = mongoerr400(res)

  var picid    = req.json.picid
  var username = req.params.username

  finduser(true,['followers'],req,res,function(user,coll){
    append(username,username,picid,coll,merr,function(){
      common.sendjson(res,{ok:true})
      
      var followers = user.followers
      function appendfollower(fI) {
        if( fI < followers.length ) {
          append(followers[fI],username,picid,coll,merr,function(){
            appendfollower(fI+1)
          })
        }
      }
      appendfollower(0)
      
    })
  })

}



function follow(req,res){
  followop('$addToSet',req,res)
}

function unfollow(req,res){
  followop('$pull',req,res)
}


function followop(opname,req,res) {
  var merr = mongoerr400(res)

  var op = {}
  op[opname] = { following: req.json.username }

  mongo.coll(
    'user',
    function(coll){

      coll.update(
        { username: req.params.username },
        op,
        merr(function(){
          
          var op = {}
          op[opname] = { followers: req.params.username }
              
          coll.update(
            { username: req.json.username },
            op,
            merr(function(){              
              common.sendjson(res,{ok:true})
            })
          )
        })
      )
    }
  )
}


function search(req,res){
  var merr = mongoerr400(res)

  mongo.coll(
    'user',
    function(coll){
      coll.find(
        {username:{$regex:new RegExp('^'+req.params.query)}},
        {fields:['username']},
        merr(function(cursor){
          var list = []
          cursor.each(merr(function(user){
            if( user ) {
              list.push(user.username)
            }
            else {
              common.sendjson(res,{ok:true,list:list})
            }
          }))
        })
      )
    }
  )
}


function loaduser(req,res) {
  var merr = mongoerr400(res)

  finduser(true,['username','name','following','followers','stream'],req,res,function(user){
    var userout = 
      { username:  user.username,
        name:      user.name,
        followers: user.followers,
        following: user.following,
        stream:    user.stream
      }
    common.sendjson(res,userout)
  })
}


function register(req,res) {
  var merr = mongoerr400(res)

  mongo.coll(
    'user',
    function(coll){

      coll.findOne(
        {username:req.json.username},

        merr(function(user){
          if( user ) {
            err400(res)()
          }
          else {
            var token = common.uuid()
            coll.insert(
              { username:  req.json.username,
                token:     token,
                followers: [],
                following: [],
                stream:    []
              },
              merr(function(){
                common.sendjson(res,{ok:true,token:token})
              })
            )
          }
        })
      )
    }
  )
}


function complete(req,res) {
  var username = oauthstate[req.params.token]
  if( !username ) {
    err400(res)()
  }
  else {
    delete oauthstate[req.params.token]
    common.sendjson(res,{username:username})
  }
}


// utility functions

var oauthstate = {}

var oauthactions = {
  facebook: {
    login: function(req,res) {
      var redirectUrl = 
        oauthclients.facebook.getAuthorizeUrl(
          {redirect_uri:'http://'+config.server+
           '/lifestream/api/user/oauth/facebook/callback', scope:'' })

      var token = req.params.token

      var cookies = new Cookies(req,res)
      cookies.set('lifestream_register',token, {path:'/'})

      res.writeHead( 301, {
        'Location':redirectUrl,
      })
      res.end()
    },

    callback: function(req,res) {
      var parsedUrl = url.parse(req.url, true);
      var cookies = new Cookies(req,res)
      var token = cookies.get('lifestream_register')

      oauthclients.facebook.getOAuthAccessToken(
        parsedUrl.query.code , 
        {redirect_uri:'http://'+config.server+
         '/lifestream/api/user/oauth/facebook/callback'}, 
        function( error, access_token, refresh_token ){
          if (!error) {
            res.writeHead( 301, {
              'Location':'http://'+config.server+
                '/lifestream/api/user/oauth/facebook/launch'
            })

            request.get({uri:'https://graph.facebook.com/me?access_token='+access_token}, function (err, res, body) {
              if( !err ) {
                var json = JSON.parse(body)
                var username = json.username
                oauthstate[token] = username
              }
              else {
                util.debug(JSON.stringify(error))
              }
            })
          }
          else {
            util.debug(JSON.stringify(error))
          }
          res.end()
        }
      )
    },

    launch: function(req,res) {
      res.writeHead(200)
      res.end( "<script>window.location='lifestream:///'</script>" )
    }
  },

  twitter: {
    login: function(req,res) {
      var token = req.params.token
      var cookies = new Cookies(req,res)
      cookies.set('lifestream_register',token, {path:'/'})

      oauthclients.twitter.getOAuthRequestToken(
        function(
          error, 
          oauth_token, 
          oauth_token_secret, 
          oauth_authorize_url, 
          additionalParameters) 
        {
          if (!error) {
            oauthstate[token] = oauth_token_secret

            res.writeHead( 301, {
              "Location":
              "http://api.twitter.com/oauth/authorize?oauth_token=" + oauth_token
            })
            res.end()
          }
          else {
            res.end( JSON.stringify(error) )
          }
        }
      )
    },

    callback: function(req,res){
      var parsedUrl = url.parse(req.url, true);
      var cookies = new Cookies(req,res)
      var token = cookies.get('lifestream_register')

      oauthclients.twitter.getOAuthAccessToken(
        parsedUrl.query.oauth_token,
        oauthstate[token],
        parsedUrl.query.oauth_verifier,
        
        function(
          error, 
          oauth_token, 
          oauth_token_secret, 
          additionalParameters) 
        {
          if (!error) {
            oauthstate[token] = additionalParameters.screen_name

            res.writeHead( 301, {
              'Location':"http://"+config.server+"/lifestream/api/user/oauth/twitter/launch"
            })
            res.end()
          }
          else {
            res.end( JSON.stringify(error) )
          }
        }
      )
    },

    launch: function(req,res){
      res.writeHead(200)
      res.end( "<script>window.location='lifestream:///'</script>" )
    }
  }
}

oauthclients = {
  facebook:new oauth.OAuth2(
    config.facebook.keyid,
    config.facebook.secret,
    'https://graph.facebook.com'
  ),
  twitter:new oauth.OAuth(
    'http://twitter.com/oauth/request_token',
    'http://twitter.com/oauth/access_token',
    config.twitter.keyid,
    config.twitter.secret,
    '1.0',
    'http://'+config.server+'/lifestream/api/user/oauth/twitter/callback',
    'HMAC-SHA1',
    null,
    {'Accept': '*/*', 'Connection': 'close', 'User-Agent': 'twitter-js'}
)

}


function oauthaction(req,res) { 
  oauthactions[req.params.service][req.params.action](req,res)
}



function StreamBuffer(req) {
  var self = this

  var buffer = []
  var ended  = false
  var ondata = null
  var onend  = null

  self.ondata = function(f) {
    for(var i = 0; i < buffer.length; i++ ) {
      f(buffer[i])
    }
    ondata = f
  }

  self.onend = function(f) {
    onend = f
    if( ended ) {
      onend()
    }
  }

  req.on('data', function(chunk) {
    if( ondata ) {
      ondata(chunk)
    }
    else {
      buffer.push(chunk)
    }
  })

  req.on('end', function() {
    ended = true
    if( onend ) {
      onend()
    }
  })        
 
  req.streambuffer = self
}


function append(touser,fromuser,picid,coll,merr,cb) {
  coll.findOne(
    {username:touser},
    {fields:['stream']},

    merr(function(user){
      var stream = user.stream

      coll.update(
        {username:touser},
        {$push:{stream:{picid:picid,user:fromuser}}},
        merr(function(){
        
          if( config.max_stream_size < stream.length ) {
            coll.update(
              {username:touser},
              {$pull:{stream:stream[stream.length-1]}},
              merr(function(){
                cb()
              })
            )
          }
          else {
            cb()
          }
        })
      )
    })
  )
}


function finduser(mustfind,fields,req,res,found){
  var merr = mongoerr400(res)

  mongo.coll(
    'user',
    function(coll){
      var options = {}

      if( fields ) {
        options.fields = fields
      }

      coll.findOne(
        {username:req.params.username},
        
        merr(function(user){
          if( mustfind && !user ) {
            err400(res)
          }
          else {
            found(user,coll)
          }
        })
      )
    }
  )
}

function mongoerr400(res){
  return function(win){
    return mongo.res(
      win,
      function(dataerr) {
        err400(res)(dataerr)
      }
    )
  }
}

function err400(res,why) {
  return function(details) {
    util.debug('ERROR 400 '+why+' '+details)
    res.writeHead(400,''+why)
    res.end(''+details)
  }
}


function collect(streamurl) {
  var streamregexp = new RegExp(streamurl)

  return function(req,res,next) {
    if( 'POST' == req.method ) {
      if( streamregexp.exec(req.url) ) {
        new StreamBuffer(req)
        next()
      }
      else {
        common.readjson(
          req,
          function(input) {
            req.json = input
            next()
          },
          err400(res,'read-json')
        )
      }
    }
    else {
      next()
    }
  }
}


function auth() {
  return function(req,res,next) {
    var merr = mongoerr400(res)

    mongo.coll(
      'user',
      function(coll){
      
        coll.findOne(
          {token:req.headers['x-lifestream-token']},
          {fields:['username']},
          merr(function(user){          
            if( user ) {
              next()
            }
            else {
              res.writeHead(401)
              res.end(JSON.stringify({ok:false,err:'unauthorized'}))
            }
          })
        )
      }
    )
  }
}


var db     = null
var server = null

mongo.init(
  {
    name:     config.mongohq.name,
    host:     config.mongohq.host,
    port:     config.mongohq.port,
    username: config.mongohq.username,
    password: config.mongohq.password,
  }, 
  function(res){
    db = res
    var prefix = '/lifestream/api/user/'
    server = connect.createServer(
      connect.logger(),
      collect('/upload$'),

      connect.router(function(app){
        app.post( prefix+'register', register)
        ,app.get(  prefix+'oauth/:service/:action/:token', oauthaction)
        ,app.get(  prefix+'oauth/:service/:action', oauthaction)
        ,app.get(  prefix+'complete/:token', complete)

        ,app.get(  prefix+'search/:query', search)
      }),

      auth(),

      connect.router(function(app){
        app.get(  prefix+':username', loaduser)

        ,app.post( prefix+':username/follow', follow)
        ,app.post( prefix+':username/unfollow', unfollow)

        ,app.post( prefix+':username/upload', upload)
        ,app.post( prefix+':username/post', post)
        ,app.get(  prefix+':username/stream', stream)
      })
    )
    server.listen(3009)
  },
  function(err){
    util.debug(err)
  }
)


