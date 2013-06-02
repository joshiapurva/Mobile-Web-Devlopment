
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
