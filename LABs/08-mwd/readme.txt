
Mobile Web Development
Lab 08
13 Nov 2012
Richard Rodger
richard.rodger@nearform.com




Objectives
?	Understanding the configuration options for Amazon cloud servers
?	Instantiating an Amazon cloud server
?	Understanding the configuration options for Amazon cloud servers
?	Using the nginx web server on the Amazon cloud
?	Configuring UNIX services using text files via a remote SSH session
?	Using the git software configuration management tool
?	Using the github.com service
?	Building and installing Node.js on Amazon
?	Using PhoneGap to run local versions of HTML5 apps in simulator/emulator environments

 
Table of Contents 
Objectives	1
Directions For Lab Work	3
Creating an Amazon EC2 Server Instance	4
Configuring an Amazon EC2 Instance as a Front End Web Server	12
Using Github to Manage your Code	17
Deploying a Mobile Web App to Amazon	20
Running Node.js on Amazon	22
Running an iPhone PhoneGap App with Xcode on the iPhone Simulator	26
Running an Android PhoneGap App with Eclipse on the Android Emulator	36 


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



Creating an Amazon EC2 Server Instance
To deploy your app to the Amazon cloud, you’ll need to create a server instance that delivers your app to mobile devices. This server instance runs a web server that delivers the html, css and js files to mobile device web browsers.
Amazon provides a free usage option – you can run one “micro” instance server free for one year. See http://aws.amazon.com/free/.The sign up does require you to enter your credit card details, and Amazon may change the terms, so you may end up paying for this service. The charges for low volume use are very low however.
1. Open up your desktop Safari browser and visit the website: http://aws.amazon.com. This is the home page of the Amazon Web Services cloud system.
2. Click on the Create An AWS Account link on the top right of the page.
3. You will be presented with the Amazon Web Services Sign In page. This  page looks almost exactly like the normal Amazon consumer sign in page. Your AWS account is also a normal Amazon account and is handled by the same internal Amazon user authentication system. Sign in using an existing Amazon account, or create a new one specially for your AWS usage.
4. After you sign in, you are presented with the AWS management console. However you are not able to do anything yet, as you have not signed up for any products. This example will use the EC2 product, so sign up for that by clicking the yellow Sign Up button.
5. As part of the sign up process, you now have to complete an account verification procedure. This is an additional security measure that all new AWS accounts must complete. An automated Amazon service will phone you, and you must tap in a PIN code provided onscreen. Amazon will then send you an email when the EC2 service has been activated for your account.
6. Once your account has been verified, click on the EC2 tab of the AWS management console. The standard EC2 control panel interface is shown below, before you add any instances

7. Open a new browser tab and visit the http://alestic.com blog. Click the eu-west-1 tab. You are shown a list of AMI codes. Choose the most recent version of Ubuntu. This is usually the first entry at the top of the table. The publisher should be Canonical, and you should select the 64bit EBS instance. You can copy and paste the AMI code and enter it manually into the AWS management console. The Alestic blog also offers a short cut link. If you click the arrow beside the AMI code, you are taken back to the AWS console, and a pop up window entitled “Request Instances wizard” appears where you can set up your instance.

8. The wizard pop up window has a number of steps that you have to complete, and you are shown your progress at the top for each step. By using the shortcut link from the Alestic blog, you have already completed the first step, which is to choose the AMI. Click the Continue button.
9. You now need to choose the right size of instance. You want to make sure you are on the free usage tier! Choose the Micro (t1.micro) option from the Instance Type drop down list. Make sure you only request 1 instance, and leave your availability zone at “No Preference”. Also choose the Launch Instances option. 

10. Click the Continue button. There are some further more advanced options for the Instance Details step - accept all the defaults, and continue to the Create Key Pair step.
11. You need a secure cryptographic public/private key pair to actually login to your instance. For this example, you can let Amazon do all the hard work, and just create a new key pair. Choose the Create a new Key Pair option, call your key pair “yourkey”, and click the Create and Download your Key Pair button. You will be asked to save a file called yourkey.pem. You should store this file in a safe place. 

