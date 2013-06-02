Note: download connect module from this link(npm install git://github.com/senchalabs/connect.git#1.8.6
), becuase this is compatible with this lab.  

Mobile Web Development
Lab 01
11 Sep 2012
Richard Rodger
richard.rodger@nearform.com


Objectives
?	Be able to use the Safari web browser for HTML5 app development
?	Understand how to locate and use HTML5 resources
?	Be able to build a simple mobile web app
?	Be able to install and use the nginx web server
?	Be able to install and use the Node.js JavaScript server
?	Build the client and server parts of a simple mobile web app
?	Demonstrate the use of functional programming techniques within a JavaScript context




 
Table of Contents 
Objectives	1
Developing with Safari	2
Simple Mobile Web App	7
Using The nginx Web Server	9
Using Node.js	11
A Client and Server-side App	13
Functional JavaScript	16 

Developing with Safari

Choose a top level project folder for your work. Create a folder called lab01. All the files and folders in this lab should be created within the lab01 folder.

Visit http://www.apple.com/safari and click the Download button.
Run the installer package.

Run Safari and open the Preferences menu. Select the Advanced tab and click the Developer menu checkbox. A top level menu named Develop is now available. On any website, select the Web Inspector menu item to open the developer toolkit. 

Create a simple app to explore the debugging features:
1. Create a file called safari.html in your lab01 folder.
2. Insert the following HTML code and save:
<!DOCTYPE html> 
<html> 
<head> 
  <script src="safari.js"></script>
</head> 
<body>
  <div id="content">Hello!</div>
</body>
</html>

3. Create a file called safari.js in your lab01 folder
4. Insert the following JavaScript code and save:
var contentElement


function changeColor() {
  var color = localStorage.contentColor || '#ccf'
  contentElement.style.backgroundColor = color
}


window.onload = function() {
  console.log('starting...')

  contentElement = document.getElementById("content")
  contentElement.innerText = 'Goodbye!'
}

5. In the Safari browser, open the file safari.html using the File/Open File menu item. You should see a blank page containing the text “Goodbye!”
6. Open the Web Inspector, and click on the Elements tab.
7. Click on the magnifying glass icon (third on the bottom left), and then click on “Goodbye!”. The elements tab will show you the properties of the div element, as shown below: 
Experiment with the controls in this tab to see how they can give you useful information about the Document Object Model (DOM). This tab always shows the current DOM, which may be different from the original HTML page if you have modified it.
8. Open the Network tab. This shows the network requests (in this case they are local file requests) that your app performs. This is very useful for debugging AJAX activity. Clicking on an item will show you the request and response text exchanged with the server, including HTTP headers.
9. Open the Scripts Tab. This shows the code of any scripts running in the page. Enable debugging if requested. You can use this tab much the same as any debugger to set breakpoints, step through code and view stack traces. To set a breakpoint, click on the line number and reload the page. Your code will stop at the breakpoint, and you can then use the controls on the right to continue, as shown below:
In this example, the code has stopped at line 15, just before the content text is changed from “Hello!” to “Goodbye!”. Click the “step into” or “step over” icons (2nd and 3rd on the right) to execute this line. Click “pause/run” icon (1st on the right) to start the code running again. 
Experiment with the other controls in the tab to see the information you can obtain when debugging.

10. Open the Console tab. This lets you run JavaScript code in the context of your running app. The
console.log('starting...')
line in safari.js has already printed some output, The log method of the inbuilt console object can be used for printing debugging output, and can also print out complex objects in a clickable tree format.
Enter some code:
contentElement
This prints the value of the contentElement variable, which happens to be a DOM element, so it shows you the HTML of that element.
contentElement.innerText = 'Changed from the console'
This code uses the DOM API to change the text content of the element. The change is immediate.
localStorage.contentColor
This prints the string value store under the contentColor key in the HTML5 localStorage key-value database. Initially this value does not exist, so the property value is undefined.
changeColor()
Execute the changeColor function that you defined in safari.js. This changes the background color of the content div to the value specified by the localStorage.contentColor value. If this value is undefined,   changeColor uses light blue as a default color. This first time you run this function, the background of the content div will turn light blue.
localStorage.contentColor = '#fcc'
Set the contentColor value to red. This stores the value permanently in localStorage, and the value will survive browser restarts. Run changeColor again, and inspect localStorage.contentColor again. This time the background is light red, and the stored value is '#fcc'.

11. Open the Resources Tab. This allows you to view all the resources that construct the Page. Open the Local Storage / Local Files item to see the contentColor entry, as below:




