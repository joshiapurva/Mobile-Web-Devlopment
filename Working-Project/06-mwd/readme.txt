
Mobile Web Development
Lab 06
30 Oct 2012
Richard Rodger
richard.rodger@nearform.com




Objectives
?	Install and use Memcached with Node.js
?	Install and use Redis with Node.js
?	Understand the behaviour of the Memcached driver under server failure conditions
?	Understand the use of versioned cache keys
?	Perform simple unit testing of Node.js modules


 
Table of Contents 
Objectives	1
Directions For Lab Work	2
Node.js and memcached	3
Multiple memcached servers	5
Node.js and Redis	9
Using Cache Key Versioning	11
Unit Testing with the Vows module	17 


Directions For Lab Work
The approach introduced in the previous lab will be used throughout the course:
?	Choose a top level folder to contain all your work
?	The work for each lab should be placed within a subfolder called labXX, where XX is the zero-padded lab number
?	Use the desktop Safari browser and the Safari Web Inspector as your primary development environment
?	Serve your apps from your local machine for testing using the nginx web server, as per the instructions in lab01. Use nginx even when testing from desktop Safari. This ensures that AJAX requests will function correctly as you will avoid cross-domain browser restrictions.
?	Proxy AJAX requests via nginx to a local Node.js server that you run from the command line. 

Ensure that you have completed all the tasks in lab01 before proceeding, as this and future labs will assume a correctly configured and working environment.
All labs assume a basic level of experience with the command line.
This lab assumes you have completed the tasks in all previous labs.



Node.js and memcached
The most commonly used in-memory cache is the memcached server It's very simple and easy to use - it is just a big key-value store. Visit http://memcached.org for full documentation. 
1. Download and install the latest version of memcached
On Linux:
$ apt-get install memcached
On Mac, using http://macports.org
$ sudo port install memcached
On Mac, http://mxcl.github.com/homebrew/
$ sudo brew install memcached
On Windows, download binaries from http://splinedancer.com/memcached-win32/

2. The memcached executable should now be available. To test, run the following command (your version may be different):
$ memcached -i
memcached 1.4.5
...
3. The memcached executable is not normally installed as a system service in the same way as a database like MongoDB. You may wish to run several instances of memcached on each of your servers, for example. The exact configuration will therefore depend on the details of your app. For development purposes, you can simply start memcached from the command line, specifying the port on which it is to listen for requests (using -p), and asking for verbose output to help with debugging (using -vv):
$ memcached -vv -p 11211
4. Install the memcached Node module. This module allows you to connect to memcached.
 $ npm install memcached
5. Create a file called memcache.js in the mwd-lab06 folder and insert the following code:

var Memcached = require( 'memcached' )

var memcached = new Memcached("127.0.0.1:11211")
var lifetime  = 3600


function end( msg ) {
  if( msg ) {
    console.log( msg ) 
  }
  memcached.end()
}


memcached.set( "foo", 'bar', lifetime, function( err, result ){
  if( err ) return end( err );

  memcached.get( "foo", function( err, result ){
    if( err ) return end( err );
    end( result );
  })
})


7. Run the script to verify that Node.js can connect to memcached.
$ node memcache.js
bar

You should see the following output from memcached:
<30 set foo 0 3600 3
>30 STORED
<30 get foo
>30 sending key foo
>30 END
<30 connection closed.


Multiple memcached servers
The Node.js memcached client can be configured to use multiple servers. It is also tolerant of server failure, and will reconnect if a server comes back online.
1. First set up three memcached servers on ports 11211, 11212 and 11213. Start each one in a separate console window. Arrange your console windows as shown below. This will allow you to observe the example code in action.
In separate terminals:
$ memcached -vv -p 11211
$ memcached -vv -p 11212
$ memcached -vv -p 11213


2. Create a file called memcache-multi.js in the mwd-lab06  folder and insert the following code:

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


