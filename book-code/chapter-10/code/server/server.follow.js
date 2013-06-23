
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


// utility functions

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


function collect() {
  return function(req,res,next) {
    if( 'POST' == req.method ) {
      common.readjson(
        req,
        function(input) {
          req.json = input
          next()
        },
        err400(res,'read-json')
      )
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
      collect(),

      connect.router(function(app){
        app.post( prefix+'register', register)
        ,app.get(  prefix+'search/:query', search)
      }),

      auth(),

      connect.router(function(app){
        app.get(  prefix+':username', loaduser)

        ,app.post( prefix+':username/follow', follow)
        ,app.post( prefix+':username/unfollow', unfollow)
      })
    )
    server.listen(3009)
  },
  function(err){
    util.debug(err)
  }
)


