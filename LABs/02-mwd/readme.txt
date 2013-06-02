
Mobile Web Development
Lab 02
18 Sep 2012
Richard Rodger
richard.rodger@nearform.com




Objectives
?	Use the touchstart, touchmove and touchend events in a simple app
?	Have a basic understanding HTML5 canvas element and its API
?	Be able to structure app code for easier interactive debugging
?	Be able to interact with app functionality via the debug console in order to perform ad hoc testing during development
?	Enable and use the in-built debug console provided by iPhone and Android devices
?	Be able to configure and use the weinre remote debugger for on-device console access
?	Be able to remotely inspect and control an on-device web app remotely from a developer desktop
?	Build an app using the jQueryMobile framework, using boilerplate code
?	Understand the basic jQueryMobile API with respect to touch events and declarative layout
?	Be able to install a web app as a home screen book mark




 
Table of Contents 
Objectives	1
Directions For Lab Work	3
Using Touch Events	4
Remote Debugging	9
Using jQuery Mobile	15 


Directions For Lab Work
The approach introduced in the previous lab will be used throughout the course:
?	Choose a top level folder to contain all your work
?	The work for each lab should be placed within a subfolder called labXX
?	For example, the folder for this lab should be lab02
?	Use the desktop Safari browser and the Safari Web Inspector as your primary development environment
?	Serve your apps from your local machine for testing using the nginx web server, as per the instructions in lab01. Use nginx even when testing from desktop Safari. This ensures that AJAX requests will function correctly as you will avoid cross-domain browser restrictions.
?	Proxy AJAX requests via nginx to a local Node.js server that you run from the command line. 

Ensure that you have completed all the tasks in lab01 before proceeding, as this and future labs will assume a correctly configured and working environment.
All labs assume a basic level of experience with the command line.


Using Touch Events

Create a simple HTML canvas drawing app to demonstrate the use of touch events.