12. Experiment with the other tabs. The Web Inspector is extremely useful for debugging your apps, and will reward time spent learning how to use it. For more details, read:
http://developer.apple.com/library/safari/#documentation/AppleApplications/Conceptual/Safari_Developer_Guide/1Introduction/Introduction.html













Simple Mobile Web App
1. Create a new subfolder called view in your lab01 folder. 
2. Create a new file called view.html in your lab01/view subfolder. 
3. Insert the following HTML in the view.html file:

<!DOCTYPE html> 
<html> 
<head> 
  <meta name="viewport" 
    content="user-scalable=no,initial-scale=1.0,maximum-scale=1.0" />

  <style>
    body { margin: 0px; }
    #tapper { 
      margin: 10px;
      width: 300px;
      height: 300px;
      background-color: #f00; 
    }
  </style>
  
  <script>
    function hex() {
      var hexchars = "0123456789abcedf";
      var hexval = Math.floor(16 * Math.random());
      return hexchars[hexval];
    }
    window.onload = function() {
      var tapper = document.getElementById("tapper")
      tapper.onclick = function() {
        tapper.style.backgroundColor = "#"+hex()+hex()+hex();
      }
    }
  </script>
</head> 
<body>
<div id="tapper"></div>
</body>
</html>

4. Open the view.html file in your desktop Safari browser. You should see 300-by-300–pixel square, filled with a random color, as shown below:


5. Click the square several times and verify that the color changes to another random color each time you click.




Using The nginx Web Server
Visit http://nginx.org for full documentation.

Installing nginx on a Mac
To install nginx on a Mac, you need to use the MacPorts installer system. Visit http://www.macports.org
Once installed, run in a terminal:
sudo port -d selfupdate
sudo port install nginx

Installing nginx on Windows
The nginx website makes Windows binaries available for download. Click on the downloads link.

Installing nginx on Linux
Use the built-in package manager:
sudo apt-get install nginx

To start nginx on your Mac or Windows machine, you go to the command line (on Windows you need to cd to the folder containing nginx) and run this command:
nginx

To stop nginx, you use the following command:
nginx -s stop

On Linux, the commands are slightly different. This is the start command:
sudo /etc/init.d/nginx start

And this is the stop command:
sudo /etc/init.d/nginx stop 

To verify that nginx has started, open http://localhost in your Safari. You should see the text “Welcome to nginx!”.

To use nginx for development, you need to modify the configuration to serve files from your project folder. The configuration file is called nginx.conf and is located in different places depending on your operating system:
Mac: /opt/local/etc/nginx/nginx.conf
Windows: nginx-install-folder/conf/nginx.conf
Linux: /etc/nginx/sites-enabled/default

Add the following server configuration. This configuration will serve files from your project folder, and proxy requests starting with /api to a local Node.js server listening on port 8180.

Requests are logged to /var/log/127.access.log – create the /var/log folder if necessary.
Refer to the nginx documentation for more details on configuration options.

    server {
	   listen      80;
        server_name  127.0.0.1;

        access_log  /var/log/nginx/127.access.log  main;

        location / {
            root   "...your/project/folder/...";
            index  index.html;
        }

        location /api/ {
            proxy_pass http://127.0.0.1:8180/api/;
        }
    }

Restart nginx. Visit http://127.0.0.1/lab01/view.html in Safari. The view.html example from the previous section should appear.

Using Your Phone
To access the server from a physical device such as iPhone or Android mobile, determine your local network address using either the ifconfig (Mac, Linux) or ipconfig (Windows) commands. This will normally be an IP address beginning with 192.168. You will need to be on a WiFi network.
Replace 127.0.0.1 with this IP address (e.g. 192.168.0.2) in your nginx configuration, and stop and start nginx. Test the new IP address in Safari on your desktop machine:
http://192.168.0.2/lab01/view.html
Now load the view.html example on your device using the same URL.








Using Node.js
Visit http://nodejs.org and click the download link. Follow the installer instructions.

To test that your installation is working, in a terminal, run:
node -v
This should output the version number, for example: v0.6.7

To run interactively, just run node itself:
node
You can now type and run JavaScript code:
> var foo = "bar"
> foo
'bar'
> console.log('baz'+foo)
bazbar

Run the standard example HTTP server. Create a file called server.js in your lab01 folder, and insert:
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');

Then start the server with:
node server.js

Open http://127.0.0.1:1337 in Safari, you should see the text “Hello World”

Using the connect module
1. Install the connect module by running, in the lab01 folder:
npm install connect 1.8.5

NOTE: VERSION 1.8.5 IS REQUIRED
This downloads the connect module code from the http://npmjs.org repository, so you will need a network connection.
You should see output like the following:
connect@1.8.5 ./node_modules/connect 
+-- mime@1.2.4
+-- qs@0.4.0
+-- formidable@1.0.8

