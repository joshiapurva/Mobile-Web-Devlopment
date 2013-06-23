

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


  // get the user's details
  self.userdetails = function( account, cb ) {
    self.call(account,{
      path:self.conf.apibaseurl+'account/verify_credentials.json',
      jsondata:true
    },function(err,data){
      if( err ) return cb(err,null);
      cb(null,{
        nick:data.screen_name,
        id:'t-'+data.id,
        avatar:data.profile_image_url
      })
    })
  }


  // send a direct message
  self.sendmsg = function( account, recipient, text, cb ) {
    self.call(account,{
      path:self.conf.apibaseurl+'direct_messages/new.json',
      method:'POST',
      data:{screen_name:recipient,text:text},
      jsondata:true
    },function(err,data){
      if( err ) return cb(err,null);

      var d = self.twitterdate( data.created_at )

      var msg = {
        k:'twitter',
        n:account.nick,
        s:data.text,
        w:d.getTime(),
        i:data.id_str,
        t:data.recipient_screen_name
      }

      cb(null,msg)
    })
  }


  // get user's followers
  self.getpeople = function( account, cb ) {
    var people = []

    // deal with twitter cursor
    function query( cursor ) {

      if( "0" != cursor ) {
        self.call(account,{
          path:self.conf.apibaseurl+'statuses/followers.json?cursor='+cursor,
          jsondata:true
        },function(err,data){
          if( err ) return cb(err);

          for( var i = 0; i < data.users.length; i++ ) {
            var entry = data.users[i]
            var person = {
              nick:entry.screen_name,
              avimg:entry.profile_image_url,
              name:entry.name
            }
            people.push(person)
          }

          query(data.next_cursor_str)
        })
      }
      else {
        cb(null,people)
      }
    }
    query(-1)
  }


  // get user's messages, direcction: 'inbound' or 'outbound'
  self.getmsgs = function(direction,account,cb) {

    var subpath = 'inbound'==direction?'':'/sent'

    self.call(account,{
      path:self.conf.apibaseurl+'direct_messages'+subpath+'.json?count='+100,
      jsondata:true
    },function(err,data){
      if( err ) return cb(err);

      var msgs = []
      for( var i = 0; i < data.length; i++ ) {
        var dm = data[i]
        
        var d = self.twitterdate( dm.created_at )

        var msg = {
          k:'twitter',
          n:account.nick,
          s:dm.text,
          w:d.getTime(),
          i:dm.id_str
        }

        var sender = dm.sender_screen_name
        var recipient = dm.recipient_screen_name

        if( account.nick == sender ) {
          msg.t = recipient
        }
        else {
          msg.f = sender
          msg.m = dm.sender.name
        }

        msgs.push(msg)
      }

      cb(null,msgs)
    })    
  }


  // twitter returns date strings in a wierd format, so they need special parsing
  self.twitterdate = function( tw_date_str ) {
    var ds = tw_date_str.replace(' +0000','')+' GMT'
    return Date.parseExact(ds,"ddd MMM dd HH:mm:ss yyyy zzz")
  }


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


  // inbound msgs, for inbox
  self.inbound = util.load('inbound').inbound || []

  // conversations
  self.convo = util.load('convo') || {}

  // user's social media accounts
  self.accounts = util.load('accounts').accounts || []


  // people lists and lookup map (by nick)
  self.people = {}
  self.peoplemap = {}


  function indexpeople(account,people) {
    var network = account.network
    var nick    = account.nick

    self.peoplemap[network] = self.peoplemap[network] || {}
    for(var i = 0; i < people.length; i++ ) {
      var person = people[i]
      self.peoplemap[network][person.nick] = person
    }
  }

  for( var i = 0; i < self.accounts.length; i++ ) {
    var acc = self.accounts[i]
    var key = util.key('people',acc)
    var people = self.people[key] = (util.load(key).people || [])  
    indexpeople(acc,people)
  }


  // message storage

  function inboundmsgs( msgs ) {
    var nI = 0
    var n  = msgs[nI]

    for( var mI = 0; mI < self.inbound.length; mI++ ) {
      var m = self.inbound[mI]
      
      if( n ) {
        if( n && n.w >= m.w ) {
          if( n.i == m.i ) {
            self.inbound[mI] = n
          }
          else {
            self.inbound.splice(mI++,0,n)
          }

          var key = n.k+'~'+n.n+'~'+n.f
          insertconvomsg( key, n )

          n = msgs[++nI]
        }
      }
    }

    if( nI < msgs.length ) {
      for( ; nI < msgs.length; nI++ ) {
        self.inbound.push( msgs[nI] )
      }
    }

    util.save('inbound',{inbound:self.inbound})
    util.save('convo',self.convo)
  }


  function outboundmsgs ( msgs ) {
    for( var i = 0; i < msgs.length; i++ ) {
      var msg = msgs[i]
      var key = msg.k+'~'+msg.n+'~'+msg.t
      insertconvomsg( key, msg )
    }

    util.save('convo',self.convo)
  }


  function insertconvomsg( key, msg ) {
    var msglist = self.convo[key] || []

    var inserted = false
    for( var j = 0; j < msglist.length; j++ ) {
      var m = msglist[j]
      
      if( msg.i == m.i ) {
        msglist[j] = msg
        inserted = true
        break
      }
      else if( msg.w >= m.w ) {
        msglist.splice(j,0,msg)
        inserted = true
        break
      }
    }
    
    if( !inserted ) {
      msglist.push(msg)
    }

    self.convo[key] = msglist
  }



  
  // find an account object by nick and network
  self.findaccount = function(nick,network) {
    var account = null
    for( var i = 0; i < self.accounts.length; i++ ) {
      var acc = self.accounts[i]
      if( acc.nick == nick && acc.network == network ) {
        account = acc
        break
      }
    }

    return account
  }


  // send a message via a specific social medai account
  self.sendmsg = function( account, recipient, text, cb ) {
    var network = self.network[account.network]
    util.log('send',network,recipient,text)

    network.sendmsg(account,recipient,text,function(err,msg){
      if( err ) util.log(err);

      cb(err,msg)
    })
  }

  
  // get all people you can message over all accounts
  self.getpeople = function() {
    for( var i = 0; i < self.accounts.length; i++ ) {
      var account = self.accounts[i]
      var network = self.network[account.network]

      network.getpeople(account,function(err,people){
        if( err ) return util.log(err);

        people.sort(function(a,b){
          return a.nick < b.nick ? -1 : a.nick == b.nick ? 0 : 1
        })

        var key = util.key('people',account)
        self.people[key] = people
        util.save(key,{people:people})

        indexpeople(account,people)

        util.log('people',self.people)
      })
    }
  }


  // get all direct msgs overs all accounts
  self.getmsgs = function() {
    // request concurrently
    for(  var i = 0; i < self.accounts.length; i++ ) {
      var network = self.network[self.accounts[i].network]

      // network returns msgs in reverse chronological order
      network.getmsgs( 'inbound', self.accounts[i], function(err,msgs) {
        if( err ) return util.log(err);

        inboundmsgs(msgs)
        util.log('inbound-msgs',self.inbound)
      })

      network.getmsgs( 'outbound', self.accounts[i], function(err,msgs) {
        if( err ) return util.log(err);

        outboundmsgs(msgs)
        util.log('convo', self.convo)
      })
    }
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

        self.network[account.network].userdetails( account, function(err,data) {
          if( err ) return util.log(err);

          account.nick = data.nick
          account.id = data.id
          account.avatar = data.avatar

          util.log('register',account)
          self.register(account)
        })
      })
    }
  }


  // register an account in the app
  self.register = function(account) {
    util.log('register',account)

    var found = false
    for( var i = 0; i < self.accounts.length; i++ ) {
      var existacc = self.accounts[i]
      util.log('existacc',i,existacc.nick,existacc.network)
      
      if( existacc.nick    == account.nick && 
          existacc.network == account.network ) 
      {
        self.accounts[i].key = account.key
        self.accounts[i].secret = account.secret
        found = true
        break
      }
    }
    
    if( !found ) {
      self.accounts.push( account )
    }

    util.log('accounts',found,self.accounts)

    util.save('accounts',{accounts:self.accounts})

    app.accounts.render()
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
    list: $('#accounts_list'),
    item_tm: $('#accounts_item_tm').clone()
  }


  // bind signin functions to signin buttons
  for( var n in conf.network ) {
    var signin = self.el.signin[n] = $('#accounts_signin_'+n)
    util.log('signin',n)
    signin.tap(social.makesignin(n))
  }


  // display social media accounts
  self.render = function() {
    if( !self.dirty ) return;
    self.dirty = false

    self.el.list.empty()
    for( var i = 0; i < social.accounts.length; i++ ) {
      var account = social.accounts[i]
      util.log('acc',i,account)
      
      var item = self.el.item_tm.clone()
      item.attr('id','accounts_item_'+i)
        
      util.text(item,{
        nick:account.nick,
      })
      util.log('item',item.html())
      
      item.find('img.avatar').attr('src',account.avatar)
      item.find('img.network').attr('src','img/'+account.network+'-64.png')

      self.el.list.append(item.removeClass('hide'))
    }
  }

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