The code in this script sets up an infinite loop that keeps adding new keys to the cache by counting upwards. You can’t just use a simple for loop to do this however, because you need to be able to handle the callbacks from memcached. Therefore, a recursive loop is used. Each time the setitem function is called, it sets a new key. It then waits 2 seconds, before calling itself again, incrementing the key count by 1.
Inside the setitem function, the getitem function loops over all the existing keys in the same way. This gets the script to print out the current values of all the keys every two seconds, and allows you to see the state of the cache.

7. Run the script (you’ll need to use Ctrl-C to exit, as the script runs forever). The  screenshot below shows the output of the script overlaid over the output of the memcached servers. While the script is running, kill one of the memcached servers, and restart it a few seconds later. In the screenshot, the memcached server on the far right was killed and restarted. This server was responsible for key value 2. You’ll notice in the output of the memcached-multi.js script in the foreground terminal window that the state of key value 2 goes to false for a while, indicating that it could not be found, before returning to true when the far right memcached comes back online.

Node.js and Redis
For persistent caching of data, you can use Redis. Redis provides the same key-value interface as memcached, and also provides an extended set of operations on structured values such as lists, sets and maps. Visit http://redis.io for full documentation. 
1. Download and install the latest version of Redis. Follow the instructions are http://redis.io/download

2. The redis-server executable should now be available. To test, run the following command (your version may be different, depending on where you installed redis):
$ bin/redis-server
[65783] 28 Feb 16:28:15 # Warning: no config file specified, using the default config. In order to specify a config file use 'redis-server /path/to/redis.conf'
[65783] 28 Feb 16:28:15 * Server started, Redis version 2.2.5
[65783] 28 Feb 16:28:15 * The server is now ready to accept connections on port 6379
...
As with memcached,the redis-server excutable is not installed as a system service and the exact configuration depends on the details of your app. For development purposes, you can simply start redis-server from the command line, as above

4. Install the redis Node module. This module allows you to connect to Redis.
 $ npm install redis
5. Create a file called redis.js in the mwd-lab06 folder and insert the following code:

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




7. Run the script to verify that Node.js can connect to Redis.
$ node memcache.js
bar

You should see the following output from Redis:
[65783] 28 Feb 16:28:20 - 0 clients connected (0 slaves), 922064 bytes in use
[65783] 28 Feb 16:28:22 - Accepted 127.0.0.1:52845
[65783] 28 Feb 16:28:22 - Client closed connection
[65783] 28 Feb 16:28:25 - DB 0: 1 keys (0 volatile) in 4 slots HT.
[65783] 28 Feb 16:28:25 - 0 clients connected (0 slaves), 922176 bytes in use


Using Cache Key Versioning
This example shows you how to use versioned keys to cache complex objects. The example implements a database for a Twitter-style service, where users can follow each other.
The followers of a user, and all those the user follows, form a complex object that  can be cached. You can’t just rebuild this object when a user changes who they follow. You also need to change it when someone who follows that user stops following the original user. 
1. You’ll only need one memcached server for this example:
$ memcached -vv -p 11211
2. Create a file called memcache-versioning.js in the mwd-lab06  folder and insert the following code:

var Memcached = require( 'memcached' )

var memcached = new Memcached("127.0.0.1:11211")
var lifetime  = 3600


function FollowDB() {
  var users = {}

  this.follow = function(user,follower) {
    users[user] = ( users[user] || {name:user} )
    users[user].followers = ( users[user].followers || [] ) 
    users[user].followers.push(follower)

    users[follower] = ( users[follower] || {name:follower} )
    users[follower].following = ( users[follower].following || [] ) 
    users[follower].following.push(user)
  }

  this.user = function(user){
    return users[user]
  }
}


