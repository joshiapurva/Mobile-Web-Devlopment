
Mobile Web Development
Lab 05
24 Oct 2012
Richard Rodger
richard.rodger@nearform.com




Objectives
?	Using the MongoDB command line client
?	Understanding the MongoDB JavaScript API
?	Using the MongoDB command client to insert data
?	Using the MongoDB command client to query data
?	Using the MongoDB command client to update data
?	Using the MongoDB command client to remove data
?	Using the node-mongodb-native database driver
?	Understanding the driver connection and query API
?	Using a remote cloud-hosted MongoDB service

 
Table of Contents 
Objectives	1
Directions For Lab Work	2
MongoDB: Inserting Data	3
MongoDB: Querying Data	5
MongoDB: Updating Data	8
MongoDB: Removing Data	11
MongoDB Node.js Driver	12
Using MongoHQ.com	15 


Directions For Lab Work
The approach introduced in the previous lab will be used throughout the course:
?	Choose a top level folder to contain all your work
?	The work for each lab should be placed within a subfolder called labXX, where XX is the zero-padded lab number
?	Use the desktop Safari browser and the Safari Web Inspector as your primary development environment
?	Serve your apps from your local machine for testing using the nginx web server, as per the instructions in lab01. Use nginx even when testing from desktop Safari. This ensures that AJAX requests will function correctly as you will avoid cross-domain browser restrictions.
?	Proxy AJAX requests via nginx to a local Node.js server that you run from the command line. 

Ensure that you have completed all the tasks in lab01 before proceeding, as this and future labs will assume a correctly configured and working environment.
All labs assume a basic level of experience with the command line.

This lab assumes you have completed the tasks in all previous labs. In particular, this lab assumes you have installed MongoDB as per lab04. For this lab, again create a db folder in your lab05 folder, as with lab04, and run MongoDB like so:
mongod --dbpath=db
Run this command in your lab05 folder.
On Windows, you will need to use the full path to mongod.exe:
C:\mongo\bin\mongod.exe �dbpath=db
You may need to change the path depending on where you installed MongoDB.

Full documentation for MongoDB is available at:
http://www.mongodb.org/display/DOCS/Home
You will need to refer to this resource to fully use MongoDB.




MongoDB: Inserting Data
For all the exercises in this lab, you should have MongoDB already running in a separate command line window. You should observe the logging output from MongoDB as you run the exercises to get a feel for how it works. You can use the -v flag to get more detailed output.
1. Connect to the MongoDB database from the command line:
mongo
On windows you may have to use:
c:\mongo\bin\mongo.exe

You should see the output:
MongoDB shell version: 1.8.0
connecting to: test
>

Your version number may be different. The output indicates that you are �using� the test database. All your commands apply to the database in �use�.
2. Switch to the lab05 database:
> use lab05;
MongoDB does not require you to create a database explicitly. Once you start issuing commands, the lab05 database files will be created. Database names should be valid JavaScript variable names.
3. Execute some JavaScript:
> var foo = 1+2
> foo
3
The MongoDB command line is just a JavaScript console, much like the one in the Safari browser.
4. Insert some data:
> db.color.insert({name:'red',rgb:[255,0,0]})
> db.color.find()
{ "_id" : ObjectId("4f3a3f530b74e3768d4801ca"), "name" : "red", "rgb" : [ 255, 0, 0 ] }

The db object is provided by MongoDB and represents the current database in use. You can implicitly reference properties on the db object � for examples: db.color
This creates a �collection�, which is like a traditional SQL table. Thus db.color references a collection object, which has its own methods, one of which is �insert�.
To insert a document into the collection, just provide a JavaScript object literal. The document can be as complex as you like, containing sub objects and arrays.
The find method, when used without arguments, returns a list of all documents in the collection.
MongoDB automatically creates a unique identifier for each document � the ObjectID, with property name _id.


