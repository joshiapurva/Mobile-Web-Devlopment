

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
  document.addEventListener("resume", app.resume, false);
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



  
  // use jquery events to signal arrival of data from social networks
  // data can come back at random times depending on network,
  // so events are more flexible than callbacks

  self.bind = function( eventname, callback ) {
    $(document).bind('social-'+eventname,callback)
  }

  self.trigger = function( eventname ) {
    var args = Array.prototype.slice.call(arguments,1)
    $(document).trigger('social-'+eventname,args)
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
        self.trigger('people')
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
        self.trigger('inbound-msgs')
      })

      network.getmsgs( 'outbound', self.accounts[i], function(err,msgs) {
        if( err ) return util.log(err);

        outboundmsgs(msgs)
        self.trigger('outbound-msgs')
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

    self.trigger('accounts')
    self.getmsgs()
    self.getpeople()
  }

}


// Manage the Inbox view
function Inbox(social) {
  var self = this

  self.dirty = true

  self.el  = {
    window: $(window),
    refresh: $('#inbox_refresh'),
    itemlist: $('#inbox_itemlist'),
    item_tm: $('#inbox_item_tm').clone().removeClass('hide')
  }
  


  // pull-down refresh handling

  var startY = 0
  var refreshing = false

  document.addEventListener("touchstart", function(e) {
    startY = e.touches[0].clientY
  })

  document.addEventListener("touchmove", function(e) {
    self.refresh(e)
  })


  self.refresh = function(e) {
    var wst = self.el.window.scrollTop()
    var curY = e.touches[0].clientY

    var atpagetop = 0 == wst && startY < curY 
    if( atpagetop ) {
      e.preventDefault()
    }

    var refresh = atpagetop && !refreshing && self.visible
    util.log(refresh,wst,startY,curY,atpagetop,refreshing,self.visible)

    if( refresh ) {
      refreshing = true
      self.el.refresh.show()
      social.trigger('update-inbox')
      social.trigger('update-people')
    }
  }


  social.bind('inbound-msgs', function(){
    self.dirty = true

    if( refreshing ) {
      refreshing = false
      self.el.refresh.hide()
    }

    self.render()
  })

  social.bind('update-inbox', function(){
    self.update()
  })


  // display current msgs
  self.render = function() {
    if( !self.dirty) return;
    self.dirty = false

    self.insertmsgs(social.inbound)
  }


  // check for new msgs
  self.update = function() {
    self.dirty = true
    social.getmsgs()
  }


  // insert a list of msgs into the view
  self.insertmsgs = function( msgs ) {
    util.log('insertmsgs',msgs.length)
    if( msgs ) {
      self.el.itemlist.empty()
      for( var i = 0; i < msgs.length; i++ ) {
        self.rendermsg( msgs[i] )
      }
    }
  }


  // render an individual msg
  self.rendermsg = function( msg, after ) {
    //util.log('rendermsg',msg)
    if( msg ) {
      var item = self.el.item_tm.clone()
      util.text(item,{
        from:msg.f,
        to:msg.t,
        name:msg.m,
        when:''+new Date(msg.w).toString('ddd HH:mm'),
        subject:msg.s,
        network:msg.k,
        nick:msg.n
      })

      item.find('img.network_img').attr('src','img/'+msg.k+'-16.png')

      item.tap(function(){
        if( refreshing ) return;

        var acc = social.findaccount(msg.n,msg.k)

        social.trigger('convo',msg.f,acc)
        social.trigger('convo-show')
      })


      self.el.itemlist.append(item)
      item.show()
    }
  }
}


// Manage the conversation view
function Convo(social) {
  var self = this

  self.dirty = true

  self.el  = {
    avator:  $('#convo_avator'),
    other:   $('#convo_other'),
    network: $('#convo_network'),
    avatar:  $('#convo_avatar'),
    me:      $('#convo_me'),
    compose: $('#convo_compose'),
    send:    $('#convo_send'),

    list:   $('#convo_list'),
    msg_tm: $('#convo_msg_tm').clone().removeClass('hide')
  }


  // listen for msg events - may be relevant to current conversation
  social.bind('inbound-msgs', function(){
    self.dirty = true
    self.render()
  })

  social.bind('outbound-msgs', function(){
    self.dirty = true
    self.render()
  })

  social.bind('convo', function( event, person, account){
    util.log('convo.bind',event,person,account)
    self.set(person,account)
  })



  // send a direct message
  self.el.send.tap(function(){
    var text = self.el.compose.val()
    self.el.compose.val('')
    self.el.send.fadeOut()
    social.sendmsg(self.account,self.other,text,function(err,msg){
      if( err ) return util.log(err);

      msg && self.displaymsg(msg)
      self.el.send.fadeIn()
    })
  })


  // display a conversation
  self.render = function() {
    if( !self.dirty || !self.account ) return;
    self.dirty = false

    var peoplemap = social.peoplemap[self.account.network]
    var person = (peoplemap && peoplemap[self.other]) || null
    util.log('person',person)
    self.el.avatar.attr('src',person?person.avimg:'')

    self.el.other.text(self.other)

    self.el.network.attr('src','img/'+self.account.network+'-16.png')
    self.el.me.text(self.account.nick)

    self.el.list.empty()

    for( var i = self.convo.length-1; 0 <= i; i-- ) {
      var msg = self.convo[i]
      self.displaymsg(msg)
    }
  }

  
  // display an individual message
  self.displaymsg = function( msg ) {
    var item = self.el.msg_tm.clone()
    item.css({float:msg.f?'right':'left'})
    util.text(item,{
      meta: ''+new Date(msg.w).toString('ddd HH:mm'),
      body: msg.s,
      who: (msg.f || msg.n)
    })
    self.el.list.prepend(item)
  }


  // check for new msgs
  self.update = function(cb) {
    self.dirty = true
    social.getmsgs()
  }


  // set the conversion to display
  //   other: nick of other participant
  //   account: user's chosen social media account
  self.set = function( other, account ) {
    util.log('convo.set',other,account)

    self.other = other
    self.account = account
    var key = account.network+'~'+account.nick+'~'+self.other
    self.convo = social.convo[key] || []
    self.dirty = true
    util.log('convo set',key,self.convo)
  }

}


