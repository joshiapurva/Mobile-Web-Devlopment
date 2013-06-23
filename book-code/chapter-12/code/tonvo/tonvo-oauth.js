

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

// handle callbacks from social media sites
// this is a special function called by PhoneGap
// when the app URL scheme (tonvo://) is activated
function handleOpenURL(url) {
  util.log('handleOpenURL',url)
  app.social.complete(url)
}



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

util.log = function() {
  console && console.log( Array.prototype.slice.call(arguments) )
}


// localStorage helper functions
util.cache = {}
util.load = function(key) {
  return util.cache[key] || JSON.parse(localStorage[key] || '{}')
}
util.save = function save(key,obj) {
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

// super class; note use of this instead of self
// subclasses must provide:
//   members: reqtokens
//   methods: userdetails, sendmsg, getmsgs, getpeople, makesignin
function Network() {

  // make an HTTP call to the network API
  // parameters:
  //   account: account description object
  //   spec:    specification for the call
  //   cb:      callback, Node style arguments: cb(err,data)     
  this.call = function( account, spec, cb ) {

    var accessor = { 
      oauth_signature_method: 'HMAC-SHA1',
      consumerSecret: conf.network.twitter.secret,
    }

    if( account.secret ) accessor.tokenSecret = account.secret;

    util.log('oauth-call','accessor',accessor)

    var message = { 
      action: spec.path,
      method: spec.method || 'GET',
      parameters: {
        oauth_consumer_key    : conf.network.twitter.key,
        oauth_version         : '1.0',
        oauth_callback        : 'tonvo:///',
      }
    }
    if( account.key ) message.parameters.oauth_token = account.key;
    if( account.verifier ) message.parameters.oauth_verifier = account.verifier;
    util.log('oauth-call','message',message)

    if( spec.data ) {
      for( var p in spec.data ) {
        if( spec.data.hasOwnProperty(p) ) {
          message.parameters[p]=spec.data[p]
        }
      }
    }

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var parameterMap = OAuth.getParameterMap(message.parameters);        

    var ajaxopts = {
      url:message.action,
      type: spec.method || 'GET',
      headers:{'Authorization': OAuth.getAuthorizationHeader('',parameterMap)},
      success:function(data){
        util.log('call',data)
        cb(null,data)
      },
      error:util.http_error(cb)
    }
    ajaxopts.dataType = spec.jsondata ? 'json' : undefined

    if( spec.data ) {
      ajaxopts.data = spec.data
    }

    util.log(ajaxopts)
    $.ajax(ajaxopts)
  }


  // hand over to social network for account log in
  this.handleauthorize = function(data,account) {
    var networkconf = conf.network[account.network]

    var params = util.params(data)

    // store the token, to be accessed after callback
    this.reqtokens[params.oauth_token] = {
      network:account.network,
      key:params.oauth_token,
      secret:params.oauth_token_secret,
    }

    var href=networkconf.authorizeurl+'?oauth_token='+params.oauth_token
    util.log('href',href)

    if( navigator.device ) {
      window.location.href = href
    }
    // else on browser, manually copy and paste href into new window
  }


  // complete OAuth, handle social network callback
  this.complete = function( account, cb ) {
    var networkconf = conf.network[account.network]

    this.call( account, { path: networkconf.accessurl }, function( err, data ) {
      if( err ) {
        util.log(err)
        util.alert(text.authfail,text.authfailtitle,text.close)
        return
      }

      var params = util.params(data)
      account.key = params.oauth_token
      account.secret = params.oauth_token_secret

      util.log('Network.complete','account',account)
      cb( null, account )
    })
  }
}


// handle specifics of Twitter API
// subclass of Network
function Twitter(reqtokens) {
  var self = this

  self.reqtokens = reqtokens
  self.conf = conf.network.twitter


  // create a handler function for user sign in
  self.makesignin = function() {
    return function() {
      var account = {
        network:'twitter'
      }
      
      self.call(
        account,
        { path:self.conf.requesturl },
        function(err,data) {
          if( err ) return util.log(err);
          self.handleauthorize(data,account)
        }
      )
    }
  }
}
Twitter.prototype = new Network()




// Provide interface to social media networks
function Social() {
  var self = this

  // need to store these centrally to lookup oauth_verifier when completing callback
  self.reqtokens = {}

  self.network = {
    twitter: new Twitter(self.reqtokens)
  }


  // create a sign in handler function
  self.makesignin = function(name) {
    var network = self.network[name]
    util.log('makesignin',network,name,self.network)
    var signin = network.makesignin(name)
    util.log(signin)
    return signin
  }


  // complete the OAuth process
  self.complete = function(url) {
    var params = util.params(url)
    util.log('complete params', params, self.reqtokens)
    var account = self.reqtokens[params.oauth_token]
    account.oauth_verifier = params.oauth_verifier
    util.log('complete account', account)

    var network = self.network[account.network]

    if( account ) {
      network.complete(account, function(err,account){
        if( err ) return util.log(err);

        $('#debug').text( JSON.stringify(account) )
      })
    }
  }
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

  self.dirty = true

  self.el = {
    signin: {},
  }


  // bind signin functions to signin buttons
  for( var n in conf.network ) {
    var signin = self.el.signin[n] = $('#accounts_signin_'+n)
    util.log('signin',n)
    signin.tap(social.makesignin(n))
  }


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


