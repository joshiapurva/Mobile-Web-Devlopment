
Mobile Web Development
Lab 07
06 Nov 2012
Richard Rodger
richard.rodger@nearform.com




Objectives
?	Using the HTML5 Location API
?	Understanding the limitations of device location
?	Determining the device display orientation in a cross platform manner
?	Configuring web apps for installation on the device home screen
?	Implementing a conventional tab bar layout
?	… using the jQuery Mobile library
?	… using the iScroll library
?	Animating page transitions using CSS3 transforms



 
Table of Contents 
Objectives	1
Directions For Lab Work	3
HTML5 Location API	4
Device Orientation	9
Home Screen Bookmarking	11
Tab Bar Interface	15
The jQuery Mobile Solution	15
The iScroll Solution	18
Sliding Page Transitions	25 


Directions For Lab Work
The approach introduced in the previous lab will be used throughout the course:
?	Choose a top level folder to contain all your work
?	The work for each lab should be placed within a subfolder called labXX, where XX is the zero-padded lab number
?	Use the desktop Safari browser and the Safari Web Inspector as your primary development environment
?	Serve your apps from your local machine for testing using the nginx web server, as per the instructions in lab01. Use nginx even when testing from desktop Safari. This ensures that AJAX requests will function correctly as you will avoid cross-domain browser restrictions.
?	Proxy AJAX requests via nginx to a local Node.js server that you run from the command line. 

Ensure that you have completed all the tasks in lab01 before proceeding, as this and future labs will assume a correctly configured and working environment.
All labs assume a basic level of experience with the command line.
This lab assumes you have completed the tasks in all previous labs.

This lab returns to client-side development work. As before, you should have a correctly configured nginx setup, as per lab01, so that you can run the examples properly. Your document document root should be your project folder, containing a lab07 subfolder. All files within this folder can then be accessed via URLs of the form http://127.0.0.1/lab01/filename.html
Replace 127.0.0.1 with the IP address of your development machine on the WiFi network when testing from your phone.






HTML5 Location API
The HTML5 Geolocation API tells you the current position of the user's device,  and also lets you track the user's location in real time. Normally, the device will present a pop-up asking for the user's permission.
To use the Geolocation API, you call functions on the navigator.geolocation in-built object. To get a fix on the current position, call the getCurrentPosition function. This expects two function parameters that are used as call-backs. The first function is called if the device position can be determined, and gives you the latitude and longitude values of the current position. You can use the latitude and longitude values with services such as Google Maps to show a map to the user. The second function is called if the current position cannot be determined. 
1. Create a file called location.html in your lab07 folder. Insert:
<!DOCTYPE html><html><head>
  <title>Geolocation</title>
  <meta name="viewport" content="initial-scale=1.0" />
</head><body> 
<img id="map" />
<p id="msg"></p>
<script>
var img = document.getElementById('map');
var msg = document.getElementById('msg');
navigator.geolocation.getCurrentPosition(
  function(position){
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;
    var timestamp = new Date(position.timestamp);
    msg.innerHTML = 
      'Latitude:  '+latitude+'<br />'+
      'Longitude: '+longitude+'<br />'+
      'Timestamp: '+timestamp;
    img.src = 
      "http://maps.google.com/maps/api/staticmap?sensor=true&"+
      "center="+latitude+","+longitude+
      "&zoom=14&size=300x200&markers=color:red|"+
      latitude+","+longitude;
  },
  function(error){
    var txt;
    switch(error.code) {
      case error.PERMISSION_DENIED:    txt = 'Permission denied'; break;
      case error.POSITION_UNAVAILABLE: txt = 'Position unavailable'; break;
      case error.TIMEOUT:              txt = 'Position lookup timed out'; break;
      default: txt = 'Unknown position.'
    }
    msg.innerHTML = txt;
  }
);
</script>
</body></html>




2. The lines marked in bold are the heart of the Geolocation API. Your call-back function is invoked with a position parameter object. This position object has a coords sub-object that contains the actual latitude and longitude values in decimal degrees. A timestamp for the position lookup is also provided.
The page first ask permissions to obtain the users location:


before displaying the map:

