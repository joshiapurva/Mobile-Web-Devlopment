
Mobile Web Development
Lab 04
16 Oct 2012
Richard Rodger
richard.rodger@nearform.com




 Objectives
? Use an extensible app structure for Node.js apps
? Understand how to send and receive JSON data from Node.js
? Use test end-points to verify the functioning of an API server
? Define and build a REST API
? Use an ad hoc test harness to exercise an REST API from within a browser console
? Understand how to integrate a REST API with the Backbone framework
? Understand how to connect to a MongoDB database from Node.js


Table of Contents
Objectives	1
Directions For Lab Work	2
Serving JSON with Node.js	4
Building a REST API	9
Connecting to Backbone	13
Using a Database	15
 
 
 Directions For Lab Work
The approach introduced in the previous lab will be used throughout the course:
? Choose a top level folder to contain all your work
? The work for each lab should be placed within a subfolder called labXX, where XX is the zero-padded lab number
? Use the desktop Safari browser and the Safari Web Inspector as your primary test and debug environment for client code
? Serve your apps from your local machine for testing using the nginx web server, as per the instructions in lab01. Use nginx even when testing from desktop Safari. This ensures that AJAX requests will function correctly as you will avoid cross-domain browser restrictions.
? Proxy AJAX requests via nginx to a local Node.js server that you run from the command line. 

Ensure that you have completed all the tasks in lab01 before proceeding, as this and future labs will assume a correctly configured and working environment.
All labs assume a basic level of experience with the command line.
This lab assumes you have completed the tasks in all previous labs.

If you are running this lab on a Windows machine, you will need to install some support utilities so that the npm command can function correctly. Visit http://code.google.com/p/msysgit/
Download and install Git-1.7.9-preview20120201.exe
Prepend to your windows PATH environment variable the path the msysGit bin folder:
This is C:\msysgit\msysgit\bin; if you have used the defaults. This is shown on the next page.
Open a new command prompt and use that to run the examples. This is the simplest way to provide npm with the unix command line tools that it needs to install modules that contain bash shell scripts. 

 Serving JSON with Node.js
This exercise builds a simple Node.js API using an extensible app architecture. The basic organisation of the source code and files will serve as the basis for larger apps.
This exercise assumes you have completed the Node.js exercises in lab 01.

1. Create the following folder structure in your lab04 folder:
	subfolder node with subfolder lib: node/lib
	subfolder site with subfolder public, and subfolder js: site/public/js
	subfolder db

2. Open a command prompt and cd into the node subfolder. Run the following npm commands to install the necessary Node.js modules for this lab. The file npm-install.sh also contains the install commands:
npm install git://github.com/senchalabs/connect.git#1.8.6

npm install node-uuid

npm install mongodb



A subfolder called node_modules is automatically created. If you look into this subfolder you will see the package folders for the modules you have just installed. You can view their source code as well, for debugging purposes.

3. In the node/lib folder, create a file called common.js, and insert the following JavaScript:
var buffer = exports.buffer = require('buffer')

// npm modules
exports.connect = require('connect')
exports.uuid    = require('node-uuid')
exports.mongodb = require('mongodb')


exports.sendjson = function(res,obj){
  var objstr = JSON.stringify(obj)
  console.log('SENDJSON:'+objstr);

  res.writeHead(200,{
    'Content-Type': 'application/json',
    'Cache-Control': 'private, max-age=0, no-cache, no-store',
    "Content-Length": buffer.Buffer.byteLength(objstr) 
  })

  res.end( objstr )
}

The common.js file contains code used by the other JavaScript files. Properties of the build-in exports object are available to other file when they require in this file.
To validate the file, run:
node node/lib/common.js
This does not do anything, but does verify that the npm installed modules can be loaded with require, and that there are no syntax errors.

4. Also in the node/lib folder, create the file json-api.js, with contents:
var common = require('./common')

exports.ping = function( req, res ) {
  var output = {ok:true,time:new Date()}
  res.sendjson$( output )
}

exports.echo = function( req, res ) {
  var output = req.query

  if( 'POST' == req.method ) {
    output = req.body
  }

  res.sendjson$( output )
}

The common.js file is loaded using the reference “./common”. The relative path means that Node.js will look for a JavaScript file called common.js in the same folder as the json-api.js file.

5. In the node/lib folder , create the file json-server.js, with contents:

var common = require('./common')
var api    = require('./json-api')

var connect = common.connect


function init() {
  var server = connect.createServer()
  server.use( connect.logger() )
  server.use( connect.bodyParser() )
  server.use( connect.query() )

  server.use( function( req, res, next ) {
    res.sendjson$ = function( obj ) {
      common.sendjson( res, obj )
    }
    next()
  })

  var router = connect.router( function( app ) {
    app.get('/api/ping', api.ping)
    app.get('/api/echo', api.echo)
    app.post('/api/echo', api.echo)
  })
  server.use(router)

  server.use( connect.static( __dirname + '/../../site/public') )

  server.listen(8180)
}


init()

This is the main server file. To run, use:
node node/lib/json-server.js

Note in particular the custom middleware definition of the sendjson$ method, which is dynamically attached the res response object.

5. Verify that the server is functioning correctly by opening the URL:
http://127.0.0.1:8180/api/ping
If you have nginx running, this will also work:
http://127.0.0.1/api/ping
The output is JSON object: {"ok":true,"time":"2012-02-06T12:35:58.547Z"}

6. To test from Safari, create a file in the site/public folder called test.html:
<!DOCTYPE html> 
<html> 
<head> 
  <title>Test</title> 
  <script src="js/jquery.js"></script>
  <script src="js/server-test.js"></script>
</head> 
<body> 
<p>
Open the Web Inspector Console, and try:
</p>

<code>
http.get('/api/ping')<br />
http.post('/api/echo',{a:1})<br />
function printjson() { console.log(JSON.stringify(arguments[0])) }<br />
http.get('/api/ping',printjson)<br />
http.post('/api/echo',{a:1},printjson)<br />
</code>

</body>
</html>

Copy the jquery.js, backbone.js and underscore.js files from lab03 into the site/public/js folder.

7. Create a file called server-test.js in the folder site/public/js:

function logargs() {
  console.log(arguments)
}

var http = {
  req: function(method,url,data,callback) {
    $.ajax({
      url:         url,
      type:        method,
      contentType: 'application/json',
      data:        data ? JSON.stringify(data) : null,
      dataType:    'json',
      cache:       false,
      success:     callback || logargs,
      error:       callback || logargs
    })
  },


  post: function(url,data,callback) {
    http.req('POST',url,data,callback)
  },

  put: function(url,data,callback) {
    http.req('PUT',url,data,callback)
  },

  get: function(url,callback) {
    http.req('GET',url,null,callback)
  },

  del: function(url,callback) {
    http.req('DELETE',url,null,callback)
  }
}

This is a simple ad hoc test harness for issuing manual AJAX requests from the browser console. The general purpose jQuery $.ajax method is used, parameterised by the desired HTTP verb. You can provide an optional callback for the result.

8. Open the test.html file in Safari using http://127.0.0.1:8180/test.html
In this case you must use the port number 8180 so that AJAX calls will work (otherwise the browser will restrict them as being cross-domain).
Run the suggested tests:
http.get('/api/ping')
http.post('/api/echo',{a:1})
function printjson() { console.log(JSON.stringify(arguments[0])) }
http.get('/api/ping',printjson)
http.post('/api/echo',{a:1},printjson)

You should see output in the console, and you can also verify the HTTP traffic using the Network tab of the Web Inspector.

 Building a REST API
This example shows a simple in-memory database for to-do items exposed via a REST API. If you shutdown the Node.js server, the data disappears.
To build this example, the JSON server from the previous example is extended. The ping and echo end-points are left in place, as they can be used to validate the server. In general, test end-points such as these are useful even in production systems to validate correct operation and deployment.
1. Copy the json-server.js file in the node/lib folder to a new file called rest-server.js. Extend the custom middleware by adding a send$ method to handle HTTP error codes:
  server.use( function( req, res, next ) {
    res.sendjson$ = function( obj ) {
      common.sendjson( res, obj )
    }

    res.send$ = function( code, text ) {
      res.writeHead( code, ''+text )
      res.end()
    }

    next()
  })

2. Extend the API definition to handle the HTTP verbs required for REST:
  var router = connect.router( function( app ) {
    app.get('/api/ping', api.ping)
    app.get('/api/echo', api.echo)
    app.post('/api/echo', api.echo)

    app.post('/api/rest/todo',    api.rest.create)
    app.get('/api/rest/todo/:id', api.rest.read)
    app.get('/api/rest/todo',     api.rest.list)
    app.put('/api/rest/todo/:id', api.rest.update)
    app.del('/api/rest/todo/:id', api.rest.del)
  })