function FollowAPI( followdb ) {

  function error(win) {
    return function( err, result ) {
      if( err ) {
        console.log(err)
      }
      else {
        win && win(result)
      }
    }
  }

  function incr(user,win){
    memcached.incr( user+'_v', 1, error(function(res){
      if( !res ) {
        memcached.set( user+'_v', 0, lifetime, error(function(){
          win()
        }))
      }
      else {
        win()
      }
    }))
  }

  this.follow = function(user,follower,win) {
    followdb.follow(user,follower)
    incr(user,function(){
      incr(follower,win)
    })
  }

  this.user = function(user,win) {
    memcached.get( user+'_v', error(function( user_v ){
      user_v = user_v || 0
      var user_f_key = user+'_'+user_v+'_f'

      memcached.get( user_f_key, error(function( user_f ){
        if( user_f ) {
          user_f.cache = 'hit'
          win(user_f)
        }
        else {
          user_f = followdb.user(user)
          memcached.set( user_f_key, user_f, lifetime, error(function(){
            user_f.cache = 'miss'
            win(user_f)
          }))
        }
      }))
    }))
  }
}


var followdb = new FollowDB()
var followapi = new FollowAPI(followdb)

function printuser(next){
  return function(user) {
    console.log(user.name+':'+JSON.stringify(user,null,2))
    next && next()
  }
}

followapi.follow('alice','bob',function(){

  followapi.user('alice',printuser(function(){
    followapi.user('alice',printuser(function(){
    
      followapi.follow('jim','alice',function(){

        followapi.user('alice',printuser())
      })
    }))
  }))
})