1. Create a file called draw.html in your lab02 folder.
2. Insert the following HTML code and save:
<!DOCTYPE html> 
<html> 
<head> 
  <meta name="viewport" content="user-scalable=no,initial-scale=1.0,maximum-scale=1.0" />

  <style>
  body { padding:10px; margin:0px; background-color: #ccc; }
  #main { margin: 0px; }
  </style>
  
  <script src="draw.js"></script>
</head> 
<body>
<button id="clear">clear</button><br><br>
<canvas id="main" width="300" height="300"></canvas>
</body>
</html>

3. Create a file called draw.js in your lab02 folder
4. Insert the following JavaScript code and save:

// prevent browser-based scrolling
document.ontouchmove = function(e){ e.preventDefault() }


// singleton object to contain app
var app = {}


app.init = function() {
  console.log('start init')

  // private 

  var canvas  = document.getElementById('main')
  var canvastop  = canvas.offsetTop
  var canvasleft = canvas.offsetLeft

  var context = canvas.getContext("2d")

  var lastx
  var lasty
  var drawing

  context.strokeStyle = "#000000"
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.lineWidth = 5


  // detect touch interface
  var hastouch = 'ontouchstart' in document


  // enable desktop browser testing
  var eventnames = {
    touchstart: hastouch ? 'ontouchstart' : 'onmousedown',
    touchmove:  hastouch ? 'ontouchmove'  : 'onmousemove',
    touchend:   hastouch ? 'ontouchend'   : 'onmouseup',
  }

  function clientpos(axis) {
    return function(event) {
      return ( hastouch ? event.touches[0] : event )['client'+axis]
    }
  }
  var clientX = clientpos('X')
  var clientY = clientpos('Y')



  // public

  app.clear = function() {
    context.fillStyle = "#ffffff"
    context.rect(0, 0, 300, 300)
    context.fill()
  }


  app.dot = function(x,y) {
    context.beginPath()
    context.fillStyle = "#000000"
    context.arc(x,y,1,0,Math.PI*2,true)
    context.fill()
    context.stroke()
    context.closePath()
  }


  app.line = function(fromx,fromy, tox,toy) {
    context.beginPath()
    context.moveTo(fromx, fromy)
    context.lineTo(tox, toy)
    context.stroke()
    context.closePath()
  }


  app.drawstart = function(event) {                   
    event.preventDefault() 
    drawing = true
                    
    lastx = clientX(event) - canvasleft
    lasty = clientY(event) - canvastop

    app.dot(lastx,lasty)
  }
  canvas[eventnames.touchstart] = app.drawstart


  app.drawmove = function(event){                   
    event.preventDefault()                 

    if( !drawing ) return;

    var newx = clientX(event) - canvasleft
    var newy = clientY(event) - canvastop

    app.line(lastx,lasty, newx,newy)
    
    lastx = newx
    lasty = newy
  }
  canvas[eventnames.touchmove] = app.drawmove


  app.drawend = function(event) { 
    event.preventDefault()                   
    drawing = false
  }
  canvas[eventnames.touchend] = app.drawend


  var clearButton = document.getElementById('clear')
  clearButton[eventnames.touchend] = app.clear

  app.clear()
  console.log('end init')
}


window.onload = function() {
  app.init()
}




5. In the Safari browser, open http://127.0.0.1/lab02/draw.html. You should see a white 300 by 300 pixel square that you can draw on, as shown below:

6. Open the Web Inspector, and click on the Console tab.
You should see the output of the two logging lines:
start init
end init

Because the app is contained within an object, app, you can call methods on this object to test the app directly. For example:
app.dot(10,10)
app.line(10,10,90,90)

These methods calls draw a dot and line on the canvas, like so:

By placing your primary functionality into the public methods of an app object, and by separating this functionality from the user interface logic, you can easily test your app. This is especially useful for remote debugging.


Remote Debugging
When running your app from Safari on the iPhone or iPhone simulator (you must install Xcode first – this will be introduced in a later lab), you can enable the logging console, and view your logging output from console.log calls. This is not a full console, you cannot execute JavaScript code, but you can see the logging output.
To enable the log, open the Settings app, tap the Safari item, scroll to the bottom, tap the Developer item, and enable the Debug Console option. You will then see a Debug Console bar across the top of the web app page. Tap the bar to view the log messages. This is show in the series of iPhone screens below:






On Android, you can access the console by using the special URL about:debug. First open your app in the Android web browser. Then change the URL to about:debug. Your app will reload with a bar across the top labelled “JavaScript console”. Tap this to open the console. This is shown below:


While observing the debugging console is useful, you can also make use of third party tools to obtain a Web Inspector-style debugging experience.

Visit http://phonegap.github.com/weinre/ to download and install the WEb INspector REmote (weinre) utility (pronounced wine-ary, like binary). This is a local Java web server that gives you access to your app running on a device. The weinre site provides installation and running instructions.

To use weinre, insert the following script tag at the bottom of your page. This ensures that weinre will function correctly, by deferring it's execution until the page has fully loaded. Note that weinre sometimes becomes “stuck” and refuses to function properly. In this case you may need to restart the Java application, and your reload your app.
<script src="http://192.168.100.111:8080/target/target-script-min.js#anonymous"></script>

Replace the IP address with your own. Start weinre, and reload your app on your iPhone or Android device (or the simulator/emulators). You should see your app appear under the Targets heading, like so:

Click the Elements tab to view the DOM structure of your app. This interface is the same as the Safari Web Inspector (in fact, it is the same open source code!). The Elements tab is shown below:

Click on the Console tab. Weinre does not always capture all log output, especially initial logs printed at startup. However subsequent logs generated by console.log while your app is running are usually captured reliably. To see this, use the console to run app.init() again. You will see the init start and init end log entries.
You can control the app on your device just the same as if it were on your local machine. Try the usual commands:
app.dot(10,10)
app.line(10,10,90,90)

You will see the app on your device updating.

The major limitation of weinre is that it does not support traditional step-debugging of JavaScript source code. This is due to it's pure client-side JavaScript implementation.

It is possible to use a debugger in the same way, but deployment and configuration is considerably more complex. And of course, Node.js makes an appearance in the solution.
As an advanced exercise (after completing this lab!), install, configure, and use: https://github.com/lexandera/Aardwolf







Using jQuery Mobile
The lab files include version 1.0 of jQuery Mobile and supporting files. You can download the latest version from http://jquerymobile.com 
In this exercise, you will create simple To-Do list application that builds its user interface using jQuery Mobile, and stores the To-Do item data using localStorage.
As above, the app logic will live inside and app object, can you can call the methods of this object directly from the console to test the app.

1. Create a file called todo.html in your lab02 folder.
2. Insert the following HTML code and save:
<!DOCTYPE html> 
<html> 
<head> 
  <title>To Do App</title> 
  <meta name="viewport" content="user-scalable=no,initial-scale=1.0,maximum-scale=1.0" />
  <meta name="apple-mobile-web-app-capable" content="yes" /> 

  <link rel="stylesheet" href="jquery.mobile.css" />
  <link rel="stylesheet" href="todo.css" />

  <script src="jquery.js"></script>
  <script src="jquery.mobile.js"></script>
  <script src="todo.js"></script>
</head> 
<body> 

<div id="main" data-role="page">

  <div data-role="header" data-position="fixed">
    <h1>To Do List</h1>
    <a id="add" data-icon="plus" class="ui-btn-right">Add</a>
    <a id="cancel" data-icon="delete" class="ui-btn-right">Cancel</a>
  </div>

  <div data-role="content">	
    <div id="newitem">
      <input type="text" id="text" placeholder="Enter To Do item"/>
      <a id="save" data-role="button" data-inline="true" data-icon='plus'>Save</a>
    </div>	

    <ul id="todolist" data-role="listview">
    </ul>

  </div>

</div>


<div id="tm">

  <li id="item_tm">
    <span class="check">&nbsp;</span>
    <span class="text"></span>
  </li>

  <div id="delete_tm" class="delete">Delete</div>

</div>

</body>
</html>


The data-* attributes are used by jQueryMobile to construct the user interface. These attributes provide a declarative means of specifying the user interface.
While this is mostly standard boilerplate, the apple-mobile-web-app-capable means that if you install this on your iphone home screen, using the safari sharing icon, then the app will launch without the safari user interface, giving the appearance of being a native app.

3. Create a file called todo.css in your lab02 folder.
4. Insert the following CSS code and save:
#cancel {
  display: none;
}

