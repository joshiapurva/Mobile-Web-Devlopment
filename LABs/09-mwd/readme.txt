
Mobile Web Development
Lab 09
20 Nov 2012
Richard Rodger
richard.rodger@nearform.com




Objectives
?	Understanding the code structure boilerplate PhoneGap app
?	Understanding the capabilities of the PhoneGap API
?	Running the boilerplate app as an Android or iPhone application


 
Table of Contents 
Objectives	1
Directions For Lab Work	2
Understanding the Boilerplate PhoneGap app	3
Running the boilerplate app as an iPhone Application	4
Running the boilerplate app as an Android Application	5 


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





Understanding the Boilerplate PhoneGap app
The lab materials provide a boilerplate app that implements a standard tab bar view and scrolling panes. This app structure ca be used as the basis for further apps. Carefully review the code and make sure you understand the interactions between jQueryMobile and Backbone.
The app makes use of the PhoneGap API for device functionality. However, it still functions a a mobile web app for the purposes of the main structure of the app and the tab bar navigation.
1. The app files are provided in source form, and just need to be run.
2. View the app using nginx in the same manner as previous labs, and confirm that it functions as a mobile web app

Running the boilerplate app as an iPhone Application
This section is optional if you do not have access to a Mac. You will need to have PhoneGap installed.
1. The iphone folder contains an Xcode PhoneGap project. Open the folder iphone/pgapi/pgapi.xcodeproj in Xcode – the project should open
2. Run the app using the iOS Simulator, and confirm that it functions as expected. Some of the native functions will also start working, although others, such as the accelerometer, will not work in the simulator.
3. If you have signed up for an Apple developer account, run the app on your iphone. You will need to change the build configuration to use your own developer certificates – refer to the Apple documentation.

Running the boilerplate app as an Android Application
This section requires Eclipse, but can be run from any OS. You will need to have the Android SDK installed as per  http://phonegap.com/start
1. The android folder contains an Android PhoneGap project. Create a new Android project in Eclipse and use the android folder as the “existing source.”
2. Run the app using an Android virtual device, and confirm that it functions as expected. Some of the native functions will also start working, although others, such as the accelerometer, will not work in the emulator.
3. If you have an Android device, run the app on the device using Eclipse. You will need to connect to your development machine using USB. Make sure to enable USB debugging in the Network settings page on your Android device. Unlike the iPhone, a certificate is not required.


 
