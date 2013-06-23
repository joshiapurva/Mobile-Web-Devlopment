var connect = require('connect')
var oauth   = require('oauth')
var url     = require('url')

var keys = require('./keys.js')

var oauthclient = new oauth.OAuth2(
  keys.facebook.keyid,
  keys.facebook.secret,
  'https://graph.facebook.com'
)


var server = connect.createServer(
  connect.router(function(app){

    app.get('/oauth/facebook/login',function(req,res,next){
      var redirectUrl = 
        oauthclient.getAuthorizeUrl(
          {redirect_uri:'http://YOUR_IP_ADDRESS:3003/oauth/facebook/callback', scope:'' })

      res.writeHead( 301, {
        'Location':redirectUrl
      })
      res.end()
    })

    app.get('/oauth/facebook/callback',function(req,res,next){
      var parsedUrl = url.parse(req.url, true);

      oauthclient.getOAuthAccessToken(
        parsedUrl.query.code , 
        {redirect_uri:'http://YOUR_IP_ADDRESS:3003/oauth/facebook/callback'}, 
        function( error, access_token, refresh_token ){

          if (!error) {
            res.writeHead( 301, {
              'Location':"http://YOUR_IP_ADDRESS:3003/oauth/facebook/launch"
            })
            res.end()
          }
          else {
            res.end( JSON.stringify(error) )
          }
        }
      )
    })

    app.get('/oauth/facebook/launch',function(req,res,next){
      res.writeHead(200)
      res.end( 'Signed in with Facebook!' )
    })
  }),
  connect.static('../public')
)
server.listen(3003)
