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
driver.findElement(webdriver.By.name('u')).sendKeys('dragoon2');
driver.findElement(webdriver.By.name('c')).click();

driver.findElement(webdriver.By.id('createNodeButton_label')).click();

driver.findElement(webdriver.By.id("selectDescription")).click();
driver.findElement(webdriver.By.id("dijit_MenuItem_2_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click();
driver.findElement(webdriver.By.id("dijit_MenuItem_10_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys("24");

driver.findElement(webdriver.By.id("selectUnits")).click();
driver.findElement(webdriver.By.id("dijit_MenuItem_14_text")).click();

driver.findElement(webdriver.By.id("equationBox")).sendKeys("ZZZ").then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("equationDoneButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton_label")).click();

driver.findElement(webdriver.By.id("closeButton_label")).click();

var node = driver.findElement(webdriver.By.id("id10"));
node.getAttribute('style').then(function(style) {
      assert.equal(style, "left: 400px; top: 100px; border: 2px dashed green;");
	  //assert.equal(style, "left: 800px; top: 100px; border: 2px solid green; box-shadow: rgb(0, 0, 0) 0px 0px 5px inset, rgb(0, 0, 0) 0px 0px 10px; background-color: rgb(148, 255, 148);");
});

driver.sleep(1000).then(function() {
	console.log("Passed Syntax Error Test");
});