#newitem {
  display: none;
  height: 90px;
}

#item_tm {
  display: none;
}

#save {
  font-size: 8pt;
}

#text {
  font-size: 8pt;
}

div.delete {
  display: none;
  font-size: 8pt;
  float: right;
  border: 1px solid #900;
  border-radius: 5px;
  padding: 5px;
  color: white;
  background: -webkit-gradient(
    linear,
    left bottom,
    left top,
    color-stop(0.18, rgb(173,0,0)),
    color-stop(0.57, rgb(250,120,120))
  );
}

span.check {
  border: 2px solid #333; 
  line-height: 20px; 
  font-size: 20px;
  width: 20px; 
  height:20px;
  display: inline-block;
  margin-right: 10px;
}


This is mostly standard CSS. The only thing of interest is the use of a gradient to provide background shading for the delete button (div.delete).

3. Create a file called todo.js in your lab02 folder.
4. Insert the following JavaScript code and save:

function pd( func ) {
  return function( event ) {
    event.preventDefault()
    func && func(event)
  }
}

document.ontouchmove = pd()



var app = {}

app.init = function() {
  console.log('start init')

  var items = []
  var saveon = false
  var swipeon = false

  
  var elem = {
    text: $('#text'),
    save: $('#save'),
    add: $('#add'),
    cancel: $('#cancel'),
    todolist: $('#todolist'),
    newitem: $('#newitem'),
    item_tm: $('#item_tm'),
    delete_tm: $('#delete_tm')
  }


  app.items = function() {
    return items
  }


  app.activatesave = function() {
    var textlen = elem.text.val().length
    if( !saveon && 0 < textlen ) {
      elem.save.css('opacity',1)
      saveon = true
    }
    else if( 0 == textlen ) {
      elem.save.css('opacity',0.3)
      saveon = false
    }
  }


  app.markitem = function( item, done ) {
    item.find('span.check').html( done ? '&#10003;' : '&nbsp;' )
    item.find('span.text').css({'text-decoration': done ? 'line-through' : 'none' })
    app.saveitems(items)
  }


  app.saveitems = function(items) {
    localStorage.items = JSON.stringify(items)
  }

  app.loaditems = function() {
    return JSON.parse(localStorage.items || '[]')
  }


  app.addaction = function() {
    elem.add.hide()
    elem.cancel.show()
    elem.newitem.slideDown()
    saveon = false
    app.activatesave()
  }

  app.cancelaction = function() {
    elem.add.show()
    elem.cancel.hide()
    elem.newitem.slideUp()
    $('div.delete').hide()
    swipeon = false
  }

  app.saveaction = function() {
    var text = elem.text.val()
    if( 0 == text.length ) {
      return
    }
    elem.text.val('').blur()

    var id = new Date().getTime()
    var itemdata = {id:id,text:text,done:false} 
    items.push(itemdata)
    app.additem(itemdata)

    elem.newitem.slideUp()
    elem.add.show()
    elem.cancel.hide()

    app.saveitems(items)
  }


  elem.add.tap( pd(app.addaction) )
  elem.cancel.tap( pd(app.cancelaction) )
  elem.save.tap( pd(app.saveaction) )

  elem.text.keyup( app.activatesave )


  app.additem = function(itemdata) {
    var item = elem.item_tm.clone()
    item.attr({id:itemdata.id})
    item.find('span.text').text(itemdata.text)

    var delbutton = elem.delete_tm.clone().hide()
    item.append(delbutton)

    itemdata.delaction = function(){
      for( var i = 0; i < items.length; i++ ) {
        if( itemdata.id == items[i].id ) {
          items.splice(i,1)
        }
      }
      item.remove()
      elem.add.show()
      elem.cancel.hide()
      app.saveitems(items)
      return false
    }

    delbutton.attr('id','delete_'+itemdata.id).tap( pd(itemdata.delaction) )


    app.markitem(item,itemdata.done)
    item.data('itemdata',itemdata)


    itemdata.tapaction = function(){
      if( !swipeon ) {
        var itemdata = item.data('itemdata')
        app.markitem(item,itemdata.done = !itemdata.done)
      }
    }

    item.tap( pd(itemdata.tapaction) )


    itemdata.swipeaction = function(){
      var itemdata = item.data('itemdata')

      if( !swipeon ) {
        $('#delete_'+itemdata.id).show()
        elem.add.hide()
        elem.cancel.show()
        swipeon = true
      }
      else {
        elem.add.show()
        elem.cancel.hide()
        $('div.delete').hide()
        swipeon = false
      }
    }

    item.swipe( pd(itemdata.swipeaction) )


    elem.todolist.append(item).listview('refresh')
  }


  items = app.loaditems()
  for( var i = 0; i < items.length; i++ ) {
    app.additem(items[i])
  }

  console.log('end init')
}

