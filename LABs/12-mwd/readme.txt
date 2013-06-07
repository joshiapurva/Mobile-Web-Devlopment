
Mobile Web Development
Lab 12
11 Dec 2012
Richard Rodger
richard.rodger@nearform.com




Objectives
?	Use Native SDKs
?	Use PhoneGap Plugins

 
Table of Contents 
Objectives	1
Directions For Lab Work	2
Using PhoneGap Plugins	3 


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



Using PhoneGap Plugins
The example from lab 11 has been extended to use the Flurry analytics service. This extension shows how to integrate a third party SDK, and use a PhoneGap plugin.
To access the code, clone the https://github.com/rjrodger/social-example repository again, and switch to the apps branch:
git checkout apps

The android and ios folders contain Android and iOS projects respectively.
Due to version conflicts with different version of Android, Eclipse, iOS and Xcode, the sample projects may not work correctly when imported directly. It is usually better to create new projects and copy the contents of the www folder.
In this case, both projects make use of the copy-assets.sh script introduced in lab 09 to update the contents of the app www folder when you make changes to the files in site/public.

To build the apps, follow the instructions in the lecture PDF. The custom Android plugin is contained in the repository: src/org/apache/cordova/plugins/flurry/FlurryPlugin.java



 
