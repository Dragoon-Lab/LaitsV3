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

driver.get('http://localhost/LaitsV3/www/login.html');
driver.findElement(webdriver.By.name('u')).sendKeys('Dragon3');
var mode = driver.findElement(webdriver.By.name('m'))
mode.click();
mode.findElement(webdriver.By.css("option[value='AUTHOR']")).click()
driver.findElement(webdriver.By.name('a')).sendKeys("random");
driver.findElement(webdriver.By.name('c')).click();

driver.findElement(webdriver.By.id("createNodeButton_label")).click();
driver.findElement(webdriver.By.id("setName")).sendKeys("Fish Population");