// Manage the list of people you can msg
function People(social) {
  var self = this

  self.el = {
    list: $('#people_list'),
    network_tm: $('#people_network_tm').clone().removeClass('hide'),
    divider_tm: $('#people_divider_tm').clone().removeClass('hide'),
    person_tm: $('#people_person_tm').clone().removeClass('hide'),
  }

  self.dirty = true


  // listen for people events
  social.bind('people', function(){
    self.dirty = true
    self.render()
  })

  // listen for update request events
  social.bind('update-people', function(){
    self.update()
  })


  // display indexed list of people by first character of nick
  self.render = function(){
    if( !self.dirty) return;
    self.dirty = false

    self.el.list.empty()
    var accs = social.accounts

    self.peoplemap = {}
    self.dividermap = {}

    function list(i) {
      if( i < accs.length ) {
        var acc = accs[i]
        util.log(i,acc)

        var key = util.key('people',acc)

        var network_item = self.el.network_tm.clone()
        util.text(network_item,{nick:acc.nick})
        network_item.find('img.network').attr('src','img/'+acc.network+'-64.png')
        self.el.list.append(network_item)

        var peoplemap  = self.peoplemap[key]  = (self.peoplemap[key]  || {})
        var dividermap = self.dividermap[key] = (self.dividermap[key] || {})
      
        var people = social.people[key]

        var firstchar
        for( var pI = people.length-1; 0 <= pI; pI-- ) { 
          var person = people[pI]
          if( firstchar != person.nick[0] ) {
            firstchar = person.nick[0]
            peoplemap[firstchar] = []

            var divider_item = self.el.divider_tm.clone()
            util.text(divider_item,{char:firstchar})
            network_item.after(divider_item)
            dividermap[firstchar] = divider_item

            divider_item.tap(function(key,acc,firstchar){
              return function(e){
                e.stopPropagation()
                self.openchar(key,acc,firstchar)
              }
            }(key,acc,firstchar))
          } 

          peoplemap[firstchar].push(person)
        }
        
        list(i+1)
      }
      else {
        self.dirty = false
      }
    }
    list(0)
  }


  // display list of people with same first character of nick
  self.openchar = function( key, account, char ) {
    var people  = self.peoplemap[key][char]
    var divider = self.dividermap[key][char]

    self.el.list.find('li.person').remove()

    // peoplemap stores people in reverse order
    for( var pI = 0; pI < people.length; pI++ ) { 
      var person = people[pI]
      var person_item = self.el.person_tm.clone()
      util.text(person_item,{nick:person.nick,name:person.name})
      person_item.find('img.avatar').attr('src',person.avimg)
      //self.el.list.append(person_item)

      person_item.tap(function(person){
        return function(){
          util.log('people convo set acc',person,account)
          social.trigger('convo',person.nick,account)
          social.trigger('convo-show')
        }
      }(person))

      divider.after(person_item)
    }
  }


  // check for new people
  self.update = function(cb) {
    self.dirty = true
    social.getpeople()
  }
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


  social.bind('accounts', function(){
    self.dirty = true
    self.render()
  })

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
    return function(e) {
      if( self.app[name].visible ) return;

      if( self.con ) {
        console.log('oldcon',self.con)
        var oldcon = self.con
        oldcon.css({'z-index':100})
        self.app[self.name].visible = false
      }

      self.name = name
      self.con = self.el.con[name]
      self.app[name].render()

      self.app[name].visible = true
      self.con.removeClass('hide').css({'z-index':200})

      if( e.noslide ) {
        oldcon && oldcon.addClass('hide')
      }
      else {
        Firmin.translateX(self.con[0],320).translateX(0,'0.4s',function(){
          oldcon && oldcon.addClass('hide')
        })
      }
    }
  }

  // set up content views
  for( var cn in {inbox:1,people:1,accounts:1,convo:1} ) {
    self.el.nav[cn] = $('#nav_'+cn)
    self.el.con[cn] = $('#con_'+cn)
    
    self.show[cn] = makeshowcon(cn)
    self.el.nav[cn].tap( self.show[cn] )
  }

  //self.con = self.el.con[ firstcon ]
  //self.name = firstcon

  self.app.social.bind('convo-show',self.show.convo)
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


  // display the inbox if there are accounts, otherwise show the accounts page

  var showcon = 0 == social.accounts.length ? 'accounts' : 'inbox'
  util.log('app init show: '+showcon)
  self.topnav.show[showcon]({noslide:true})

  if( 'inbox' == showcon ) {
    util.log('updating...')
    social.trigger('update-inbox')
    social.trigger('update-people')
  }


  self.resume = function() {
    util.log('resuming...')
    social.trigger('update-inbox')
    social.trigger('update-people')
  }
}
