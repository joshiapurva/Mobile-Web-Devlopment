
var redis = require( 'redis' )

var client = redis.createClient()


client.on("error", function (err) {
    console.log("Error " + err);
});


function end( msg ) {
  if( msg ) {
    console.log( msg ) 
  }
  client.end()
}


client.set( "foo", 'bar', function( err, result ){
  if( err ) return end( err );

  client.get( "foo", function( err, result ){
    if( err ) return end( err );
    end( result );
  })
})