$(app.init)




7. Open the app in your desktop Safari: http://192.168.100.111/lab02/todo.html. As always, insert your own IP address. You should see an empty page with a header at the top, as below:
 
8. Add some To-Do items by clicking the Add button. Enter some text for each item and click Save. Click on some of the items to mark them as done:

9. Delete some items by swiping along the item. On desktop Safari, you can simulate a swipe by holding the mouse button down and move quickly left or right along the item. A Delete button appears. You can click Cancel, or swipe again, to remove the Delete button:


10. Open the app on your iPhone or Android device. Verify that the operations also work correctly via touch.

11. Return to desktop Safari. Open the Web Inspector, click the Console tab, and test some of the app methods:

app.addaction()
app.cancelaction()

You should see the add item text field and save button appear and disappear, as it you had clicked the Add and Cancel buttons.

12. Delete an item via the console. Use the app.items() method to get the list of items, and then call the delaction method on a random item:
var items = app.items()
items
items[2].delaction()
 
13. Use the weinre tool to perform the same actions on your mobile device.

14. Install the app on your home screen by using the sharing function. Shown below is the procedure for both iPhone and Android (using http://startupdeathclock.com as an example).

iPhone: tap the central icon on the bottom Safari toolbar: 



Android: Tap the bookmark icon beside the URL address bar:






Tap on the installed icon to launch the app. 