3.  It is also possible to continuously track the user's location using the watchPosition function. This is used in exactly the same way as getCurrentPosition function. However, watchPosition will call your function every time the device position changes. You can use this to track the user in real-time. When you want to stop tracking, use the clearWatch function. The watchPosition function returns an identifier that you pass to the clearWatch function. When you watch the position in this manner, the device will usually provide a visual indication to the user that their position is being watched continuously. For example, on the iPhone, a small purple arrow appears in the top bar.
Note: this will use up the battery quickly

Device Orientation
Android and iPhone devices can be held by the user in either a portrait or a landscape orientation. In upright portrait orientation, the device is held vertically with the home button at the bottom. This is by far the most common usage scenario. In landscape orientation, the device is held horizontally on its side, and the home button can be on the left or right. Upside-down portrait orientation, where the home button is at the top, is not supported by the device browser. You can verify this for yourself by loading a web page in the device browser and turning the device upside-down. The web page will not change. In practice this limitation is  not normally a problem as it is standard device behaviour and users expect it.
1. Create a file called orientation.html in your lab07 folder. Insert:
<!DOCTYPE html>
<html>
<head>
  <title>Orientation</title>
  <meta name="viewport" content="initial-scale=1.0" />
</head>
<body>
<div id="orient"><div>
<script>
function getorientation() {
  var orientation = 'portrait';

  if( undefined != window.orientation ) {
    if( 90 == window.orientation
        || -90 == window.orientation ) 
    {
      orientation = 'landscape';
    }
  }
  else if( window.innerHeight < window.innerWidth ) {
     orientation = 'landscape';     
  }

  return orientation;
}

function orientationchanged(callback) {
  if( 'onorientationchange' in window ) {
    window.onorientationchange = function() {
      callback(getorientation());
    }
  }
  else {
    window.onresize = function() {
      callback(getorientation());
    }
  }
}

var orient = document.getElementById('orient');
orient.innerText = getorientation();

orientationchanged(function(orientation){
  orient.innerText = orientation;
});
</script>
</body></html>


2. Open the file using your device or a simulator. Change the orientation to see the text change.

3. The code above gives you a small cross-platform API for orientation. The getorientation function can be used to get the current orientation. The orientationchanged function can be called to register a callback for orientation change events. 
The window.orientation variable is set by the browser to tell you what the current orientation of the device is. The values are 0 for upright portrait, 90 for landscape with the home button on the right, and -90 for landscape with the home button on the left. Unfortunately, if you are building a cross-platform and backwardly-compatible mobile web app, you cannot rely on this variable. You have to use the window width and height to determine the orientation. The example code in this section will show you how to deal with this case.
The window.onorientationchange event hook allows you to get notifications of device orientation changes. Again, this is not fully cross-platform, so you’ll need to use the window.onresize event hook as well.


Home Screen Bookmarking
Mobile web apps can be installed as desktop icons on iPhone and Android. This exercise shows you how to do this, so you can explain it clients. You can also specify an icon and launch screen – although this is optional. If you don't specify these, a snapshot image of your app is used instead.

1. Create a file called install.html in your lab folder. Insert:
<!DOCTYPE html>
<html>
<head>
  <title>Install</title>
  <meta name="viewport" content="initial-scale=1.0" />

  <!-- retina -->
  <link rel="apple-touch-icon-precomposed" sizes="114x114" href="apple-touch-icon-114x114-precomposed.png">

  <!-- non-retina, android -->
  <link rel="apple-touch-icon-precomposed" href="apple-touch-icon-precomposed.png">

  <meta name="apple-mobile-web-app-capable" content="yes" /> 
  <meta name="apple-mobile-web-app-status-bar-style" content="default" /> 

  <link rel="apple-touch-startup-image" href="splash-320x460.png" /> 
</head>
<body>
<h1>Install</h1>
</body>
</html>

2. Create two icons, one 57x57, and one 114x114 pixels, named:
?	apple-touch-icon-114x114-precomposed.png
?	apple-touch-icon-precomposed.png
Two icon images are required to support both types of iphone screen size. The 57 is for older iphones, the 114 for higher resolution “retina” displays.