3. Run the script:
$ node memcache-versioning.js
alice:{
  "name": "alice",
  "followers": [
    "bob"
  ],
  "cache": "miss"
}
alice:{
  "name": "alice",
  "followers": [
    "bob"
  ],
  "cache": "hit"
}
alice:{
  "name": "alice",
  "followers": [
    "bob"
  ],
  "cache": "miss",
  "following": [
    "jim"
  ]
}
Explanation
This example simulates a data store that keeps track of the followers and followees of a given user. The FollowDB object is a stub that is used to provide a simple implementation. In a real application, this data will be stored in database such as MongoDB. The follow function takes two usernames as arguments, and sets up the data store so that the second user is a follower of the first. The user function returns a description of the user, including two lists. One list contains the user’s followers, and the other list of users that the user follows. This is the complex, expensive object that you need to cache.
The FollowAPI object implements the API to abstract these operations. It has the same functions as the data store, but includes support for caching. The error convenience function follows the standard dynamic function pattern.
To understand this example, start at the bottom. The API is used to set up some follow relationships with the alice user. The description of the alice user is also printed each time so that you can see the current state of the system.
After the first follow is set up, the code loads alice twice:
followapi.follow('alice','bob',function(){

  followapi.user('alice',printuser(function(){
    followapi.user('alice',printuser(function(){

As you can see in the output from the script, the first time alice is loaded from the database because she is not in the cache - a cache miss. The second time, she is in the cache - a cache hit:
alice:{
  "name": "alice",
  "followers": [
    "bob"
  ],
  "cache": "miss"
}
alice:{
  "name": "alice",
  "followers": [
    "bob"
  ],
  "cache": "hit"
}
Next, the test code sets up alice herself to be followed. Now the version of alice in the cache is out-of-date, and you should see a cache miss. And that’s what happens:
alice:{
  "name": "alice",
  "followers": [
    "bob"
  ],
  "cache": "miss",
  "following": [
    "jim"
  ]
}
So how does this work? The trick is to use two cache entries. Once entry stores the alice object. But the key for this object includes a version number. This version number is incremented each time alice changes in any way. That way, when alice does change, the old data will not be returned, because it does not have the current key.
The next question is: how do you get version number? You store it in the cache! It’s not important what the version number is, just that it changes whenever alice changes. You can use the memcached incr operation to increment a version counter.
The sequence then works as follows: when you are looking for alice, first get her version number, stored in the cache under alice_v, and then use the version number to construct the key for the complex alice object: alive_<version>_f.
The important thing is that you must increment alice’s version number whenever she changes in any way. There can be multiple dependent objects and this strategy will still work. If any of them change, then the version is bumped, and the cache is invalidated, ensuring that a new, correct, version of alice is built and returned. Let’s look at how this is implemented in the code.
The incr function is used to increment a user counter in the cache. In order to support any surrounding callback flow, the incr function also takes a win argument, which it calls as a function when it is finished. If the counter for a given user does not already exist, it needs to be created (shown in bold):
  function incr(user,win){
    memcached.incr( user+'_v', 1, error(function(res){
      if( !res ) {
        memcached.set( user+'_v', 0, lifetime, error(function(){
          win()
        }))
      }
      else {
        win()
      }
    }))
  }

To follow a user, you call the follow function, and this increments the counter for both the follower and the followee (show in bold), since both have now changed:
  this.follow = function(user,follower,win) {
    followdb.follow(user,follower)
    incr(user,function(){
      incr(follower,win)
    })
  }

To load a user, first get the version number for that user, and construct the key for the complex object describing the user (shown in bold):
  this.user = function(user,win) {
    memcached.get( user+'_v', error(function( user_v ){
      user_v = user_v || 0
      var user_f_key = user+'_'+user_v+'_f'

Then use that constructed key to find the user in the cache:
      memcached.get( user_f_key, error(function( user_f ){
        if( user_f ) {
          user_f.cache = 'hit'
          win(user_f)
        }

However, if the user is not in the cache, you will need to load them from the database, and put them back in the cache, with their new version number:
        else {
          user_f = followdb.user(user)
          memcached.set( user_f_key, user_f, lifetime, error(function(){
            user_f.cache = 'miss'
            win(user_f)
          }))
        }
Unit Testing with the Vows module
The http://vowsjs.org module provides a unit testing framework for Node. In this example, the FollowDB object is broken out into it's own module, and two unit tests are defined against it.
1. Create a file called follow-db.js in your lab folder. Insert the following code:

function FollowDB() {
  var users = {}

  this.follow = function(user,follower) {
    users[user] = ( users[user] || {name:user} )
    users[user].followers = ( users[user].followers || [] ) 
    users[user].followers.push(follower)

    users[follower] = ( users[follower] || {name:follower} )
    users[follower].following = ( users[follower].following || [] ) 
    users[follower].following.push(user)
  }

  this.user = function(user){
    return users[user]
  }
}

module.exports = FollowDB


2. Install the Vows module:
npm install vows

3. Create a file called follow-db-test.js in your lab folder. Insert the following code:
var FollowDB = require('./follow-db')

var vows   = require('vows')
var assert = require('assert')


vows.describe('FollowDB').addBatch({

  'basic operations': {
    topic: function () { 
      return new FollowDB() 
    },
    
    'insert': function ( followdb ) {
      followdb.follow('alice','bob')
      assert.deepEqual( followdb.user('alice' ), {name:'alice',followers:['bob']})
      assert.deepEqual( followdb.user('bob' ), {name:'bob',following:['alice']})
    },

    'follow-back': function ( followdb ) {
      followdb.follow('bob','alice')
      assert.deepEqual( followdb.user('alice' ), {name:'alice',followers:['bob'],following:['bob']})
      assert.deepEqual( followdb.user('bob' ), {name:'bob',following:['alice'],followers:['alice']})
    }
  },


}).run()


The topic function is used to create the object that you want to test. This is passed as the first argument to subsequent functions.

4. Run the unit tests:
node follow-db-test.js

You should see the output:
•• ? OK » 2 honored (0.002s) 

5. Deliberately break the tests. Change alice to cathy
followdb.follow('cathy','bob')
followdb.follow('bob','cathy')
Run again, and you should see:
??  
   
    basic operations 
      ? insert 
        » expected { 
      name: 'alice', 
      followers: [ 'bob' ] 
  }, 
  	got	 undefined (deepEqual) // follow-db-test.js:17 
   
      ? follow-back 
        » expected { 
      name: 'alice', 
      followers: [ 'bob' ], 
      following: [ 'bob' ] 
  }, 
  	got	 undefined (deepEqual) // follow-db-test.js:23 
  ? Broken » 2 broken (0.004s) 


Read the http://vowjs.org site for full documentation



 