5. Insert some more data:
> db.color.insert({hex:'#FF0000',parts:{r:255,g:0,b:0}})

> db.color.find()

{ "_id" : ObjectId("4f3a3fca0b74e3768d4801cb"), "name" : "red", "rgb" : [ 255, 0, 0 ] }

{ "_id" : ObjectId("4f3a418b0b74e3768d4801cc"), "hex" : "#FF0000", "parts" : { "r" : 255, "g" : 0, "b" : 0 } }

Unlike traditional databases, MongoDB does not require a schema � you are not required to define your data structures in advance. You can insert any document into any collection. 

MongoDB: Querying Data
Of all the NoSQL databases, MongoDB offers one of the easiest query languages. The MongoDB query language also maps relatively cleanly to expectations based on SQL, when querying single tables.
Of course, joins are not possible! Instead, �denormalize� by replicating data where needed (see lecture).
This and subsequent exercises assume you are connected to the mongo command line.
1. To find matching documents, provide an example document:
> db.color.find({name:'red'})
{ "_id" : ObjectId("4f3a3fca0b74e3768d4801cb"), "name" : "red", "rgb" : [ 255, 0, 0 ] }


2. You can also match against sub object properties:
> db.color.find({'rgb.0':255})
{ "_id" : ObjectId("4f3a3fca0b74e3768d4801cb"), "name" : "red", "rgb" : [ 255, 0, 0 ] }
> db.color.find({'parts.r':255})
{ "_id" : ObjectId("4f3a418b0b74e3768d4801cc"), "hex" : "#FF0000", "parts" : { "r" : 255, "g" : 0, "b" : 0 } }

Notice that you need to provide the sub object references as strings: 'rgb.0' and 'parts.r' to avoid JavaScript syntax errors.

3. Query conditions are specified using the $conditionName:{criteria...} syntax. For example, to find numeric values greater than 10, use: fieldName:{$gt:10}
> db.color.insert({name:'green',r:0,g:255,b:0})
> db.color.insert({name:'blue',r:0,g:0,b:255})
> db.color.find({g:{$gt:0}})
{ "_id" : ObjectId("4f3a467e199668116a823444"), "name" : "green", "r" : 0, "g" : 255, "b" : 0 }
> db.color.find({b:{$lte:255}})
{ "_id" : ObjectId("4f3a467e199668116a823444"), "name" : "green", "r" : 0, "g" : 255, "b" : 0 }
{ "_id" : ObjectId("4f3a468f199668116a823445"), "name" : "blue", "r" : 0, "g" : 0, "b" : 255 }
The condition names are unsurprising:
$gt = greater than, $gte = greater than or equal to, $lt = less than, $lte = less than or equal to, etc.
See http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries

4. To sort data, use the chained sort method:
> db.color.find({}).sort({name:1})
{ "_id" : ObjectId("4f3a418b0b74e3768d4801cc"), "hex" : "#FF0000", "parts" : { "r" : 255, "g" : 0, "b" : 0 } }
{ "_id" : ObjectId("4f3a468f199668116a823445"), "name" : "blue", "r" : 0, "g" : 0, "b" : 255 }
{ "_id" : ObjectId("4f3a467e199668116a823444"), "name" : "green", "r" : 0, "b" : 0, "g" : 255 }
{ "_id" : ObjectId("4f3a3fca0b74e3768d4801cb"), "name" : "red", "rgb" : [ 255, 0, 0 ] }
> db.color.find({}).sort({name:-1})
{ "_id" : ObjectId("4f3a3fca0b74e3768d4801cb"), "name" : "red", "rgb" : [ 255, 0, 0 ] }
{ "_id" : ObjectId("4f3a467e199668116a823444"), "name" : "green", "r" : 0, "b" : 0, "g" : 255 }
{ "_id" : ObjectId("4f3a468f199668116a823445"), "name" : "blue", "r" : 0, "g" : 0, "b" : 255 }
{ "_id" : ObjectId("4f3a418b0b74e3768d4801cc"), "hex" : "#FF0000", "parts" : { "r" : 255, "g" : 0, "b" : 0 } }

