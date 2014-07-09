var webdriver = require('selenium-webdriver'),
	assert = require('assert'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer("C:/Selenium/selenium-server-standalone-2.42.2.jar", {
  port: 4444
});

// Use webdriverjs to create a Selenium Client
var client = require(webdriver).remote({
    desiredCapabilities: {
        // You may choose other browsers
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'phantomjs'
    },
    // webdriverjs has a lot of output which is generally useless
    // However, if anything goes wrong, remove this to see more details
    logLevel: 'silent'
});
 
client.init();

client.url('http://example.com/')
client.getTitle(function(title){
    console.log('Title is', title);
});
client.setValue('#field', 'value');
client.submitForm();
client.end();