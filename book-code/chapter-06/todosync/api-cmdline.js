
var util     = require('util')
var simpledb = require('simpledb')
var eyes     = require('eyes')


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
          sdberr(function(itemres){
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
        jsonout({code:'not-found'})
      }
    }))
  }

  self.putapp = function( jsonout, appid ) {
    var attrs = {created:new Date().getTime()}
    getsdb().putItem(
      'todo_app', appid, 
      attrs,
      {'Expected.1.Name':'created', 'Expected.1.Exists':'false'},
      sdberr(function(res){
        attrs.id = appid
        jsonout(attrs)
      })
    )
  }


  self.getitem = function( jsonout, appid, itemid ) {
    var itemname = appid+'_'+itemid
    getsdb().getItem('todo_item',itemname, sdberr(function(itemres){
      if( itemres ) {
        delete itemres.$ItemName

        // simpledb only works with strings
        itemres.created = parseInt(itemres.created,10)
        itemres.updated = parseInt(itemres.updated,10)
        itemres.done    = 'true' == itemres.done

        jsonout(itemres)
      }
      else {
        jsonout({code:'not-found'})
      }
    }))
  }

  
  self.putitem = function( jsonout, appid, itemid, jsonin, isnew ) {
    // simpledb only works with strings
    jsonin.created = ''+jsonin.created
    jsonin.updated = ''+jsonin.updated
    jsonin.done    = ''+jsonin.done

    var itemname = appid+'_'+itemid
    getsdb().getItem('todo_item',itemname, sdberr(function(itemres){
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
          jsonout({code:'item-old'})
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
        sdberr(function(res){
          jsonout(res)
        })
      )
    }))
  }


  self.delitem = function( jsonout, appid, itemid ) {
    var itemname = appid+'_'+itemid
    getsdb().deleteItem('todo_item',itemname, sdberr(function(res){
      jsonout()
    }))
  }

}

var api = new Api( keys.keyid, keys.secret )


var numargs = process.argv.length
var cmd = process.argv[2]


function printUsageAndExit() {
  console.log(
    [ ""
      ,"Usage: node api-cmdline.js cmd arg\n"
      ,"Options:"
      ,"  api func args...:  call api function func with arguments"
      ,"    args are strings or JSON (enclose with single quotes):"
      ,"    api func foo '{\"bar\":123}'"
      ,"\n"
    ].join("\n")
  )
  process.exit(0)
}

function printjson(json) {
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
else {
  printUsageAndExit()
}