These are specific to the To Do app example from the previous lab. The prefix /api/rest is used to create an isolated namespace that does not clash with other API end-points.

3. Implement the REST API in a new file: node/lib/rest-api.js:

// API implementation

var common = require('./common')

var uuid = common.uuid


var data = {}

var util = {}
util.validate = function( input ) {
  return input.text
}

var debug = {}
debug.pd = function( restfunc ) {
  return function( req, res ) {
    console.log('before',data)
    var sendjson$ = res.sendjson$
    
    res.sendjson$ = function() {
      console.log('after',data)
      sendjson$.apply(res,Array.prototype.slice.call(arguments))
    }
    
    restfunc( req, res )
  }
}


exports.ping = function( req, res ) {
  var output = {ok:true,time:new Date()}
  res.sendjson$( output )
}


exports.echo = function( req, res ) {
  var output = req.query

  if( 'POST' == req.method ) {
    output = req.body
  }

  res.sendjson$( output )
}


exports.rest = {

  create: debug.pd(function( req, res ) {
    var input = req.body
    
    if( !util.validate(input) ) {
      return res.send$(400, 'invalid')
    }

    var todo = {
      text: input.text,
      created: new Date().getTime(),
      id: uuid.v4()
    }

    data[todo.id] = todo

    var output = todo
    res.sendjson$( output )
  }),


  read: debug.pd(function( req, res ) {
    var input = req.params

    var output = data[input.id]
    if( output ) {
      res.sendjson$( output )
    }
    else {
      res.send$(404,'not found')
    }
  }),


  list: debug.pd(function( req, res ) {
    var input = req.query
    var output = []

    for( var id in data ) {
      output.push( data[id] )
    }

    // sort in descending order
    output.sort(function(a,b) {
      return b.created - a.created
    })

    res.sendjson$( output )
  }),


  update: debug.pd(function( req, res ) {
    var id    = req.params.id
    var input = req.body
    
    if( !util.validate(input) ) {
      return res.send$(400, 'invalid')
    }

    var todo = data[id]
    if( !todo ) {
      res.send$(404,'not found')
    }

    todo.text = input.text

    var output = todo
    res.sendjson$( output )
  }),


  del: debug.pd(function( req, res ) {
    var input = req.params

    var output = data[input.id] || {}
    delete data[input.id]

    res.sendjson$( output )
  }),

}


The uuid module provides unique identifiers according to version 4 of the GUID standard.
The debug.pd method is a wrapper method that prints the before and after state of the in-memory data store, which is simple an object “data” that holds the items referenced by id. Notice that the after state must be printed inside a modified version of the sendjson$ method to ensure that the final version of the data object is shown. The sendjson$ method is the last one that each REST API method calls to return data.
Each REST API method is placed within the api.rest namespace – it is good practice to use separate namespaces for methods and properties that are related.


4. Run as before, using:
node node/lib/rest-server.js

5. Test, as before, visiting http://127.0.0.1:8180/test.html and using the browser console to issue requests. Try the following sequence of commands:
- to create a to do item:
http.post('/api/rest/todo',{text:'one'}, printjson)
{"text":"one","created":1328655744050,"id":"7e15dbbf-7851-43f1-b62c-c44b6da9cedb"}
- to load a to do item from the server (use the unique id returned by your system):
http.get('/api/rest/todo/7e15dbbf-7851-43f1-b62c-c44b6da9cedb',printjson)
{"text":"one","created":1328655744050,"id":"7e15dbbf-7851-43f1-b62c-c44b6da9cedb"}

- create another to do item, and list all items:
http.post('/api/rest/todo',{text:'two'}, printjson)
{"text":"two","created":1328655964930,"id":"b2793b32-afa9-4146-bdf6-6f766c671f2b"}
http.get('/api/rest/todo',printjson)
[{"text":"two","created":1328655964930,"id":"b2793b32-afa9-4146-bdf6-6f766c671f2b"},{"text":"one","created":1328655744050,"id":"7e15dbbf-7851-43f1-b62c-c44b6da9cedb"}]

