
var Memcached = require( 'memcached' )

var memcached = 
  new Memcached( 
    ["127.0.0.1:11211","127.0.0.1:11212","127.0.0.1:11213"],
    {reconnect:2000,timeout:2000,retries:2,retry:2000}
  )

var lifetime = 3600
var itemcount = 0


function setcount(count,win) {
  memcached.set( 
    'name'+count, 
    'value'+count, 
    lifetime, 
    function(err) {
      if( err ) { 
        console.error( err )
      }
      else {
        win()
      }
    }
  )
}

function getcount(count,win) {
  memcached.get( 
    'name'+count, 
    function(err,result) {
      if( err ) { 
        console.error( err )
      }
      else {
        win(result)
      }
    }
  )
}


function setitem(count) {
  setcount(count,function(){
    console.log('set '+count)
    itemcount++
    
    function getitem(count) {

      if( count < itemcount ) {
        getcount(count,function(result){
          console.log('get '+count+'='+result)

          if( !result ) {
            setcount(count,function(){
              getitem(count+1)
            })
          }
          else {
            getitem(count+1)
          }
        })
      }
    }
    getitem(0)
  })

  setTimeout(function(){
    setitem(count+1)
  },2000)
}
setitem(0)


