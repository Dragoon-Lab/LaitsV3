#Installation Instructions
This testing framework requires make, nodejs & node package manager (npm), java, and chromedriver to install.

##Linux
* Install any of the above if they are missing.
* Run ```npm install -g mocha``` to install Mocha
* Run ```make install``` in the /tests/ directory

##OSX
* OSX comes with a -pre version of node.  One of the modules used by the synchronize module only works on stable versions of node.  You'll need to install a node version manager such as [n](https://github.com/tj/n).  To install n, run: ```npm install -g n```
* Once installed find the latest version of the even numbered release of node (e.g. 0.10.33) and install it: ```n 0.10.33```
* Run ```npm install -g mocha``` to install Mocha
* Run ```make install``` in the /tests/ directory

##Windows
Windows doesn't come with any of those things usually, so here are more detailed instructions:
* Install node from https://nodejs.org/download/  (this will include npm)
* Run ```npm install -g mocha``` to install Mocha
* Install GNU Make
* In powershell or cygwin, Run "make install" in /tests/ directory
  * The 1.0.8 version of fiber js (used by synchronize.js) may require you to install the latest python (> 2.5, < 3.0), so if this step gives an error to that effect, install python 2 and try again.
* Install a Java runtime environment (if needed)
* Download chromedriver and add its path to your system's PATH variable (or put it in c:\Windows)

##Your first run:
* Before your first run you must tell the framework what path to run in.  To do this:
  * Create a file "test-paths.js" in /test/scripts/ by making a copy of the file "example-test-paths.js" in that same directory.
  * Edit the variable inside test-paths.js to the dragoon path on your local server
* Now you should be ready for your first run.  Shell scripts which automate the process are located in /tests/.  If you are on Linux or OSX, call RunTests.sh.  If you are on Windows, use RunTests.bat.
  * By default, the scripts run all scripts in /tests/scripts/coreTests and /tests/scripts/bugTests.
  * If you pass a path as a command line argument, RunTests will run only that script (or only the contained scripts, if the path is a directory)

#Information about the tests
For testing, we use:

* [mocha](http://visionmedia.github.io/mocha/) as our test runner
* [chai assertion library](http://chaijs.com/guide/styles/) for checking results with assert statements
* [selenium webdriverjs](https://github.com/webdriverio/webdriverio) for simulating browser commands
* [selenium server](http://docs.seleniumhq.org/download/) as the selenium server
* [phantomjs](http://phantomjs.org/) as the browser for efficiency and lack of user interface (not working yet; see below for running with chrome)

More information about how all five of these components work together can be found on [this link](http://code.tutsplus.com/tutorials/headless-functional-testing-with-selenium-and-phantomjs--net-30545).  We also use:

* [synchronize.js](http://alexeypetrushin.github.io/synchronize/docs/index.html) for handling asynchronous calls

Each browser handles certain aspects of dragoon differently. As a result, in order to test browser specific problems, we will need to write different test scripts for each specific browser. So at the time, the tests should be only run on phantomjs and chrome since they both work similarly. If you would like to see the run through, change the browser name to chrome on top of the test file, else, use phantomjs as the browser for the test files. I find it very helpful to be able to visualize the test happening when writing or editing tests. If you do decide to use chrome and you are a windows user, you need to install [chromedriver](http://code.google.com/p/selenium/wiki/ChromeDriver) and place the executable file in windows path. 

#Files
* dtestlib.js - library of functions which drive and/or retrieve information from the Dragoon UI
* example-test-paths.js - Copy this file to test-paths.js (same directory), and change the paths to match your local webserver set up.
* shakedown.js - Test script of unit tests for dtestlib; run this to ensure everything is working before running other test files.  (Also provides an example of how to write a test script.)
* coreTests/ - Holds tests which should be run to test all the core functionality of Dragoon itself.  (Listed below.)

The shakedown test imports selenium server and thus requires selenium server to be running.

#Dragoon Testing Library
In the original version of this work, test scripts called the webdriver directly.  Unfortunately that meant that when the Dragoon interface changed, it was very likely that all of the tests would need to be re-written.  This library abstracts away details such as element names and DOM structure so that tests won't break so long as the library itself is kept up to date.

Most of the exported library functions require at least one argument: "client", the webdriver.io client.  Inside the library we use [synchronize.js](http://alexeypetrushin.github.io/synchronize/docs/index.html) to serialize the selenium calls, converting the asynchronous code into code that runs serially.

#How the tests are run...
(NOTE: Everything in this section is done automatically by the RunTest shell scripts.  It is provided for your reference.)
To run individual tests, the selenium server must first be running. To run the selenium server, redirect the command prompt to the tests directory and type:

    java -jar selenium-server-standalone-2.45.jar -log selenium.log &

Then, run mocha: 

    mocha <path-to-test(s)> -t 30000
    
The mocha command is the test runner.  The -t 30000, specifies in milliseconds the amount of seconds before mocha times out. We add this because mocha defaults to 2 seconds, which is generally too short for the server to respond.

After we're done, wen shut down your selenium server by calling:

    curl http://localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer

You can also just point your web browser at that URL and it will shut the server down.

#Test Script List
##Core Tests
These scripts test the core features of Dragoon.

These test modes:
* authorRabbits.js - Tests author mode by building a rabbits problem from scratch
* studentCorrectRabbits.js - Solves the rabbits problem in immediate feedback mode
* studentIncorrectRabbits.js - Solves the rabbits problem in immediate feedback mode
* testRabbits.js - Tests delayed feedback mode
* editorRabbits.js - Tests no feedback mode

These test activities:
* executionRabbits.js
* executionDemoRabbits.js 
* incrementalRabbits.js
* incrementalDemoRabbits.js
* waveformRabbits.js

These test specific features:
* functionTest.js - Tests for the math functions
* graphTest.js - Tests the graph and table window

##Bug Tests
Includes scripts which test specific bugs we found.  Put your tests for bugs here.

##Demo Tests
Longer scripts for testing specific problems before demonstrations or classroom use.  (e.g. PAL3)
