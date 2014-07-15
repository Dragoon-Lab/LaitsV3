var webdriver = require('selenium-webdriver'),
	assert = require('assert'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer("C:/Selenium/selenium-server-standalone-2.42.2.jar", {
  port: 4444
});

server.start();

/*var driver = new webdriver.Builder().
   usingServer(server.address()).
   withCapabilities(webdriver.Capabilities.chrome()).
   build();*/

var driver = new webdriver.Builder().
    usingServer(server.address()).
    withCapabilities(webdriver.Capabilities.firefox()).
    build();

driver.get('http://dragoon.asu.edu/');
var selection = driver.findElement(webdriver.By.id('main-nav'))
selection.click();
selection.findElement(webdriver.By.css("a[href='demo/public-login.html']")).click();

var category = driver.findElement(webdriver.By.id('problem_category'));