12. You’re not done yet! You need to make sure your instance is secure by setting up a firewall. As this instance will be a web server, you want to allow HTTP traffic. You also want to allow SSH access so that you can login. The best thing to do here is to create a Security Group that stores these web server firewall settings so that you can reuse them if you create new instances.
13. On the Configure Firewall step, choose the Create a new Security Group option. Use the value “web” for the Group Name field. In the Inbound Rules box, choose SSH from the drop down list, and leave the Source value as 0.0.0.0/0. Click the Add Rule button.

14. Remain on the Configure Firewall step. Add rules for HTTP and HTTPS using the Inbound Rules box. Once you are done, click Continue. 

15. The final step asks you to review and launch your instance. Your instance will appear in the instances list on the main area of the EC2 tab, first with a state of “pending”, and then with a state of “running” Right click on the instance, and select Properties. 

16. Play around with the EC2 management console. Try stopping and starting your instance, and viewing the monitoring tab on the properties area.




Configuring an Amazon EC2 Instance as a Front End Web Server
To run the command line utilities in this example, you will need to use a command line terminal. If you are using a Mac or Linux machine, then simply launch the Terminal application and you are ready to go. If you are using a windows machine, then you can install the Cygwin environment, available from http://www.cygwin.com. This gives you a UNIX-like terminal that can run the commands in this example.
If you are not familiar with UNIX command line utilities you can still follow this example. Just make sure to enter the commands very precisely. It may help to do some background reading to become a little more familiar with these utilities, as you will need to use them to manage your cloud servers. http://www.linux.com is a good place to start.
1. Start the Terminal application. Use the cd command to go to the folder where you downloaded the yourkey.pem Amazon key file in the last example. On a Mac, you probably saved this file to your Downloads folder, so type in the command:
cd Downloads
Alternatively, and this may easier on Linux or Windows, copy the yourkey.pem file into your home folder. Use the pwd command to find your home folder. It prints out the location of the current folder. When you start the Terminal application, you start in your home folder.
$ pwd
/home/username
2. Open the AWS Management Console, open the properties area for your instance, and copy the public DNS Name. This is long string that looks something like:
ec2-204-236-174-57.us-west-1.compute.amazonaws.com
3. In the Terminal application, enter the following command, making sure you type it in exactly. 
chmod go-r yourkey.pem
This command ensures that the yourkey.pem file has the correct access permissions - only you should be able to access this file. The chmod command removes read permission from other users on your machine. The ssh command is quite strict about this.
4. To login to your instance, run the following command. Replace the highlighted text with the Public DNS Name of your instance.
ssh -i yourkey.pem  -l ubuntu <ec2...amazonaws.com>
5. You should now be logged in to your instance. You should see something similar to Figure 2-10. This shows the chmod and ssh commands, executed locally, and then the connection to your instance. When you connect, a short message is displayed, showing usage statistics.

6. You need a web server on your instance to deliver the drawing application files to mobile device browser.You need to install nginx on your Amazon instance. Because you are using Ubuntu, this is very easy with the apt-get command, which is the command line version of the Debian Advanced Packaging Tool. You need to be the root user to install nginx. Become root with the command:
sudo -s
Now, run the following command, and you should see the output below:
apt-get install nginx

7. Start the nginx web server with the command:
nginx
You’ll need to do this as root (which you still are). The command prints no output. To check that nginx is indeed running, use this command:
ps -ef | grep nginx
This lists all processes running on the machine with the name nginx. You should see several lines of output, that look similar to:
... nginx: master process nginx
... nginx: worker process
... nginx: worker process
... nginx: worker process
... nginx: worker process
... grep --color=auto nginx
8. Finally, verify that you have a working web server. Visit the Public DNS Name of your instance using your desktop Safari browser. You should see a welcome message as shown in below:

Explanation
In this example you used your Amazon public/private key file to gain access to your instance. Amazon uses key files as they are more secure than passwords. It is impossible for anyone to log in to your instance without the key file. For this reason you should keep the key file stored safely, and make sure to back it up as well.
For the purposes of the example, you placed your key file in your home folder. Normally you would store your key file in a special subfolder of your home folder called .ssh. If you would like know more about SSH, please visit http://www.openssh.com. 
On Windows, as an alternative to the Cygwin version of SSH, you can use an application called PuTTY. This is available from http://www.chiark.greenend.org.uk/~sgtatham/putty.
The ssh command takes many arguments. In this case, you used the -i argument to specify a key file, and the -l argument to specify the name of the user that you want to login as. For the Ubuntu AMI that you set up, this user is “ubuntu”. You do not login directly as the root user, but you can become the root user if you need to by using the sudo command.
To install nginx, you used the apt-get command. This downloads, builds, configures and installs nginx for you, all in go. It does not start nginx automatically so you need do this yourself, with the simple command:
nginx
This launches nginx as a UNIX daemon, which means that it detaches itself from your login, and will keep running in the background even when you log off. This is what you want from a web server!
 The ps command lists all the processes that are running on the instance. You run this command, and then pipe it’s output, using the | character, as input to the grep command. The grep command searches for strings that match its arguments. The end result of this UNIX incantation is a list of any nginx processes that are running. This is a handy way to check the nginx is indeed running.
Using Github to Manage your Code
The http://github.com service is a cloud service offering source code hosting using the git version control utility. git can take a little getting used to, but it is well worth it, as it lets you manage and deploy your code easily - http://help.github.com/ is a good place to start.


1.Register with the github.com site. As with Amazon, you will need to create a public/private key pair to access github. Follow the Beginner/Set Up Git instructions carefully at help.github.com.
2. Create a new public repository (you have to pay for private ones) called todolistmobileapp


3. Follow the instructions on the command line to set up your repository. On windows, use http://code.google.com/p/msysgit/ to run a command line with git available.
You can cut and paste the commands. Run them inside your projects folder so that the todolistmobileapp folder is created inside your projects folder.


4. Copy the todo list source files from the lab08 materials into the todolistmobileapp folder. cd into  the todolistmobileapp folder, and run
git add -i
This starts the interactive version of git add, which is a easy way to find out what files you’ve changed and now need to deploy to the server. Follow the instructions to select your changed files.
In this case, add all the source files.
Then commit your changes, with a suitable logging entry (use the -m switch):
git commit -m "initial source code"
Then push your changes up to the github.com service:
git push
5. Go back to github.com and look at your project. You should now see all the files you have committed. 
6. Now log in to your Amazon server. This time, include the -A option to ssh. This brings your Github access keys along for the ride so that you can access your Github repository from the Amazon server.
ssh -l ubuntu -A your.amazon.server.com
On the server, “clone” the repository (from your home folder):
git clone git@github.com:<your-github-username>/todolistmobileapp.git
This will download the source files from github to your amazon instance, placing them in the folder todolistmobileapp in your home folder. Take a look around: 
cd todolistmobileapp
ls
ls -lisa
You should see the source files listed (ls -lisa gives verbose output):



Deploying a Mobile Web App to Amazon
To run your app on the server, you’ll need to edit the nginx configuration file. In order to do this you will need to use a command line text editor such as Vi or Emacs. Because you can’t use the mouse, these editors require you to use the Control and Escape keys to enter commands such as copy and paste. You may already be familiar with one of these editors.. If not, you should first take a little time to learn the basics of either Vi or Emacs. Here are some good places to start: http://www.wikihow.com/Learn-vi and http://www.wikihow.com/Program-Using-GNU-Emacs. These command line editors may seem slightly prehistoric, but they are incredibly useful if you intend to build a cloud-based mobile app. You will need to be able to edit text files on your servers to configure and control the cloud-based elements of your app.
1. Open the Terminal application and login to your instance as before, using the -A flag to ensure you can access github.
ssh -i yourkey.pem -A -l ubuntu <ec2...amazonaws.com>
2. Install both text editors and take your pick:
sudo apt-get install emacs23 vim
3. Open the nginx default configuration file using your command line editor of choice. This file is located at:
/etc/nginx/sites-available/default 
Make a backup copy in case you make a syntax error and nginx won't restart.
cp /etc/nginx/sites-available/default /tmp/nginx-default 
Open the configuration file:
emacs /etc/nginx/sites-available/default 
OR
vim /etc/nginx/sites-available/default 
4. Insert the following lines into the server { ... } section of the nginx configuration file. Just after the location / { ... } subsection is a good place. You’ll need to scroll down to find it.
       location /todolistmobileapp {
          alias /home/ubuntu/todolistmobileapp/site/public;
        }

        location /api/ {
            proxy_pass http://127.0.0.1:8180/api/;
        }