3. Also create a 320x460 splash screen to display while your app is loading. This is optional – a snapshot of your app will shown if you do not provide this. Call the file splash-320x460.png. It must be exactly 320x460 pixels in portrait orientation.

4. The other meta tags required to launch the app in full screen from the bookmark icon are:
  <meta name="apple-mobile-web-app-capable" content="yes" /> 
  <meta name="apple-mobile-web-app-status-bar-style" content="default" /> 
5. To install on your iPhone home screen, do the following:
1.	Open up the mobile web app in the mobile Safari browser: http://192.168.0.2/lab07/install.html – replacing 192.168.0.2 with the IP of your machine.
2.	Tap on the bookmark icon on the footer toolbar. The bookmark icon is the icon in the center of the toolbar. An options menu slides up from the bottom of the screen.
3.	Select the “Add to Home Screen” menu option. A simple form slides up from the bottom of the screen, showing the app icon, and providing a suggested name for the App, which you can change.
4.	Tap the Add button on the navigation bar at the top right. The page closes and you are shown one of the pages of the home screen of your iPhone. The mobile web app has been installed as an icon. 
5.	Tap the icon to launch the app.
The install steps are shown as screen shots below: 


The launch is shown below:


6. To install on your Android home screen:
1.	In the Android web browser, open http://192.168.0.2/lab07/install.html – replacing 192.168.0.2 with the IP of your machine.. 
2.	Tap the bookmark button beside the URL address bar. This opens the bookmarks page. A miniature faded version of the web app is show in one of the free slots with the word “Add” imposed over it. 
3.	Tap this free slot. A pop up appears showing the name of the app and its URL. 
4.	Tap the OK button.
5.	At this stage, you have saved the mobile web app as a bookmark. You now need to add it to the home screen. Do this by pressing and holding your finger on the app bookmark for a few seconds. This “long hold” gesture results in an option menu appearing. 
6.	Tap the “Add shortcut to Home” option. Exit from the browser. You should now see an icon representing the app on the current page of your home screen.

Tab Bar Interface
Mobile web apps built using HTML5 are usually productivity-style apps. If you go to the iPhone App Store, or the Android Marketplace, and take a look at the apps in the productivity category, you’ll notice that many of them have a tab bar at the bottom. This layout style presents the user with a row of tabs at the bottom of the screen. Tapping a tab opens up a new page of the app. Each tab corresponds to a logical grouping of app features. Most apps have between four and six tabs.
This layout style is so common that the native code libraries provide developers with pre-configured classes to build tab bars. You’ll need to do the same in HTML. This is not as simple as just positioning a tab bar at the bottom of the screen. You also need to solve a tricky problem: scrolling the content above the tab bar. The user needs to be able to scroll this content in the same way as any native app. With a one finger touch, your users should be able to flick the content up and down at high speed, and see it “rubber-band” at the start and end of the scroll.
The reason it is tricky to get this work in a mobile web app is that scrolling applies to the whole app, not just your content element. So, with one finger, the user will scroll your entire interface, including the tab bar! Not what you want. The To Do List app in the previous labs side-stepped this problem by having no tab bar at the bottom. This is not an option if your client wants one.
In a non-mobile context, the way that you make the content of an HTML element scrollable is by adding the CSS style: overflow:scroll. If you do this in a mobile context, you will make the content scrollable, but only with two fingers. This is still not right.
 There are two solutions. One, the jQuery Mobile solution, is to fade the tab bar away while you are scrolling, and fade it back in when you are done. This has the advantage of using the mobile browser’s inbuilt page scrolling, which is always going to be fast. The disadvantage is that this is not the same as native scrolling behavior. It is an acceptable solution for Android apps if you place the tab bar at the top of the screen. 
For iPhone mobile web apps another solution is required. This is where the iScroll library, which you've used already in lab03, comes into play. 
The jQuery Mobile Solution
The jQuery Mobile scrolling effect is built into the library and is thus very easy to use. By setting custom properties on the jQuery Mobile elements, you can control which elements remain in place when the user scrolls the page. 

1. Copy the jquery.js, jquery.mobile.js, jquery.mobile.css, iscroll.js files from lab03 into the lab04 folder.

