
var Memcached = require( 'memcached' )

var memcached = new Memcached("127.0.0.1:11211")
var expires  = 3600

memcached.set( "foo", 'bar', expires, function( err, result ){
  if( err ) console.error( err );
  console.dir( result );

  memcached.get( "foo", function( err, result ){
    if( err ) console.error( err );
    console.dir( result );
  })
})

