
// To Run:
// npm install connect
// node quotations.js
// nginx must proxy to 127.0.0.1:8180

var connect = require('connect')

var whomap = {
  feynman: [
    "On the infrequent occasions when I have been called upon in a formal place to play the bongo drums, the introducer never seems to find it necessary to mention that I also do theoretical physics.",
    "For a successful technology, reality must take precedence over public relations, for nature cannot be fooled.",
    "If I could explain it to the average person, it wouldn't have been worth the Nobel Prize."
  ],
  einstein: [
    "As far as the laws of mathematics refer to reality, they are not certain; and as far as they are certain, they do not refer to reality.",
    "Do not worry about your difficulties in Mathematics. I can assure you mine are still greater.",
    "The most incomprehensible thing about the world is that it is at all comprehensible."
  ]
}

var index = 0

var api = {}
api.quote = function( req, res ) {
  var who = req.params.who
  who = whomap[who] ? who : 'feynman'

  var output = {text:whomap[who][index]}
  index = (index + 1) % 3 

  res.writeHead(200,{
    'Content-Type': 'application/json'
  })
  res.end( JSON.stringify( output ) )
}

var server = connect.createServer()
server.use( connect.logger() )

server.use( connect.router( function( app ) {
  app.get('/api/quote/:who?', api.quote)
}))

server.listen(8180)
