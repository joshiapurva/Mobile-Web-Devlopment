
var connect = require('connect')
var oauth   = require('oauth')
var url     = require('url')

var keys = require('./keys.js')


var oauthclient = new oauth.OAuth(
  'https://api.linkedin.com/uas/oauth/requestToken',
  'https://api.linkedin.com/uas/oauth/accessToken',
  keys.linkedin.keyid,
  keys.linkedin.secret,
  '1.0',
  'http://YOUR_IP_ADDRESS:3003/oauth/linkedin/callback',
  'HMAC-SHA1',
  null,
  {'Accept': '*/*', 'Connection': 'close', 'User-Agent': 'linkedin-js'}
)

var state = {}

var server = connect.createServer(
  connect.router(function(app){

    app.get('/oauth/linkedin/login',function(req,res,next){

      oauthclient.getOAuthRequestToken(
        function(
          error, 
          oauth_token, 
          oauth_token_secret, 
          oauth_authorize_url, 
          additionalParameters) 
        {
          if (!error) {
            state[oauth_token] = oauth_token_secret;

            res.writeHead( 301, {
              "Location":
              "https://www.linkedin.com/uas/oauth/authenticate?oauth_token=" + oauth_token
            })
            res.end()
          }
          else {
            res.end( JSON.stringify(error) )
          }
        }
      )
    })

    app.get('/oauth/linkedin/callback',function(req,res,next){
      var parsedUrl = url.parse(req.url, true);

      oauthclient.getOAuthAccessToken(
        parsedUrl.query.oauth_token,
        state[parsedUrl.query.oauth_token],
        parsedUrl.query.oauth_verifier,

        function(
          error, 
          oauth_token, 
          oauth_token_secret, 
          additionalParameters) 
        {
          if (!error) {
            res.writeHead( 301, {
              'Location':"http://YOUR_IP_ADDRESS:3003/oauth/linkedin/launch"
            })
            res.end()
          }
          else {
            res.end( JSON.stringify(error) )
          }
        }
      )
    })

    app.get('/oauth/linkedin/launch',function(req,res,next){
      res.writeHead(200)
      res.end( 'Signed in with Linkedin!' )
    })
  }),
  connect.static('../public')
)
server.listen(3003)
