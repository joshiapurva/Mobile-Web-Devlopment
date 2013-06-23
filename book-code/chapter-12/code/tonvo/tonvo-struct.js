

// Configuration

var conf = {
  network: {
    twitter: {
      key:'YOUR_TWITTER_KEY',
      secret:'YOUR_TWITTER_SECRET',
      authorizeurl:'https://api.twitter.com/oauth/authorize',
      requesturl:'http://api.twitter.com/oauth/request_token',
      accessurl:'http://api.twitter.com/oauth/access_token',
      apibaseurl:'http://api.twitter.com/1/'
    }
  }
}

var text = {
  netfail: 'Network request failed. Please try again.',
  netfailtitle: 'Network Error',
  close: 'Close',
  authfail: 'Sign in request failed. Please try again.',
  authfailtitle: 'Sign In Error'
}



// Initialization

var app = null

document.addEventListener("deviceready", init)

function init() {
  app = new App()
}

$(function(){

  // call init() manually if not on a device
  if( !/iPad|iPhone|Android/.test(navigator.userAgent) ) {
    init()
  }
})



// Utility

var util = {}

// inject text into sub elements using CSS classnames
util.text = function(elem,textmap) {
  if( elem ) {
    for( var classname in textmap ) {
      elem.find('.'+classname).text(textmap[classname])
    } 
  }
}

// log debugging messages to the console
util.log = function() {
  console && console.log( Array.prototype.slice.call(arguments) )
}


// localStorage helper functions
util.cache = {}
util.load = function(key) {
  return util.cache[key] || JSON.parse(localStorage[key] || '{}')
}
util.save = function(key,obj) {
  util.cache[key] = obj
  localStorage[key] = JSON.stringify(obj)
}


// URL querystring parameter parsing
util.params = function(qs) {
  var params = {}
  var kvpairs = qs.slice(qs.indexOf('?') + 1).split('&')

  for(var i = 0; i < kvpairs.length; i++) {
    var kv = kvpairs[i].split('=')
    params[kv[0]] = kv[1]
  }

  return params;
}


// browser or device alert
util.alert = function(text,title,button) {
  if( navigator.device ) {
    navigator.notification.alert(text,function(){},title,button)
  }
  else {
    alert( text )
  }
}


// On HTTP error, display a notification to the user
util.http_error = function( cb ) {
  return function(jqXHR, textStatus, errorThrown){
    var err = {
      status:jqXHR.status, 
      jqXHR:jqXHR, 
      textStatus:textStatus, 
      errorThrown:errorThrown
    }
    util.log(err)

    util.alert(text.netfail,text.netfailtitle,text.close)

    cb && cb(err,null)
  }
}

// lookup key for user account data
util.key = function(type,account) {
  return type+'_'+account.network+'_'+account.nick
}



// Social Media Networks

function Network() {

  // make an HTTP call to the network API
  this.call = function( account, spec, cb ) {}

  // hand over to social network for account log in
  this.handleauthorize = function(data,account) {}

  // complete OAuth, handle social network callback
  this.complete = function( account, cb ) {}
}


// handle specifics of Twitter API
// subclass of Network
function Twitter() {
  var self = this

  // get the user's details
  self.userdetails = function( account, cb ) {}

  // send a direct message
  self.sendmsg = function( account, recipient, text, cb ) {}

  // get user's followers
  self.getpeople = function( account, cb ) {}

  // get user's messages, direcction: 'inbound' or 'outbound'
  self.getmsgs = function(direction,account,cb) {}

  // create a handler function for user sign in
  self.makesignin = function() {}
}
Twitter.prototype = new Network()


// Provide interface to social media networks
function Social() {
  var self = this

  // send a message via a specific social medai account
  self.sendmsg = function( account, recipient, text, cb ) {}
  
  // get all people you can message over all accounts
  self.getpeople = function() {}

  // get all direct msgs overs all accounts
  self.getmsgs = function() {}

  // create a sign in handler function
  self.makesignin = function(name) {}

  // complete the OAuth process
  self.complete = function(url) {}

  // register an account in the app
  self.register = function(account) {}

}


// Manage the Inbox view
function Inbox(social) {
  var self = this

  // handle refresh action
  self.refresh = function(e) {}

  // display current msgs
  self.render = function() {}

  // check for new msgs
  self.update = function() {}

  // insert a list of msgs into the view
  self.insertmsgs = function( msgs ) {}

  // render an individual msg
  self.rendermsg = function( msg, after ) {}
}


// Manage the conversation view
function Convo(social) {
  var self = this

  // display a conversation
  self.render = function() {}
  
  // display an individual message
  self.displaymsg = function( msg ) {}

  // check for new msgs
  self.update = function(cb) {}
}


// Manage the list of people you can msg
function People(social) {
  var self = this

  // display indexed list of people by first character of nick
  self.render = function(){}

  // display list of people with same first character of nick
  self.openchar = function( key, account, char ) {}

  // check for new people
  self.update = function(cb) {}
}


// Manage your list of social media accounts
function Accounts(social) {
  var self = this

  // display social media accounts
  self.render = function() {}
}


// Manage the top bar navigation buttons
function TopNav(firstcon,app) {
  var self = this

  self.app = app

  self.el = {
    nav: {},
    con: {}
  }

  self.show = {}

  // create a function to display a content view
  function makeshowcon(name) {
    return function() {
      if( self.con ) {
        self.con.addClass('hide')
        self.app[self.name].visible = false
      }

      self.name = name
      self.con = self.el.con[name]
      self.app[name].render()

      self.con.removeClass('hide')
      self.app[name].visible = true
    }
  }

  // set up content views
  for( var cn in {inbox:1,people:1,accounts:1,convo:1} ) {
    self.el.nav[cn] = $('#nav_'+cn)
    self.el.con[cn] = $('#con_'+cn)
    
    self.show[cn] = makeshowcon(cn)
    self.el.nav[cn].tap( self.show[cn] )
  }

  self.con = self.el.con[ firstcon ]
  self.name = firstcon
}


// The main application object
function App() {
  var self = this

  util.log('app init')

  
  // set up the social and view objects

  var social = self.social = new Social()

  self.inbox = new Inbox(social)
  self.convo = new Convo(social)
  self.people = new People(social)
  self.accounts = new Accounts(social)

  self.topnav = new TopNav('inbox',self)

  self.topnav.show.accounts()
}