- update an item
http.put('/api/rest/todo/7e15dbbf-7851-43f1-b62c-c44b6da9cedb',{text:'onex'},printjson)
{"text":"onex","created":1328655744050,"id":"7e15dbbf-7851-43f1-b62c-c44b6da9cedb"}
http.get('/api/rest/todo/7e15dbbf-7851-43f1-b62c-c44b6da9cedb',printjson)
{"text":"onex","created":1328655744050,"id":"7e15dbbf-7851-43f1-b62c-c44b6da9cedb"}

- delete an item
http.del('/api/rest/todo/b2793b32-afa9-4146-bdf6-6f766c671f2b',printjson)
{"text":"two","created":1328655964930,"id":"b2793b32-afa9-4146-bdf6-6f766c671f2b"}
http.get('/api/rest/todo',printjson)
[{"text":"onex","created":1328655744050,"id":"7e15dbbf-7851-43f1-b62c-c44b6da9cedb"}]

6. The debug.pd function in the rest-api.js file prints out the before and after state of the in-memory data. Review this output, and confirm that the operations in step 4 are manipulating the data in the server.
 Connecting to Backbone
The Backbone library can persist entities to a REST interface. In the previous lab a localStorage persistence engine was used. However the default mechanism is to use REST. To enable this, you need to specify the base end point (/api/rest/todo) using the url property of the Collection
1. Copy the test.html file in the site/public folder to backbone.html.
2. Replace the contents of the backbone.html file with:
<!DOCTYPE html> 
<html> 
<head> 
  <title>Backbone</title> 
  <script src="js/jquery.js"></script>
  <script src="js/underscore.js"></script>
  <script src="js/backbone.js"></script>
  <script src="js/backbone-test.js"></script>
</head> 
<body> 
<p>
Open the Web Inspector Console, and try:
</p>

<code>
app.model.items.fetch()<br />
app.model.items.print()<br />
app.model.items.additem()<br />
</code>

</body>
</html>

3. Create the site/public/js/backbone-test.js file:

function logargs() {
  console.log(arguments)
}

var app = {
  model: {}
}

var bb = {
  model: {}
}


bb.init = function() {

  bb.model.Item = Backbone.Model.extend({    
    defaults: {
      text: ''
    },

    initialize: function() {
      var self = this
      _.bindAll(self)
    }

  })


  bb.model.Items = Backbone.Collection.extend({    
    model: bb.model.Item,
    url: '/api/rest/todo',

    initialize: function() {
      var self = this
      _.bindAll(self)
      self.count = 0

      self.on('reset',function() {
        self.count = self.length
      })
    },

    additem: function() {
      var self = this
      var item = new bb.model.Item({
        text:'item '+self.count
      })
      self.add(item)
      self.count++
      item.save() 
    },

    print: function() {
      var self = this
      self.each(function(item){
        logargs(item.toJSON())
      })
    }
  })

}


app.init = function() {
  bb.init()

  app.model.items = new bb.model.Items()
}


$(app.init)


This file has the same basic structure as the previous Backbone examples, but paired down to only use a Model and Collection. The localStorage reference has been removed and replaced with:
    url: '/api/rest/todo',

4. Test the Backbone REST integration using the suggested commands:

app.model.items.fetch()
app.model.items.print()
app.model.items.additem()

5. As before, review the server logging output to confirm that the data has updated.
 Using a Database
You can store the To Do item data permanently using a database. In this example, you will use the MongoDB database (covered in more detail in Lecture 05) to store the data.
MongoDB is a “noSQL” database, which means that it does not use traditional SQL and tables with rows and columns. Instead, it is a store for JSON documents, and allows these documents to be queried and manipulated, using JSON itself as the query language.

1. Download and install the MongoDB database from http://www.mongodb.org/
2. Run the database from the command line using:
mongod --dbpath=db

Confirm that you can connect to the running MongoDB database by running from a new command line:
mongo
This should open the MongoDB console. Try the command:
show dbs
to list the current databases.

3. Copy the rest-server.js file in the node/lib folder to a new file called db-server.js. Extend the custom middleware by adding an err$ method to handle database errors:
  server.use( function( req, res, next ) {
    res.sendjson$ = function( obj ) {
      common.sendjson( res, obj )
    }

    res.send$ = function( code, text ) {
      res.writeHead( code, ''+text )
      res.end()
    }

    res.err$ = function(win) {
      return function( err, output ) {
        if( err ) {
          console.log(err)
          res.send$(500, err)
        }
        else {
          win && win(output)
        }
      }
    }

    next()
  })