The sort method takes an object literal, where each property maps to a property name in your documents. A positive value means to sort ascending, a negative to sort descending.

5. Create a new collection with many documents:
> for( var i = 0; i < 30; i++ ) {
... db.numbers.insert({n:i})
... }
> db.numbers.find({})
{ "_id" : ObjectId("4f3a4983199668116a823446"), "n" : 0 }
{ "_id" : ObjectId("4f3a4983199668116a823447"), "n" : 1 }
{ "_id" : ObjectId("4f3a4983199668116a823448"), "n" : 2 }
{ "_id" : ObjectId("4f3a4983199668116a823449"), "n" : 3 }
{ "_id" : ObjectId("4f3a4983199668116a82344a"), "n" : 4 }
{ "_id" : ObjectId("4f3a4983199668116a82344b"), "n" : 5 }
{ "_id" : ObjectId("4f3a4983199668116a82344c"), "n" : 6 }
{ "_id" : ObjectId("4f3a4983199668116a82344d"), "n" : 7 }
{ "_id" : ObjectId("4f3a4983199668116a82344e"), "n" : 8 }
{ "_id" : ObjectId("4f3a4983199668116a82344f"), "n" : 9 }
{ "_id" : ObjectId("4f3a4983199668116a823450"), "n" : 10 }
{ "_id" : ObjectId("4f3a4983199668116a823451"), "n" : 11 }
{ "_id" : ObjectId("4f3a4983199668116a823452"), "n" : 12 }
{ "_id" : ObjectId("4f3a4983199668116a823453"), "n" : 13 }
{ "_id" : ObjectId("4f3a4983199668116a823454"), "n" : 14 }
{ "_id" : ObjectId("4f3a4983199668116a823455"), "n" : 15 }
{ "_id" : ObjectId("4f3a4983199668116a823456"), "n" : 16 }
{ "_id" : ObjectId("4f3a4983199668116a823457"), "n" : 17 }
{ "_id" : ObjectId("4f3a4983199668116a823458"), "n" : 18 }
{ "_id" : ObjectId("4f3a4983199668116a823459"), "n" : 19 }
has more
> 
MongoDB returns result sets in the context of a �cursor� - an object named �it�, and object that only contains a part of the result set, and fetches more if needed. By default only 20 results are shown at a time.
To see more results, called the cursor as a function:
...
{ "_id" : ObjectId("4f3a4983199668116a823457"), "n" : 17 }
{ "_id" : ObjectId("4f3a4983199668116a823458"), "n" : 18 }
{ "_id" : ObjectId("4f3a4983199668116a823459"), "n" : 19 }
has more
> it
{ "_id" : ObjectId("4f3a4983199668116a82345a"), "n" : 20 }
{ "_id" : ObjectId("4f3a4983199668116a82345b"), "n" : 21 }
{ "_id" : ObjectId("4f3a4983199668116a82345c"), "n" : 22 }
{ "_id" : ObjectId("4f3a4983199668116a82345d"), "n" : 23 }
{ "_id" : ObjectId("4f3a4983199668116a82345e"), "n" : 24 }
{ "_id" : ObjectId("4f3a4983199668116a82345f"), "n" : 25 }
{ "_id" : ObjectId("4f3a4983199668116a823460"), "n" : 26 }
{ "_id" : ObjectId("4f3a4983199668116a823461"), "n" : 27 }
{ "_id" : ObjectId("4f3a4983199668116a823462"), "n" : 28 }
{ "_id" : ObjectId("4f3a4983199668116a823463"), "n" : 29 }
> 