2. Create a file called tabbar-jqm.css and insert the following code:   
#main {
  padding: 0px;
}

#footer {
  padding: 0px;
}
div.content {
  display:none;
}
3. Create a file called tabbar-jqm.html and insert the following code:
<!DOCTYPE html> 
<html> 
<head> 
  <title>Tab Bar App</title> 
  <meta name="viewport" content="user-scalable=no,initial-scale=1.0,maximum-scale=1.0" />
  <meta name="apple-mobile-web-app-capable" content="yes" /> 

  <link rel="stylesheet" href="jquery.mobile.css" />
  <link rel="stylesheet" href="tabbar-jqm.css" />

  <script src="jquery.js"></script>
  <script src="jquery.mobile.js"></script>
  <script src="tabbar-jqm.js"></script>

</head> 
<body> 

<div id="main" data-role="page">

  <div data-role="header" data-position="fixed">
    <h1>Tab Bar</h1>
  </div>

  <div data-role="content">	
    <div id="content_numbers" class="content scroller">
      <ul data-role="listview">
        <li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li>
        <li>8</li><li>9</li><li>10</li><li>11</li><li>12</li><li>13</li><li>14</li><li>15</li>
        <li>16</li><li>17</li><li>18</li><li>19</li><li>20</li><li>21</li><li>22</li><li>23</li>
        <li>24</li><li>25</li><li>26</li><li>27</li><li>28</li><li>29</li><li>30</li><li>31</li><li>32</li>
      </ul>
    </div>

    <div id="content_letters" class="content scroller">
      <ul data-role="listview">
        <li>a</li><li>b</li><li>c</li><li>d</li>
        <li>e</li><li>f</li><li>g</li><li>h</li>
        <li>i</li><li>j</li><li>k</li><li>l</li>
        <li>m</li><li>n</li><li>o</li><li>p</li>
        <li>q</li><li>r</li><li>s</li><li>t</li>
        <li>u</li><li>v</li><li>w</li><li>x</li>
        <li>y</li><li>z</li>
      </ul>
    </div>

    <div id="content_colors" class="content scroller">
      <ul data-role="listview">
        <li>red</li>
        <li>green</li>
        <li>blue</li>
      </ul>
    </div>
  </div>

<div id="footer" data-role="footer" class="ui-bar" data-position="fixed">
  <div data-role="navbar" class="ui-navbar">
    <ul class="ui-grid-b">
      <li><a id="tab_numbers">numbers</a></li>
      <li><a id="tab_letters">letters</a></li>
      <li><a id="tab_colors">colors</a></li>
    </ul>
  </div>
</div>

</div>


</body>
</html>

6. Create a file called tabbar-jqm.js and insert the following code:   

$(function(){
  
  function handletab(tabname) {
    return function(){
      $("div.content").hide()
      $("#content_"+tabname).show()
      $('#footer').show()
      $.mobile.fixedToolbars.show(true)
    }
  }

  $("#tab_numbers").tap(handletab('numbers')).tap()
  $("#tab_letters").tap(handletab('letters'))
  $("#tab_colors").tap(handletab('colors'))
})

7. Open the application by visiting http://192.168.0.2/lab07/tabbar-jqm.html in your mobile browser (replacing the IP as necessary). To install the example as a mobile web app, perform the home screen install procedure as described in the previous exercise.
8. Verify that you can scroll the list of items on the first page, and that the header and tab bar fade in and out when you stop and start scrolling.
9. Verify also that the tab bars function correctly. Tapping on each tab should show the content for that tab.
Explanation
The example code follows the basic HTML mobile template you have been using for all of the examples.
This example uses a single jQuery Mobile page (div id="main") to display the full user interface of the app. Separate pages are not used as that would require cutting and pasting the header and footer content for each page.
The scrolling behavior is very simple to activate. Simple add the data-position="fixed" attribute to the header and footer. Now, whenever you scroll the page, these elements re-position themselves so that they always appear at the top and bottom of the page. As it would be impossible to match the speed of the page scrolling, the elements are faded out while the scroll animates, and faded back in when it is finished.
Tapping on a tab causes the content for that tab to appear. This is done manually by attaching a click event handler to each tab. The event handler is built dynamically using a generator function:
  function handletab(tabname) {
    return function(){
      $("div.content").hide()
      $("#content_"+tabname).show()
      $.mobile.fixedToolbars.show(true)
    }
  }
 The generator function takes in the name of the tab, creates a tap function just for that tab, and returns that tap function (shown highlighted). The returned tap function is then attached to the tab (not the handletab function itself!). This dynamic function generation avoids messily working out the id of the clicked element using the event object.
