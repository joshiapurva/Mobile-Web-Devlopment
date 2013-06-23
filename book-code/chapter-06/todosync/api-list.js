
var common   = require('./common.js')
var util     = common.util
var connect  = common.connect
var simpledb = common.simpledb
var eyes     = common.eyes


var keys = require('./keys.js')


function Api(keyid,secret) {
  var self = this

  var sdb = null
  function getsdb() {
    if( !sdb ) {
      sdb = new simpledb.SimpleDB({keyid:keyid,secret:secret},
                                  self.debug?simpledb.debuglogger:null)
    }
    return sdb
  }


  function sdberr(win,fail) {
    return function(err,res,meta){
      if( err ) {
        if( !fail ) {
          console.log('ERROR:')
          eyes.inspect(err)
        }
        else {
          fail(err,meta)
        }
      }
      else {
        win && win(res,meta)
      }
    }
  }


  function err500(jsonout,win){
    return sdberr(win,function(err,meta){
      jsonout(500)
    })
  }


  function errcond(jsonout,errcode,win){
    return sdberr(win,function(err,meta){
      var out = {}, status = 500
      if( 'ConditionalCheckFailed' == err.Code ) {
        status = 400
        out.code = errcode
      }
      jsonout(out,status)
    })
  }



  self.create = function( jsonout, what ) {
    if( 'all' == what ) {
      var created = []
      getsdb().createDomain('todo_app',sdberr(function(res){
        created.push('todo_app')

      ;getsdb().createDomain('todo_item',sdberr(function(res){
        created.push('todo_item')
     
        jsonout({created:created})
      })) }))
    }
  }


  self.metadata = function( jsonout, what ) {
    if( 'all' == what ) {

      var metadata = {}
      getsdb().domainMetadata('todo_app',sdberr(function(res){
        metadata.todo_app = res

      ;getsdb().domainMetadata('todo_item',sdberr(function(res){
        metadata.todo_item = res

        jsonout(metadata)
      })) }))
    }
  }


  self.listapp = function( jsonout, what ) {
    if( 'all' == what ) {
      getsdb().select(
        "select * from todo_app",sdberr(function(res){
          jsonout(res)
        }))
    }
  }


  self.getapp = function( jsonout, appid ) {
    getsdb().getItem('todo_app',appid,sdberr(function(appres){
      if( appres ) {
        getsdb().select(
          "select * from todo_item where app = '?'",[appid],
          err500(jsonout,function(itemres){
            appres = appres || {}
            appres.id = appres.$ItemName || null
            delete appres.$ItemName

            itemres.forEach(function(item){
              delete item.$ItemName

              item.created = parseInt(item.created,10)
              item.updated = parseInt(item.updated,10)
              item.done    = 'true' == item.done
            })
            appres.items = itemres

            jsonout(appres)
          }))
      }
      else {
        jsonout(404)
      }
    }))
  }


  self.putapp = function( jsonout, appid ) {
    var attrs = {created:new Date().getTime()}
    getsdb().putItem(
      'todo_app', appid, 
      attrs,
      {'Expected.1.Name':'created', 'Expected.1.Exists':'false'},
      errcond(jsonout,'app-exists',function(res){
        attrs.id = appid
        jsonout(attrs)
      })
    )
  }


  self.getitem = function( jsonout, appid, itemid ) {
    if( itemid ) {
      var itemname = appid+'_'+itemid
      getsdb().getItem('todo_item',itemname, err500(jsonout,function(itemres){
        if( itemres ) {
          delete itemres.$ItemName

          // simpledb only works with strings
          itemres.created = parseInt(itemres.created,10)
          itemres.updated = parseInt(itemres.updated,10)
          itemres.done    = 'true' == itemres.done

          jsonout(itemres)
        }
        else {
          jsonout(404)
        }
      }))
    }
    else {
      self.getapp(function(appres){
        jsonout(appres.items)
      },appid)
    }
  }

  
  self.putitem = function( jsonout, appid, itemid, jsonin, isnew ) {
    // simpledb only works with strings
    jsonin.created = ''+jsonin.created
    jsonin.updated = ''+jsonin.updated
    jsonin.done    = ''+jsonin.done

    var itemname = appid+'_'+itemid
    getsdb().getItem('todo_item',itemname, err500(jsonout,function(itemres){
      var created  = new Date().getTime()
      var updated  = created
      var expected = {}
      if( itemres ) {
        if( isnew ) {
          jsonout({code:'item-exists'})
          return
        }

        if( parseInt(itemres.updated,10) < parseInt(jsonin.updated,10) ) { 
          created = itemres.created
          updated = jsonin.updated
          expected = 
            {'Expected.1.Name':'updated', 
             'Expected.1.Value':itemres.updated}
        }
        else {
          jsonout({code:'item-old'},400)
          return
        }
      }

      var attrs = {
        id:itemid,
        app:appid,
        created:created,
        updated:updated,
        text:jsonin.text,
        done:jsonin.done
      }

      getsdb().putItem(
        'todo_item', 
        itemname, 
        attrs,
        expected,
        errcond(jsonout,'item-old',function(res){
          jsonout(res)
        })
      )
    }))
  }


  self.delitem = function( jsonout, appid, itemid ) {
    var itemname = appid+'_'+itemid
    getsdb().deleteItem('todo_item',itemname, err500(jsonout,function(res){
      jsonout()
    }))
  }


  self.timesync = function( jsonout, clienttime ) {
    var arrivaltime = new Date().getTime()
    jsonout({clienttime:parseInt(clienttime,10),arrivaltime:arrivaltime},true)
  }
}