If you have too many results, use the chained limit function:
> db.numbers.find({}).limit(5)
{ "_id" : ObjectId("4f3a4983199668116a823446"), "n" : 0 }
{ "_id" : ObjectId("4f3a4983199668116a823447"), "n" : 1 }
{ "_id" : ObjectId("4f3a4983199668116a823448"), "n" : 2 }
{ "_id" : ObjectId("4f3a4983199668116a823449"), "n" : 3 }
{ "_id" : ObjectId("4f3a4983199668116a82344a"), "n" : 4 }

This is often most useful when combined with sort, to narrow a result set:
> db.numbers.find({}).sort({n:-1}).limit(5)
{ "_id" : ObjectId("4f3a4983199668116a823463"), "n" : 29 }
{ "_id" : ObjectId("4f3a4983199668116a823462"), "n" : 28 }
{ "_id" : ObjectId("4f3a4983199668116a823461"), "n" : 27 }
{ "_id" : ObjectId("4f3a4983199668116a823460"), "n" : 26 }
{ "_id" : ObjectId("4f3a4983199668116a82345f"), "n" : 25 }

6. Finally, to only return a subset of the document properties, use a second argument to find:
> db.color.find({},{name:1})
{ "_id" : ObjectId("4f3a3fca0b74e3768d4801cb"), "name" : "red" }
{ "_id" : ObjectId("4f3a418b0b74e3768d4801cc") }
{ "_id" : ObjectId("4f3a467e199668116a823444"), "name" : "green" }
{ "_id" : ObjectId("4f3a468f199668116a823445"), "name" : "blue" }

The second argument, {name:1}, specifies the properties that you are interested in.  An empty object {} was used to indicate that there were no query conditions.





MongoDB: Updating Data
Because MongoDB does not provide traditional database ACID semantics, updates need more care than other database interactions. MongoDB does provide a set of �atomic� operations, in that these operations are guaranteed to complete before matching documents are modified by other updates. These can be used to provide certain forms of data integrity. 
1. Update operations consist if a query object, as with queries, and then an update object, providing the new data:
> db.color.update({hex:{$exists:true}},{name:'white',r:255,g:255,b:255})
> db.color.find()
{ "_id" : ObjectId("4f3a3fca0b74e3768d4801cb"), "name" : "red", "rgb" : [ 255, 0, 0 ] }
{ "_id" : ObjectId("4f3a418b0b74e3768d4801cc"), "name" : "white", "r" : 255, "g" : 255, "b" : 255 }
{ "_id" : ObjectId("4f3a467e199668116a823444"), "name" : "green", "r" : 0, "b" : 0, "g" : 255 }
{ "_id" : ObjectId("4f3a468f199668116a823445"), "name" : "blue", "r" : 0, "g" : 0, "b" : 255 }

Here, the $exists condition is used to pick out the previously created document that has a �hex� property (see above). The entire contents of the matching document are replaced by the new data:
{name:'white',r:255,g:255,b:255}

2. To update only specific properties, use $set and $unset
> db.color.update({name:'red'},{$set:{r:255,g:0,b:0},$unset:{rgb:1}})
> db.color.find()
{ "_id" : ObjectId("4f3a3fca0b74e3768d4801cb"), "b" : 0, "g" : 0, "name" : "red", "r" : 255 }
{ "_id" : ObjectId("4f3a418b0b74e3768d4801cc"), "name" : "white", "r" : 255, "g" : 255, "b" : 255 }
{ "_id" : ObjectId("4f3a467e199668116a823444"), "name" : "green", "r" : 0, "b" : 0, "g" : 255 }
{ "_id" : ObjectId("4f3a468f199668116a823445"), "name" : "blue", "r" : 0, "g" : 0, "b" : 255 }
The $set operator updates the properties mentioned with the provided new values:
$set:{r:255,g:0,b:0}
You can also add new properties this way.
The $unset operator deletes existing properties:
$unset:{rgb:1}