5. Save the file, and exit from the text editor.  To serve files from this folder, reload the nginx configuration using the command:
sudo nginx -s reload
Check /var/log/nginx/error.log for errors.
6. Cd back to your todolistmobileapp folder (~ is a shortcut for your home folder):
cd ~/todolistmobileapp
Make sure you have the latest version of the source code:
git pull
Whenever you make changes and commit them with git push, you'll need to do a git pull on the server to deploy the changes.
7. Verify that you can reach the app on your desktop Safari browser. Visit the URL: http://<ec2...amazonaws.com>/todolistmobileapp .The highlighted server name is the Public DNS Name of your instance. The app loads, but does not function correctly, as no Node.js server is runing:

8. Open the app on your mobile device browser using the same URL. Use bitly.com to shorten the link and make it easier to type into your mobile, or email the URL to yourself and click on the link in the email on your mobile device.
Running Node.js on Amazon
To run the server-side logic of your app you need to install Node.js. As the app uses mongodb, you'll also need to install mongodb on your server.
One of the main advantages of Node.js is that is restarts very quickly after a crash – so quickly that you may not notice any downtime! To get this to work, you'll need to configure the “upstart” service.

1. Login to your server:
ssh -i yourkey.pem -A -l ubuntu <ec2...amazonaws.com>
2. Install MongoDB:
sudo apt-get install mongodb
You can start and stop the mongodb database using:
sudo service mongodb stop
sudo service mongodb start
The installation configures mongodb to run automatically, and to launch when you reboot the instance. To test, connect using the command line client:
mongo
3. Download, build and install Node.js. First install, the required C library dependencies:
sudo apt-get install build-essential libssl-dev
Then download and upack the Node.js source code:
cd
mkdir build

cd build

wget http://nodejs.org/dist/v0.6.12/node-v0.6.12.tar.gz

tar -xzf node-v0.6.12.tar.gz

4. Compile and install Node.js. This can take some time, as you are compiling on a micro instance, and there's not much CPU available:
./configure

make

sudo make install

5. Test the install is OK by printing the node and npm version numbers to the console:
node -v
npm -v

6. Install the required node modules:
cd
cd todolistmobileapp/node
sh npm-install.sh
Note: this version of the app uses version 1.8.5 of the connect module.
7. Run node:
node lib/db-server.js
8. Visit the URL: http://<ec2...amazonaws.com>/todolistmobileapp . (Or use your bitly link). You are now able to add items. If you reload the page, your items persist.

9. Run the mongo client on your server to verify that data has been saved:
mongo lab08
> db.todo.find()
{ "text" : "item 0", "created" : 1331658044897, "_id" : ObjectId("4f5f7d3c85b830ae35000001") }


10. Configure your node.js service to automatically restart. Become root:
sudo -s
and create the file
/etc/init/todolistmobileapp

Insert the following:
description "todolistmobileapp"

author  "rjrodger"



pre-start script
  
  touch /var/log/todolistmobileapp.log
  chmod a+rw /var/log/todolistmobileapp.log

end script

start on runlevel [2345]

stop on runlevel [!2345]



respawn
respawn limit 999 1


exec sudo -u ubuntu /usr/local/bin/node /home/ubuntu/todolistmobileapp/node/lib/db- server.js >> /var/log/todolistmobileapp.log 2>&1


This is a simple configuration for the upstart utility: http://upstart.ubuntu.com/
It detects when the Node.js process has crashed an restarts it for you automatically – no downtime!

To start your Node.js service:
sudo start todolistmobileapp
To stop:
sudo stop todolistmobileapp

To view the live output from the Node.js process, use 
tail -f /var/log/todolistmobileapp






