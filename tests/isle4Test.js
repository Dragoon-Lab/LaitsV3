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
driver.findElement(webdriver.By.name('u')).sendKeys('Dragon112');
driver.findElement(webdriver.By.name('p')).clear();
driver.findElement(webdriver.By.name('p')).sendKeys('isle4');
driver.findElement(webdriver.By.name('c')).click();

driver.findElement(webdriver.By.id('id11')).click();

driver.findElement(webdriver.By.id('typeId')).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_8_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_11_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("timesButton")).click();
driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_14_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("divideButton")).click();
driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_12_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("closeButton_label")).click();



driver.findElement(webdriver.By.id("createNodeButton_label")).click();

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_20_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_25_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys("500");

driver.findElement(webdriver.By.id("selectDescription")).click();

driver.findElement(webdriver.By.id("closeButton_label")).click();

driver.close();

driver.sleep(1000).then(function() {
	console.log("isle4 successfully tested");
});