3. You can also perform �upsert� operations. In this case, a new document is created if no documents match the query. This is useful for intialising and updating counters using the $inc operator, which increments properties atomically:
> db.counter.update({name:'one'},{$inc:{count:1}},true)
> db.counter.find()
{ "_id" : ObjectId("4f3a4f9cc801a4b87bee6a12"), "count" : 1, "name" : "one" }
> db.counter.update({name:'one'},{$inc:{count:1}},true)
> db.counter.find()
{ "_id" : ObjectId("4f3a4f9cc801a4b87bee6a12"), "count" : 2, "name" : "one" }

An upsert is performed if the third argument to update is true:
db.counter.update({name:'one'},{$inc:{count:1}},true)

4. You can update multiple matching documents by providing a fourth, true, argument:
> db.numbers.update({},{$inc:{n:100}},false,true)
> db.numbers.find()
{ "_id" : ObjectId("4f3a4983199668116a823446"), "n" : 100 }
{ "_id" : ObjectId("4f3a4983199668116a823447"), "n" : 101 }
{ "_id" : ObjectId("4f3a4983199668116a823448"), "n" : 102 }
{ "_id" : ObjectId("4f3a4983199668116a823449"), "n" : 103 }
{ "_id" : ObjectId("4f3a4983199668116a82344a"), "n" : 104 }
{ "_id" : ObjectId("4f3a4983199668116a82344b"), "n" : 105 }
{ "_id" : ObjectId("4f3a4983199668116a82344c"), "n" : 106 }
{ "_id" : ObjectId("4f3a4983199668116a82344d"), "n" : 107 }
{ "_id" : ObjectId("4f3a4983199668116a82344e"), "n" : 108 }
{ "_id" : ObjectId("4f3a4983199668116a82344f"), "n" : 109 }
{ "_id" : ObjectId("4f3a4983199668116a823450"), "n" : 110 }
{ "_id" : ObjectId("4f3a4983199668116a823451"), "n" : 111 }
...

In this case, an upsert is not desired, so the third argument is false.


5. To perform more general atomic updates, you need to use an �update if current� strategy. This covers the case:
1.	Load document from Mongo
2.	Perform multiple operations on object data over time
3.	Save document to Mongo, but only if somebody else has not modified it, otherwise handle as per your specific business logic (e.g. repeat from 1)
To do this, maintain a version property in your object � a simple incrementing counter, and update only if the counter matches
> db.customer.insert({name:'AAA', balance:100, v:1})

> db.customer.find()
{ "_id" : ObjectId("4f3a5251199668116a823464"), "name" : "AAA", "balance" : 100, "v" : 1 }

> db.customer.update({name:'AAA',v:1},{$inc:{v:1},$set:{balance:200}})

> db.customer.find()
{ "_id" : ObjectId("4f3a5251199668116a823464"), "name" : "AAA", "balance" : 200, "v" : 2 }

> db.customer.update({name:'AAA',v:1},{$inc:{v:1},$set:{balance:300}})

> db.customer.find()
{ "_id" : ObjectId("4f3a5251199668116a823464"), "name" : "AAA", "balance" : 200, "v" : 2 }


The second update fails, as the version does not match.


MongoDB: Removing Data
Remove operations are similar to find and update in that the first argument is a pattern object to match against. All matching documents are removed.
1. Remove some objects from the numbers collection
> db.numbers.remove({n:100})
> db.numbers.find().limit(5)
{ "_id" : ObjectId("4f3a4983199668116a823447"), "n" : 101 }
{ "_id" : ObjectId("4f3a4983199668116a823448"), "n" : 102 }
{ "_id" : ObjectId("4f3a4983199668116a823449"), "n" : 103 }
{ "_id" : ObjectId("4f3a4983199668116a82344a"), "n" : 104 }
{ "_id" : ObjectId("4f3a4983199668116a82344b"), "n" : 105 }
> db.numbers.remove({_id:ObjectId("4f3a4983199668116a823447")})
> db.numbers.find().limit(5)
{ "_id" : ObjectId("4f3a4983199668116a823448"), "n" : 102 }
{ "_id" : ObjectId("4f3a4983199668116a823449"), "n" : 103 }
{ "_id" : ObjectId("4f3a4983199668116a82344a"), "n" : 104 }
{ "_id" : ObjectId("4f3a4983199668116a82344b"), "n" : 105 }
{ "_id" : ObjectId("4f3a4983199668116a82344c"), "n" : 106 }