The tap handler itself hides all content, and then shows the content for the tapped tab. The $.mobile.fixedToolbars.show jQuery Mobile method resets the positions of the header and footer bars to fit the size of the visible content. If you did not call this method, then the header and footer would be left floating on the screen in the wrong position.
The iScroll Solution
To give a more native feel to content scrolling, you can use the iScroll library as in previous labs. There are some additional requirements for extra markup in your HTML. You need to provide an a div that wraps your content. This arises from the way the library is implemented and because it needs to know the exact size of the scrollable area. You always use the following pattern:
<div class="wrapper">
  <div class="scroller">
    <p> your content that scrolls </p>
  </div>
</div>
You must also give the wrapper element an exact height value. This is important. Without an exact height, iScroll will fail to function properly.
Inside the wrapper, the first element becomes the one that will be scrollable. Follow the pattern just put all your content inside the first element, the “scroller,” and you won’t have any problems.

1. Create a file called tabbar-iscroll.css and insert the following code:   

div {
  padding: 0px !important;
}

ul {
  margin: 0px !important;
}

p {
  margin: 0px !important;
}

div.content {
  display: none;
}



2. Create a file called tabbar-iscroll.js and insert:


document.ontouchmove = function(e){ e.preventDefault(); }

$(function(){
  
  var current = 'numbers'
  var scrollers = {}

  var header  = $("#header")
  var footer  = $("#footer")

  header.css({zIndex:1000})
  footer.css({zIndex:1000})


  function handletab(tabname) {
    return function(){
      $("#content_"+current).hide()
      current = tabname
      $("#content_"+tabname).show()
      refresh()
    }
  }

  $("#tab_numbers").tap(handletab('numbers')).tap()
  $("#tab_letters").tap(handletab('letters'))
  $("#tab_colors").tap(handletab('colors'))
    

  function refresh() {
    var content = $("#content_"+current)
    if( !scrollers[current] ) {
      scrollers[current] = new iScroll("content_"+current)      
    }

    content.height( window.innerHeight - header.height() - footer.height() - 4 ) 
    scrollers[current].refresh()
  }

  window.onresize = function() {
    refresh()
  }
})

4. Create a file called tabbar-iscroll.html and insert:   
<!DOCTYPE html> 
<html> 
<head> 
  <title>iScroll Tab Bar App</title> 
  <meta name="viewport" content="user-scalable=no,initial-scale=1.0,maximum-scale=1.0" />
  <meta name="apple-mobile-web-app-capable" content="yes" /> 

  <link rel="stylesheet" href="jquery.mobile.css" />
  <link rel="stylesheet" href="tabbar-iscroll.css" />

  <script src="jquery.js"></script>
  <script src="jquery.mobile.js"></script>
  <script src="iscroll.js"></script>
  <script src="tabbar-iscroll.js"></script>
</head> 
<body> 

