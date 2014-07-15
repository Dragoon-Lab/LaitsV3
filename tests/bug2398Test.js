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
driver.findElement(webdriver.By.name('u')).sendKeys('Dragon6');
driver.findElement(webdriver.By.name('c')).click();

driver.findElement(webdriver.By.id("createNodeButton_label")).click();

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_2_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_10_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys("dfd");

driver.findElement(webdriver.By.id("selectUnits")).click();

driver.findElement(webdriver.By.className("dijitTooltipContainer"));

driver.close();

driver.sleep(1000).then(function() {
	console.log("bug2398 successfully tested");
});