In the second command, the object is removed using its _id unique identifier. In general, MongoDB operations are most efficient if the query used the _id value to specify the object.

MongoDB Node.js Driver
The most popular MongoDB driver for Node.js is 
https://github.com/christkv/node-mongodb-native
Which you met in the last exercise of lab04.

This driver is relatively low level, and there are a number of wrapper modules to make it easier to use. However it is important to understand how it works.
1. Create a folder structure similar to lab04, with folders node and node/lib inside a lab05 project folder.
2. cd into lab05/node and install the driver module:
npm install mongodb


3. Create the file lib/db-util.js, and insert the following code:

var mongodb = require('mongodb')


exports.connect = function(options,callback) {
  options.name   = options.name   || 'test'
  options.server = options.server || '127.0.0.1'
  options.port   = options.port   || 27017

  var server = new mongodb.Server(options.server, options.port, {auto_reconnect:true})
  var database = new mongodb.Db( options.name, server )
  database.open( function( err, client ) {
    if( err ) return callback(err);
    callback(null,client)
  })
}


This utility code connects to the mongodb database. The || idiom is used to provide defaults for the options. The auto_reconnect setting instructs the driver to attempt it reconnect to the database if the connection goes down.

5. Create the file lib/db-test.js and insert the code on the next page.
This code connects to your running mongodb database, and executes a query every second.
The contents of the color collection are queried. To perform the query, a �collection� object is obtained from the database, and then a �find� is run against the collection. This returns a cursor object that is converted to an array with the toArray convenience method. Each document is then printed.
An error handler function �err� is provided to factor out the common error-handling code.



var dbutil = require('./db-util')


var client

function err(win) {
  return function( err, data ) {
    if( err) {
      console.log(err);
    }
    else if( win ) {
      win( data )
    }
  }
}


function query() {
  client.collection('color',err(function(color) {
    color.find( {}, {}, err(function( cursor ) {
      cursor.toArray( err(function( docs ) {
        console.log( '\n'+new Date() )
        docs.forEach(function(doc){
          console.log(JSON.stringify(doc))
        })
      }))
    }))
  }))
}


function init() {
  dbutil.connect(
    {
      name:   'lab05'
    },
    function(err,db_client){
      if( err ) return console.log(err);

      client = db_client
      setInterval(query,1000)
    }
  )
}


init()





6. Start the db-test.js script from the lab05 folder:
node node/lib/db-test.js

You should see output similar to:
Tue Feb 14 2012 15:59:49 GMT+0000 (GMT)
{"_id":"4f3a3fca0b74e3768d4801cb","b":0,"g":0,"name":"red","r":255}
{"_id":"4f3a418b0b74e3768d4801cc","name":"white","r":255,"g":255,"b":255}
{"_id":"4f3a467e199668116a823444","name":"green","r":0,"b":0,"g":255}
{"_id":"4f3a468f199668116a823445","name":"blue","r":0,"g":0,"b":255}

Tue Feb 14 2012 15:59:50 GMT+0000 (GMT)
{"_id":"4f3a3fca0b74e3768d4801cb","b":0,"g":0,"name":"red","r":255}
{"_id":"4f3a418b0b74e3768d4801cc","name":"white","r":255,"g":255,"b":255}
{"_id":"4f3a467e199668116a823444","name":"green","r":0,"b":0,"g":255}
{"_id":"4f3a468f199668116a823445","name":"blue","r":0,"g":0,"b":255}