<div id="main" data-role="page">

  <div id="header" data-role="header">
    <h1>Tab Bar</h1>
  </div>

  <div data-role="content">	
    <div id="content_numbers" class="content scroller">
      <ul data-role="listview">
        <li>0</li><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li><li>7</li>
        <li>8</li><li>9</li><li>10</li><li>11</li><li>12</li><li>13</li><li>14</li><li>15</li>
        <li>16</li><li>17</li><li>18</li><li>19</li><li>20</li><li>21</li><li>22</li><li>23</li>
        <li>24</li><li>25</li><li>26</li><li>27</li><li>28</li><li>29</li><li>30</li><li>31</li><li>32</li>
      </ul>
    </div>

    <div id="content_letters" class="content scroller">
      <ul data-role="listview">
        <li>a</li><li>b</li><li>c</li><li>d</li>
        <li>e</li><li>f</li><li>g</li><li>h</li>
        <li>i</li><li>j</li><li>k</li><li>l</li>
        <li>m</li><li>n</li><li>o</li><li>p</li>
        <li>q</li><li>r</li><li>s</li><li>t</li>
        <li>u</li><li>v</li><li>w</li><li>x</li>
        <li>y</li><li>z</li>
      </ul>
    </div>

    <div id="content_colors" class="content scroller">
      <ul data-role="listview">
        <li>red</li>
        <li>green</li>
        <li>blue</li>
      </ul>
    </div>
  </div>

  <div id="footer" data-role="footer" class="ui-bar">
    <div data-role="navbar" class="ui-navbar">
      <ul class="ui-grid-b">
        <li><a id="tab_numbers">numbers</a></li>
        <li><a id="tab_letters">letters</a></li>
        <li><a id="tab_colors">colors</a></li>
      </ul>
    </div>
  </div>

</div>

</body>
</html>

