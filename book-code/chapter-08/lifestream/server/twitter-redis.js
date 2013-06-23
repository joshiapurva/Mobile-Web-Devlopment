
var connect = require('connect')
var oauth   = require('oauth')
var url     = require('url')
var redis   = require("redis-node");


var redisclient = redis.createClient();

var keys = require('./keys.js')

var oauthclient = new oauth.OAuth(
  'http://twitter.com/oauth/request_token',
  'http://twitter.com/oauth/access_token',
  keys.twitter.keyid,
  keys.twitter.secret,
  '1.0',
  'http://YOUR_IP_ADDRESS:3003/oauth/twitter/callback',
  'HMAC-SHA1',
  null,
  {'Accept': '*/*', 'Connection': 'close', 'User-Agent': 'twitter-js'}
)


var server = connect.createServer(
  connect.router(function(app){

    app.get('/oauth/twitter/login',function(req,res,next){

      oauthclient.getOAuthRequestToken(
        function(
          error, 
          oauth_token, 
          oauth_token_secret, 
          oauth_authorize_url, 
          additionalParameters) 
        {
          if (!error) {
            redisclient.set(
              oauth_token,
              oauth_token_secret,
              function(err,result){

                res.writeHead( 301, {
                  "Location":
                  "http://api.twitter.com/oauth/authorize?oauth_token=" + oauth_token
                })
                res.end()
              }
            )
          }
          else {
            res.end( JSON.stringify(error) )
          }
        }
      )
    })

    app.get('/oauth/twitter/callback',function(req,res,next){
      var parsedUrl = url.parse(req.url, true);
      var oauth_token = parsedUrl.query.oauth_token;

      redisclient.get( oauth_token, function(err,oauth_token_secret){
        oauthclient.getOAuthAccessToken(
          oauth_token,
          oauth_token_secret,
          parsedUrl.query.oauth_verifier,

          function(
            error, 
            oauth_token, 
            oauth_token_secret, 
            additionalParameters) 
          {
            if (!error) {
              res.writeHead( 301, {
                'Location':"http://YOUR_IP_ADDRESS:3003/oauth/twitter/launch"
              })
              res.end()
            }
            else {
              res.end( JSON.stringify(error) )
            }
          }
        )
      })
    })

    app.get('/oauth/twitter/launch',function(req,res,next){
      res.writeHead(200)
      res.end( 'Signed in with Twitter!' )
    })
  }),
  connect.static('../public')
)
server.listen(3003)
