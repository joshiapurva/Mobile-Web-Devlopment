
var common  = require('./common.js')
var config  = common.config

var util    = common.util  
var request = common.request  

var assert  = require('assert')
var eyes    = require('eyes')


var urlprefix = 'http://'+config.server+':3009/lifestream/api'
var headers   = {}


function handle(cb) {
  return function (error, response, body) {
    if( error ) {
      util.debug(error)
    }
    else {
      var code = response.statusCode
      var json = JSON.parse(body)
      util.debug('  '+code+': '+JSON.stringify(json))

      assert.equal(null,error)
      assert.equal(200,code)

      cb(json)
    }
  }
}

function get(username,uri,cb){
  util.debug('GET '+uri)
  request.get(
    {
      uri:uri,
      headers:headers[username] || {}
    }, 
    handle(cb)
  )
}

function post(username, uri,json,cb){
  util.debug('POST '+uri+': '+JSON.stringify(json))
  request.post(
    {
      uri:uri,
      json:json,
      headers:headers[username] || {}
    }, 
    handle(cb)
  )
}


module.exports = {

  api:function() {
    var foo = (''+Math.random()).substring(10)
    var bar = (''+Math.random()).substring(10)


    // create and load

    ;post(
      null,
      urlprefix+'/user/register',
      {username:foo},
      function(json){
        assert.ok(json.ok)
        headers[foo] = {
          'x-lifestream-token':json.token
        }

    ;get(
      foo, 
      urlprefix+'/user/'+foo,
      function(json){
        assert.equal(foo,json.username)
        assert.equal(0,json.followers.length)
        assert.equal(0,json.following.length)


    ;post(
      null,
      urlprefix+'/user/register',
      {username:bar},
      function(json){
        assert.ok(json.ok)
        headers[bar] = {
          'x-lifestream-token':json.token
        }

    ;get(
      bar, 
      urlprefix+'/user/'+bar,
      function(json){
        assert.equal(bar,json.username)
        assert.equal(0,json.followers.length)
        assert.equal(0,json.following.length)


    // search
    ;get(
      null,
      urlprefix+'/user/search/'+foo.substring(0,4),
      function(json){
        assert.ok(json.ok)
        assert.equal(1,json.list.length)
        assert.equal(json.list[0],foo)


    ;})  // search
    ;})  // get 
    ;})  // post
    ;})  // get
    ;})  // post

  }
}