7. Open the application by visiting http://192.168.0.2/lab07/tabbar-jqm.html in your mobile browser (replacing the IP as necessary). To install the example as a mobile web app, perform the home screen install procedure as described in the previous exercise.
8. Verify that you can scroll the list of items on the first page, and that the header and tab bar remain in place when you scroll. You should also be able to perform the native scrolling actions such as flicking and rubber-banding
Explanation
In this example, you use JavaScript to set up the user interface so that it has the characteristics of a native app. One thing that you need to prevent is the default web browser scrolling behavior, where the entire page is scrolled. As you will be handling content scrolling yourself, you need to deactivate this in the browser, otherwise your entire app will “rubber-band.” This line of code intercepts the standard touch move event that causes scrolling and disables it:
document.ontouchmove = function(e){ e.preventDefault(); }
As an experiment, try commenting this line out, reloading the app, and seeing what happens when press and hold one of the tabs, and then move upwards. Your whole app moves up! This line prevents that.
The remaining code executes once the web app HTML document has fully loaded. A jQuery shortcut is used here, $(function(){. This passes a function directly to the $ jQuery object. The function will be called when the document is ready. You need to do this to make sure that all the HTML elements have been created and properly set up by the browser before you modify them and attach your event listeners.
As there are multiple tabs, you need to keep track of which one is currently being shown, using the current variable. Each content section for each tab will need to be scrollable, so you’ll need to create an iScroll object for each one. The scrollers variable is an object that keeps track of the iScroll objects using the name of the tab.
In order to calculate the proper height of the content area so that you can give it to iScroll, you’ll need to get the heights of the header bar at the top, and the tab bar at the bottom. Add these together and subtract from the total body height. For now, just store jQuery references to these elements in the variables header and footer:
  var header  = $("#header")
  var footer  = $("#footer")
To make sure that the header and footer are always visible above anything else on the page, set their z-index CSS property using jQuery:
  header.css({zIndex:1000})
  footer.css({zIndex:1000})
The handletab function from the previous example needs some additional logic. You need to record the name of the tab that was just tapped, and also refresh the iScroll object that controls the content for that tab. This is done by calling a refresh function, the code for which you will see shortly. This refresh is needed so that iScroll can work again. When the user tapped on a different tab and moved away from this tab, the content was hidden using CSS. Now that the user has returned to this tab, the content is made visible again, and iScroll needs to know about it. The lines to store the current tab and call the refresh are shown highlighted.
  function handletab(tabname) {
    return function(){
      $("#content_"+current).hide()
      current = tabname
      $("#content_"+tabname).show()
      refresh()
    }
  }
The tab handlers are attached as in the previous example, using the handletab generator function to create a new click handler function for each tab.
The refresh function itself does the work of setting up the iScroll objects if they do not already exist, or refreshing them if they do. This is an example of “lazy initialization,” which is a strategy for improving performance. Only create the objects that you need, when you need them. Don’t create them all at once when the app starts up first.
The refresh function first gets the content div for the current tab. A sensible naming convention helps you here. You gave each content div an id in the form content_<tabname>.  This makes it easy to construct the string value of the id of the element that you want.
  function refresh() {
    var content = $("#content_"+current)
Next, check if you have a scroller already. If not, go create one. The iScroll object constructor takes the value of the id attribute of the element containing content to scroll.
    if( !scrollers[current] ) {
      scrollers[current] = new iScroll("content_"+current)
    }
Once you have your iScroll object, you can proceed with the refresh. You re-calculate the height of the content section each time, as the device orientation may have changed. To get the height of the content section, subtract the height of the header and footer from the height of the body. You also need to subtract an additional 4 pixels to account for 1 pixel borders on the header and footer divs.
    content.height( 
      window.innerHeight - header.height() - footer.height() - 4 
    )
Once you the height set, you can refresh the scroller, and you’re done:
    scrollers[current].refresh()
  }
The last little piece of housekeeping is to make sure you call the refresh function when the user changes the device orientation:
  window.onresize = function() {
    refresh()
  }
The iScroll library always requires you to refresh if there are any changes to the content or the layout. If you don’t, the scroll will behave incorrectly.
Sliding Page Transitions
Many apps use a horizontal sliding transition to display new pages when the user taps on the tab bar. You can use CSS3 transforms to achieve this effect.
1. Copy the tabbar-scroll.html file to tabbar-slide.html in your lab07 folder. Change the references to tabbar-scroll.css and tabbar-scroll.js to tabbar-slide.css and tabbar-slide.js
2. Create a file called tabbar-slide.css and insert:

div {
  padding: 0px !important;
}

ul {
  margin: 0px !important;
}

p {
  margin: 0px !important;
}

div.content {
  display: none;
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
}

div.leftin {
  -webkit-animation-duration: .4s;
  -webkit-animation-name: leftin;
}

div.rightin {
  -webkit-animation-duration: .4s;
  -webkit-animation-name: rightin;
}


@-webkit-keyframes leftin {
  from { 
    -webkit-transform: translateX(100%);
  }
  to { 
    -webkit-transform: translateX(0);
   }
}


@-webkit-keyframes rightin {
  from { 
    -webkit-transform: translateX(-100%);
  }
  to { 
    -webkit-transform: translateX(0);
   }
}


The following lines are a hack to trigger use of the graphics processing unit (GPU), by requesting 3D transforms – although you only use the X axis in this case. Using the GPU avoids flickering and jerky animation.
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;

The animate the page in from the left or right, define an animation using keyframes:
@-webkit-keyframes leftin {
  from { 
    -webkit-transform: translateX(100%);
  }
  to { 
    -webkit-transform: translateX(0);
   }
}

And reference it from a CSS class:
div.leftin {
  -webkit-animation-duration: .4s;
  -webkit-animation-name: leftin;
}
This is specifies how quickly to perform the animation – in this case, in .4 seconds.

3. Create a file called tabbar-slide.js and insert:

document.ontouchmove = function(e){ e.preventDefault(); }

$(function(){
  
  var current = ''
  var order   = -1
  var scrollers = {}

  var header  = $("#header")
  var footer  = $("#footer")

  header.css({zIndex:1000})
  footer.css({zIndex:1000})


  function handletab(tabname,taborder) {
    return function(){
      if( current != tabname ) {
        $("#content_"+current).hide()
        $("#content_"+tabname).show().addClass(order<taborder?'leftin':'rightin')

        current = tabname
        order = taborder
        refresh()
      }
    }
  }

  $("#tab_numbers").tap(handletab('numbers',0)).tap()
  $("#tab_letters").tap(handletab('letters',1))
  $("#tab_colors").tap(handletab('colors',2))
    

  function refresh() {
    var content = $("#content_"+current)
    if( !scrollers[current] ) {
      scrollers[current] = new iScroll("content_"+current)      
    }

    content.height( window.innerHeight - header.height() - footer.height() - 4 ) 
    scrollers[current].refresh()
  }

  window.onresize = function() {
    refresh()
  }
})


This code is almost the same the previous example. The CSS animations are triggered by applying the leftin or rightin styles. In order to provide a consistent user experience, pages are animated in from the left or the right depending on their position relative to each other on the tab bar.


 