Tue Feb 14 2012 15:59:51 GMT+0000 (GMT)
{"_id":"4f3a3fca0b74e3768d4801cb","b":0,"g":0,"name":"red","r":255}
{"_id":"4f3a418b0b74e3768d4801cc","name":"white","r":255,"g":255,"b":255}
{"_id":"4f3a467e199668116a823444","name":"green","r":0,"b":0,"g":255}
{"_id":"4f3a468f199668116a823445","name":"blue","r":0,"g":0,"b":255}

Leave the script running, and try stopping and starting the mongodb database. Because you used the auto_reconnect setting, the script does crash, and just waits for the database to become available again before continuing.






Using MongoHQ.com
Running your own MongoDB cluster requires a significant amount of system administration work. You can outsource this to the cloud by using a MongoDB hosting provider.
The provider http://mongohq.com offers free 16MB test databases that you can use to complete this exercise.

1. Open mongohq.com in your browser and create a free account. Click the �Sign Up� link at the top right. In addition to your user account, you will need to choose a secure default database username (e.g. admin) and password (e.g random letters). Make a note of these.

2. You will then be asked to enter Credit Card details � DO NOT DO THIS!
Simply click the �skip this and use a free database� link at the bottom of the form:


3. Click the My Databases link, and then click the �create one� link:
4. Choose the Free Database option

and specify the database name as lab05 in the �Name of Database: field:


5. You will be shown the main administration panel for your database:

6. Click the Database Users tab, and create a new user with username: test and password: mwd05

7. Go to the command line, and connect to your new database:
> mongo flame.mongohq.com:27107/lab05 -u test -pmwd05
MongoDB shell version: 1.8.0
connecting to: flame.mongohq.com:27107/lab05
NOTE: the database server name and port number may be different � check the details shown in step 5.

8. Insert some test data:
> db.color.insert({name:'red'})
> db.color.insert({name:'green'})
> db.color.insert({name:'blue'})
> db.color.find()
{ "_id" : ObjectId("4f3a86f260235c706f6001e7"), "name" : "red" }
{ "_id" : ObjectId("4f3a86f960235c706f6001e8"), "name" : "green" }
{ "_id" : ObjectId("4f3a86fd60235c706f6001e9"), "name" : "blue" }
> 
The response will be slower than your local database.
9. Go back to the mongohq.com website. Click the My Database link at the top. Select your database form the list:

And you will see the list of collections in your database:



10. Click on the �color� collection and you view and query its contents:


11. Copy the node/lib/db-util.js file to node/lib/db-auth.js. Amend the connect function to support usernames and passwords:
  database.open( function( err, client ) {
    if( err ) return callback(err);

    client.authenticate(options.username,options.password,function(err){
      if( err ) return callback(err);

      callback(null,client)
    })
  })


12. Update the db-test.js script to pass in the required options to connect to the remote mongohq.com database:
var dbutil = require('./db-auth')

...


function init() {
  dbutil.connect(
    {
      name:     'lab05',

      server:   'flame.mongohq.com',
      port:     27107,
      username: 'test',
      password: 'mwd05'
    },
    function(err,db_client){
      if( err ) return console.log(err);

      client = db_client
      setInterval(query,1000)
    }
  )
}



13. Run the db-test.js script as before:
node node/lib/db-test.js
You should see output similar to 
Tue Feb 14 2012 16:11:33 GMT+0000 (GMT)
{"_id":"4f3a86f260235c706f6001e7","name":"red"}
{"_id":"4f3a86f960235c706f6001e8","name":"green"}
{"_id":"4f3a86fd60235c706f6001e9","name":"blue"}

Tue Feb 14 2012 16:11:34 GMT+0000 (GMT)
{"_id":"4f3a86f260235c706f6001e7","name":"red"}
{"_id":"4f3a86f960235c706f6001e8","name":"green"}
{"_id":"4f3a86fd60235c706f6001e9","name":"blue"}


 