Running an iPhone PhoneGap App with Xcode on the iPhone Simulator
This exercise requires a Mac and is therefore optional
To complete this exercise you will need to install the Xcode IDE that Apple provides, and the PhoneGap toolkit for building HTML5 hybrid apps.
Install Xcode: https://developer.apple.com/xcode/index.php
In order to actually install apps on a physical iphone you will need to subscribe to the Apple developer programme for US$99. You'll also need to subscribe to obtain older versions of Xcode.
This is not required. This example just covers running your app on the simulator that comes with Xcode.
If you do not have a Mac, https://build.phonegap.com provides on online building service. This has some limitations, and is only partially free.
To use PhoneGap, install by following the instructions here:
http://phonegap.com/start

The Xcode IDE changes frequently – you may notice some differences between your version and the screenshots here.

This example takes you click-by-click through the process of building an iPhone and running it, first in the simulator, and then on a device. 
1. Start the Xcode development environment. Choose File / New Project from the menu bar at the top of the screen. You should see the New Project dialog window, as shown below

2. On the left side bar, click on the PhoneGap item under the User Templates section. A PhoneGap icon, titled “PhoneGap-based application,” should appear in the dialog window. Click on the icon to create a new PhoneGap project. Use com.yourname.todo as the “Bundle Identifier”:
 
3. A file selection dialog window will appear. Enter “todo” as the name of your project. On the Mac, the Projects folder in your home folder is a good place to put your projects.
4. The Project window should now appear. This window shows all the items in your project.

You need to add a reference to the www folder so that PhoneGap can pick up your HTML code. Right click on the top level todo item (with the blue background), and select “Add files to project”. Navigate to the todo project folder, and select the www folder. Make sure to select the “Create folder references” option:

5. The www folder now appear with a blue icon in the main project hierarchy:
	


Press the Run button and the app will launch in the simulator:


6. Open the www/index.html file. A code editor window appears, showing the default contents of the index.html file. PhoneGap provides you with some boilerplate code to get you started. To verify that everything works, you’ll modify this file and run the app in the simulator. Add the word todo to the body of the HTML, as shown below


7. Click the Run icon again, and you should see your change:

Running an Android PhoneGap App with Eclipse on the Android Emulator
This exercise requires Windows and is therefore optional
To complete this exercise you will need to install the Eclipse IDE and the Android SDK that Google provides, and the PhoneGap toolkit for building HTML5 hybrid apps.
Install Eclipse: http://eclipse.org
Install the Android SDK: http://developer.android.com/sdk/index.html
The installation of the Android SDK is quite involved – follow the instructions carefully.
You can install apps on physical devices directly from the Android SDK. However, this example just covers running your app on the emulator.
If you do not wish to install the Android tools, https://build.phonegap.com provides on online building service. This has some limitations, and is only partially free.
To use PhoneGap with Android, install by following the instructions here:
http://phonegap.com/start
Select the Android icon at the top of the page.
The Android SDK also changes frequently – you may notice some differences between your version and the screenshots here.
1. Copy the Sample android project from your unzipped PhoneGap download. You’ll create a copy of this folder for each new project. Paste the folder into the Projects folder on your Mac. On non-Mac systems, paste the copied Sample folder into a projects folder of your choice. Rename the folder android-todo.
2. Start the Eclipse development environment. Choose File / New / Project from the menu bar at the top of the screen. You should see the New Project dialog window, as shown below

3. Select the Android Project option, and click the Next button.
4. On the project details page, enter the string todo for your project name. Choose the “Create project from existing source” option, and point the Location field at your android-todo folder. Select the most recent version of Android as your build target. 

5. Click the Finish button. Your project will open in Eclipse, but it will not build at first and will report an error. Open the libs subfolder of the project and right-click on the phonegap.jar file. Select the “Add to Build Path” option. Your project should now rebuild without errors.

6. The HTML, JavaScript and CSS files for Android projects are store in the assets/www subfolder. Open this folder. Right-click on the index.html file, and select the “Open in Text Editor” option. The Android sample project also contains a large amount of boilerplate example code. 

7. Run the app in the simulator by click on the green run arrow in the top icon bar. Choose the “Android Application” option from the dialog window that appears. This will launch the Android simulator, install and run your app. The simulator can be slow to start.
 
