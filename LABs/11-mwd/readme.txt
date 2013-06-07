
Mobile Web Development
Lab 11
4 Dec 2012
Richard Rodger
richard.rodger@nearform.com




Objectives
?	Create social media apps
?	Understanding OAuth login
?	Understanding Oauth resource access


 
Table of Contents 
Objectives	1
Directions For Lab Work	2
Creating a Twitter App 	3
Creating a Facebook App 	7
Running the Example Social App 	10 


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






Creating a Twitter App 
To run the sample app for this lecture you will need to create a Twitter app.

1. On your desktop browser, visit http://developer.twitter.com
You will need to login using your twitter account.
2. Select “My Applications”, and click “Create new”;




3. Enter your app details:

Make sure to specify the callback url as http://127.0.0.1:8180/auth/twitter/callback


4. Also indicate that you need read/write permission, so that you can submit tweets:


5. Finally, copy the consumer key and secret, as they will be needed for your Server configuration:


Creating a Facebook App 
To run the sample app for this lecture you will also need a Facebook app (optional).

1. On your desktop browser, visit http://www.facebook.com/developer
You will need to login using your facebook account. Add the Developer application to your account.
2. Click “Create App”:


3. Enter your app details:

Important: select “Website” as the integration mechanism, and enter you callback URL:
http://127.0.0.1:8180/auth/facebook/callback


4. Enter the extended permission publish_stream under the Auth Dialogue tab:


Running the Example Social App 
The example code for this lecture is provided as a complete app that uses Oauth.
The app source code is not included in the lab materials. Rather it is provided as an open source project on github.com. 
This lab assumes a basic familiarity with the git version control system. Start here if you need an introduction: http://help.github.com/
The app builds on the simple data synchronisation service – refer to the lecture 09 materials for details.
The app is an example built on this service – a “Startup Death Clock”, which works out when your startup will run out of money. The user enters monthly income and expenditure. Theses entries are then synchronized if the app is run from multiple devices.
This version of the app includes the ability to:
- login with Twitter or Facebook
- tweet or post a message telling your followers how long your start up has before it runs out of money.


1. Go to https://github.com and login (create an account if necessary).
2. Go to https://github.com/rjrodger/social-example and click the Fork button. This creates your own separate copy of the repository
3. On your local machine, clone your local respository:
git clone git@github.com:YOUR_USERNAME/social-example.git
4. Change into the project folder, and install the required modules:
cd social-example
npm install

5. Copy the lib/config.copy.js file to lib/config.mine.js and insert the secret keys from your twitter and facebook apps.

5. Run the Node.js server:
node lib/server.js 8181

6. Open the app in your desktop safari browser:
http://127.0.0.1:8180




7. Click the login button and login using Twitter:



8. You should return to the app after login, and you will see a button at the bottom that allows you to tweet:



9. Logout, and perform the same procedure with Facebook.
10. Review the server and client code and make sure that you understand the logic flows.


 