2. Create a file called simple.js in the lab01 folder. Insert the following code:
var connect = require('connect')

var api = {}
api.ping = function( req, res ) {
  var output = {ok:true,time:new Date()}
  res.writeHead(200,{
    'Content-Type': 'application/json'
  })
  res.end( JSON.stringify( output ) )
}

var server = connect.createServer()
server.use( connect.logger() )

server.use( connect.router( function( app ) {
  app.get('/api/ping', api.ping)
}))

server.listen(8180)

3. Run the simple.js server with
node simple.js

4. Verify that it is working by opening http://127.0.0.1:8180/api/ping in Safari. You should see output like:
{"ok":true,"time":"2012-01-16T15:41:02.724Z"}

5. Verify that nginx proxying is working by opening http://127.0.0.1/api/ping in Safari. You should see the same result as step 4.

6. You can stop the server pressing Control-C.


A Client and Server-side App
This example shows an app with client and server-side JavaScript code. The app returns quotes from either Richard Feynman or Albert Einstein, depending on which button the user clicks (or taps).

1. Create a file called quotations.html in your lab01 folder. Insert the following code:
<!DOCTYPE html> 
<html> 
<head> 
  <meta name="viewport" content="user-scalable=no,initial-scale=1.0,maximum-scale=1.0" />

  <style>
    a { 
      display: inline-block; 
      border: 2px solid black; 
      border-radius: 5px;
      padding: 10px;
      text-decoration: none;
      font-family: arial;
    }
  </style>

  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js">
  </script>

  <script>
    window.onload = function() {
      var elem = {}
      $('p').each(function(){
        var id = $(this).attr('id')
        elem[id] = $(this)
      })

      $('a').click(function(){
        var who = $(this).attr('id')
        $.getJSON('/api/quote/'+who, function(data) {
          elem.who.text(who)
          elem.quote.text( data.text )
        })
      })
    }
  </script>
</head> 
<body>
  <p>
    Get a quote from:<br />
    <a href="#" id="feynman">Feynman</a>
    or
    <a  href="#" id="einstein">Einstein</a>
  </p>
  <p id="quote"></p>
  <p id="who"></p>

</body>
</html>


2. Create a file called quotations.js in your lab01 folder, and insert the following code:

var connect = require('connect')

var whomap = {
  feynman: [
    "On the infrequent occasions when I have been called upon in a formal place to play the bongo drums, the introducer never seems to find it necessary to mention that I also do theoretical physics.",
    "For a successful technology, reality must take precedence over public relations, for nature cannot be fooled.",
    "If I could explain it to the average person, it wouldn't have been worth the Nobel Prize."
  ],
  einstein: [
    "As far as the laws of mathematics refer to reality, they are not certain; and as far as they are certain, they do not refer to reality.",
    "Do not worry about your difficulties in Mathematics. I can assure you mine are still greater.",
    "The most incomprehensible thing about the world is that it is at all comprehensible."
  ]
}

var index = 0

var api = {}
api.quote = function( req, res ) {
  var who = req.params.who
  who = whomap[who] ? who : 'feynman'

  var output = {text:whomap[who][index]}
  index = (index + 1) % 3 

  res.writeHead(200,{
    'Content-Type': 'application/json'
  })
  res.end( JSON.stringify( output ) )
}

var server = connect.createServer()
server.use( connect.logger() )

server.use( connect.router( function( app ) {
  app.get('/api/quote/:who?', api.quote)
}))

server.listen(8180)


3. Ensure that you have the connect Node module installed by running the command:
npm install connect

4. Run the server:
node quotations.js
Ensure that you have stopped any other Node servers that may be running and occupying port 8180.

5. Test the Node server using the by opening the API URLs in Safari:
http://127.0.0.1:8180/api/quote/einstein
and
http://127.0.0.1:8180/api/quote/feynman
You should see JSON formatted results like:
{"text":"The most incomprehensible thing about the world is that it is at all comprehensible."}
6. Open the app in Safari:
http://127.0.0.1/lab01/quotations.html
OR, if are using a local network address (as per the nginx section above):
http://192.168.X.Y/lab01/quotations.html
You should the following simple interface:

Click on either button to load a quotation. Use the Web Inspector to step through the code, and also to observe the request/response activity against the /api/quote/:who? end point
7. Open the app on your physical device using the 192.168 version of the URL. Tap on the buttons to get new quotes.

Functional JavaScript

Definition style
Callbacks
dynamic
recursion
scope
closure
chaining
currying
memoization
apply


lambda
function x(i) { return i+'*' }
zero(x)('')






 
