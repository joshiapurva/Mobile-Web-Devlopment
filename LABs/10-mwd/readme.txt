
Mobile Web Development
Lab 10
27 Nov 2012
Richard Rodger
richard.rodger@nearform.com




Objectives
?	Understanding a complete cloud service API example
?	Deploying apps to Platform-as-a-Service environments


 
Table of Contents 
Objectives	1
Directions For Lab Work	2
Running the example service API	3
Deploying the example service to Heroku	4
Deploying the example service to CloudFoundry	5 


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







Running the example service API
The example code for this lecture is provided as a complete app that uses a service API.
The app source code is not included in the lab materials. Rather it is provided as an open source project on github.com. This will enable you to deploy the app to Heroku.
This lab assumes a basic familiarity with the git version control system. Start here if you need an introduction: http://help.github.com/
The service provides a REST data API that includes a simple data synchronisation feature – refer to the lecture for details.
The app is an example built on this service – a “Startup Death Clock”, which works out when your startup will run out of money. The user enters monthly income and expenditure. Theses entries are then synchronized if the app is run from multiple devices.

1. Go to https://github.com and login (create an account if necessary).
2. Go to https://github.com/rjrodger/data-capsule and click the Fork button. This creates your own separate copy of the repository
3. On your local machine, clone your local respository:
git clone git@github.com:YOUR_USERNAME/data-capsule.git
4. change into the data-capsule folder, and run the Node.js server:
cd data-capsule
node lib/server.js 8181
5. Open the test page and try some of the examples listed in the page:
http://127.0.0.1:8181/test.html
> http.get('/api/ping',printjson)
{"ok":true,"time":"2012-03-27T22:12:12.087Z"}

> http.post('/capsule/rest/001/entry/app=sdc',{type:'income',month:'2012-04',amount:10000},printjson)
{"type":"income","month":"2012-04","amount":10000,"id":"2012-04_income","v$":0}

> http.post('/capsule/rest/001/entry/app=sdc',{type:'income',month:'2012-05',amount:15000},printjson)
{"type":"income","month":"2012-05","amount":15000,"id":"2012-05_income","v$":0}

> http.get('/capsule/rest/001/entry/app=sdc',printjson)
{"items":[{"type":"income","month":"2012-04","amount":10000,"id":"2012-04_income","v$":0},{"type":"income","month":"2012-05","amount":15000,"id":"2012-05_income","v$":0}]}


6. An example app is provided to demonstrate the use of the API in a concrete case. Open http://127.0.0.1:8181/ to see the “Startup Death Clock” mobile web app. Access the app from multiple browsers and add and modify book keeping entries to see the data synchronise.
7. Review the server and client code and make sure that you understand the basic logic flows.

Deploying the example service to Heroku
The example code for this lecture can run locally, and on Amazon as per the instructions in previous lectures. However the code is also pre-configured for use on http://heroku.com

1. Register for an account on heroku.com
2. Follow the instructions at https://devcenter.heroku.com/articles/quickstart to install the heroku command line client. To verify your set up, run:
heroku version
3. Login to heroku on the command line:
heroku login
4. Review the usage instructions for Node.js apps on Heroku:
https://devcenter.heroku.com/articles/nodejs
5. The configuration requirements for Heroku have already been set up in the project files. The package.json file defines the npm modules required using the dependencies property.

Heroku uses a process control file, called “Procfile”:
web: node lib/server.js $PORT


This provides Heroku with the command to start the Node.js server.
To start the server locally using the Procfile, run the command:
foreman start

This will run the server in the same way as in the previous example. Load http://127.0.01:8181/  to test.
To stop:
foreman stop

6. To deploy the app to Heroku, first create an app instance
heroku create --stack cedar

Then push your code up to Heroku by running the following git command:
git push heroku master

This will also deploy your code to a live “Dyno”. You will be given a URL in the output of the command, such as http://falling-sky-6829.herokuapp.com

Exercise the Heroku version as per the last example.
Deploying the example service to CloudFoundry
The example code is also pre-configured for use on http://cloudfoundry.com 

1. Register for an account on cloudfoundry.com – you may need to wait for a day for it to activate.
2. Follow the instructions at http://start.cloudfoundry.com/tools/vmc/installing-vmc.html to install the vmc command line client. To verify your set up, run:
vmc
3. Set the target cloud using:
vmc target api.cloudfoundry.com
Login to cloudfoundry on the command line:
vmc login
4. Review the usage instructions for Node.js apps on Cloudfoundry:
http://start.cloudfoundry.com/frameworks/nodejs/nodejs.html
5. The configuration requirements for CloudFoundry have already been set up in the project files. The package.json file defines the npm modules required using the dependencies property.
CloudFoundry requires an app.js file at the top level. This Node.js script is run to start the server. IN the sample app, the app.js file simply includes lib.server.js as a module and runs it:
var server = require('./lib/server')
server.start()

6. To deploy the app to CloudFoundry, run
vmc push --runtime=node06

This will deploy your code to a live server running Node version 0.6. You will be asked to specify the name of the app. Example app: http://startupdeathclock.cloudfoundry.com 
Exercise the CloudFoundry version as per the last example. 
