
var common = require('./common.js')
var config = common.config  

var util   = common.util  

var assert  = require('assert')
var eyes    = require('eyes')
var request = require('request')

var urlprefix = 'http://'+config.server+'/lifestream/api'

var headers = {}


function handle(cb) {
  return function (error, response, body) {
    assert.equal(null,error)
    assert.equal(200,response.statusCode)
    var json = JSON.parse(body)
    cb(json)
  }
}

function get(username,cb){
  request.get(
    {
      uri:urlprefix+'/user/'+username,
      headers:headers[username]
    }, 
    handle(cb)
  )
}


module.exports = {

  api:function() {
    var foo = (''+Math.random()).substring(10)
    var bar = (''+Math.random()).substring(10)


    // create and load
    ;request.post(
      {
        uri:urlprefix+'/user/register',
        json:{username:foo},
      }, 
      handle(function(json){
        assert.ok(json.ok)
        headers[foo] = {
          'x-lifestream-token':json.token
        }

    ;get(foo, function(json){
        assert.equal(foo,json.username)
        assert.equal(0,json.followers.length)
        assert.equal(0,json.following.length)


    ;request.post(
      {
        uri:urlprefix+'/user/register',
        json:{username:bar},
      }, 
      handle(function(json){
        assert.ok(json.ok)
        headers[bar] = {
          'x-lifestream-token':json.token
        }

    ;get(bar, function(json){
        assert.equal(bar,json.username)
        assert.equal(0,json.followers.length)
        assert.equal(0,json.following.length)


    // search
    ;request.get(
      {
        uri:urlprefix+'/user/search/'+foo.substring(0,4),
      }, 
      handle(function(json){
        assert.ok(json.ok)
        assert.equal(1,json.list.length)
        assert.equal(json.list[0],foo)


    // follow
    ;request.post(
      {
        uri:urlprefix+'/user/'+foo+'/follow',
        json:{username:bar},
        headers:headers[foo]
      }, 
      handle(function(json){
        assert.ok(json.ok)


    ;get(foo,function(json){
        assert.equal(0,json.followers.length)
        assert.equal(1,json.following.length)
        assert.equal(bar,json.following[0])

    ;get(bar,function(json){
        assert.equal(1,json.followers.length)
        assert.equal(0,json.following.length)
        assert.equal(foo,json.followers[0])



    // post and stream
    ;request.post(
      {
        uri:urlprefix+'/user/'+bar+'/post',
        json:{picid:'pic1'},
        headers:headers[bar]
      }, 
      handle(function(json){
        assert.ok(json.ok)

    ;request.get(
      {
        uri:urlprefix+'/user/'+bar+'/stream',
        headers:headers[bar]
      }, 
      handle(function(json){
        assert.ok(json.ok)
        assert.equal(1,json.stream.length)
        assert.equal('pic1',json.stream[0].picid)
        assert.equal(bar,json.stream[0].user)

    ;request.get(
      {
        uri:urlprefix+'/user/'+foo+'/stream',
        headers:headers[foo]
      }, 
      handle(function(json){
        assert.ok(json.ok)
        assert.equal(1,json.stream.length)
        assert.equal('pic1',json.stream[0].picid)
        assert.equal(bar,json.stream[0].user)

   
        // unfollow
     ;request.post(
      {
        uri:urlprefix+'/user/'+foo+'/unfollow',
        json:{username:bar},
        headers:headers[foo]
      }, 
      handle(function(json){
        assert.ok(json.ok)


    ;get(foo,function(json){
        assert.equal(0,json.followers.length)
        assert.equal(0,json.following.length)

    ;get(bar,function(json){
        assert.equal(0,json.followers.length)
        assert.equal(0,json.following.length)
 
    ;}) }) })) })) })) })) }) }) })) })) }) })) }) }))
  }
}