4. Add some code to db-server.js to connect to the database before starting to listen for HTTP requests:
  api.connect(
    {
      name:   'lab04',
      server: '127.0.0.1',
      port:   27017,
    },
    function(err){
      if( err ) return console.log(err);
      
      server.listen(8180)
    }
  )

If a database connection error occurs (e.g. the database is not running), then the error is printed and the server exists, due to the return statement in:
      if( err ) return console.log(err);
The console.log method does not have an actual return value. This is an idiomatic way of exiting from a callback when an error condition occurs, and avoids an extra level of indentation.

5. Create a filed called db-rest-api.js in node/lib and insert:

// API implementation

var common = require('./common')

var uuid    = common.uuid
var mongodb = common.mongodb


var todocoll = null

var util = {}

util.validate = function( input ) {
  return input.text
}

util.fixid = function( doc ) {
  if( doc._id ) {
    doc.id = doc._id.toString()
    delete doc._id
  }
  else if( doc.id ) {
    doc._id = new mongodb.ObjectID(doc.id)
    delete doc.id
  }
  return doc
}


exports.ping = function( req, res ) {
  var output = {ok:true,time:new Date()}
  res.sendjson$( output )
}


exports.echo = function( req, res ) {
  var output = req.query

  if( 'POST' == req.method ) {
    output = req.body
  }

  res.sendjson$( output )
}


exports.rest = {

  create: function( req, res ) {
    var input = req.body
    
    if( !util.validate(input) ) {
      return res.send$(400, 'invalid')
    }

    var todo = {
      text: input.text,
      created: new Date().getTime(),
    }

    todocoll.insert(todo, res.err$(res,function( docs ){
      var output = util.fixid( docs[0] )
      res.sendjson$( output )
    }))
  },


  read: function( req, res ) {
    var input = req.params

    console.log(req.params)

    var query = util.fixid( {id:input.id} )
    todocoll.findOne( query, res.err$( function( doc ) {
      if( doc ) {
        var output = util.fixid( doc )
        res.sendjson$( output )
      }
      else {
        res.send$(404,'not found')
      }
    }))
  },


  list: function( req, res ) {
    var input = req.query
    var output = []

    var query   = {}
    var options = {sort:[['created','desc']]}

    todocoll.find( query, options, res.err$( function( cursor ) {
      cursor.toArray( res.err$( function( docs ) {
        output = docs
        output.forEach(function(item){
          util.fixid(item)
        })
        res.sendjson$( output )
      }))
    }))
  },


  update: function( req, res ) {
    var id    = req.params.id
    var input = req.body
    
    if( !util.validate(input) ) {
      return res.send$(400, 'invalid')
    }

    var query = util.fixid( {id:id} )
    todocoll.update( query, {$set:{text:input.text}}, res.err$( function( count ) {
      if( 0 < count ) {
        var output = util.fixid( doc )
        res.sendjson$( output )
      }
      else {
        console.log('404')
        res.send$(404,'not found')
      }
    }))
  },


  del: function( req, res ) {
    var input = req.params

    var query = util.fixid( {id:input.id} )
    todocoll.remove( query, res.err$( function() {
      var output = {}
      res.sendjson$( output )
    }))
  }

}



exports.connect = function(options,callback) {
  var client = new mongodb.Db( options.name, new mongodb.Server(options.server, options.port, {}))
  client.open( function( err, client ) {
    if( err ) return callback(err);

    client.collection( 'todo', function( err, collection ) {
      if( err ) return callback(err);

      todocoll = collection
      callback()
    })
  })
}




This version of the API implementation uses the https://github.com/christkv/node-mongodb-native
module to connect to the MongoDB database.

As MongoDB provides identifiers automatically, there is no longer any need to generate them. However, the Backbone library expects ids to be string properties with the name “id”, where as MongoDB uses “_id” and a custom object. The util.fixid method translates between the two.

6. Repeat the ad hoc tests in the REST server example above. They should work as before. To view the contents of the database, run the mongo console as per step 2, and enter:
use lab04

This connects to the lab04 database. Then run the following query:
db.todo.find()
This will print out the list of To Do items in the database.