var api = new Api( keys.keyid, keys.secret )


var numargs = process.argv.length
var cmd = process.argv[2]


function printUsageAndExit() {
  console.log(
    [ ""
      ,"Usage: node api.js cmd arg\n"
      ,"Options:"
      ,"  run port:          run server on port"
      ,"  api func args...:  call api function func with arguments"
      ,"    args are strings or JSON (enclose with single quotes):"
      ,"    api func foo '{\"bar\":123}'"
      ,"\n"
    ].join("\n")
  )
  process.exit(0)
}

function printjson(json,status) {
  if( 'object' != typeof(json) ) {
    status = json
    json = {}
  }
  json.$status = status || 200
  eyes.inspect(json)
}


if( numargs < 4 ) {
  printUsageAndExit()
}
else if( 'api' == cmd || 'debug' == cmd ) {
  api.debug = 'debug' == cmd

  var func = process.argv[3]

  var arg = null, aI = 4, args = [printjson]
  while( arg = process.argv[aI++] ) {
    if( '{' == arg.charAt(0) ) {
      arg = JSON.parse(arg)
    }
    else if( 'false' == arg ) {
      arg = false
    }
    args.push(arg)
  }

  api[func].apply(api,args)
}
else if( 'run' == cmd ) {
  var port = parseInt(process.argv[3],10)
  
  function sendjson(res){
    return function(json,status){
      var sendtime = false
      if( 'object' != typeof(json) ) {
        status = json
        json = {}
      }
      status = status || 200

      if( 'boolean' == typeof(status) ) {
        sendtime = status
        status = 200
      }

      common.sendjson( status, res, json, sendtime )
    }
  }

  var server = connect.createServer(
    connect.router(function(app){

      app.get('/todo/sync/api/app/:appid',function(req,res,next){
        api.getapp( sendjson(res), req.params.appid )
      })

      app.put('/todo/sync/api/app/:appid',function(req,res,next){
        api.putapp( sendjson(res), req.params.appid )
      })


      app.get('/todo/sync/api/app/:appid/item/:itemid?',function(req,res,next){
        api.getitem( sendjson(res), req.params.appid, req.params.itemid )
      })

      app.put('/todo/sync/api/app/:appid/item/:itemid',function(req,res,next){
        common.readjson(req,function(input){
          api.putitem( sendjson(res), req.params.appid, req.params.itemid, input, true )
        })
      })

      app.post('/todo/sync/api/app/:appid/item/:itemid',function(req,res,next){
        common.readjson(req,function(input){
          api.putitem( sendjson(res), req.params.appid, req.params.itemid, input, false )
        })
      })

      app.del('/todo/sync/api/app/:appid/item/:itemid',function(req,res,next){
        api.delitem( sendjson(res), req.params.appid, req.params.itemid )
      })


      app.get('/todo/sync/api/time/:clienttime',function(req,res,next){
        api.timesync( sendjson(res), req.params.clienttime )
      })
    })
  )

  server.listen( port )
  console.log('To Do List API server listening on port '+port)
  api.metadata(printjson,'all')
}
else {
  printUsageAndExit()
}