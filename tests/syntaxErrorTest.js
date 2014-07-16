var webdriver = require('selenium-webdriver'),

	assert = require('assert'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer("C:/Selenium/selenium-server-standalone-2.42.2.jar", {
  port: 4444
});

server.start();

var driver = new webdriver.Builder().
    usingServer(server.address()).
    withCapabilities(webdriver.Capabilities.firefox()).
    build();

driver.get('http://localhost/LaitsV3/www/index.html?u=dragoon7&m=STUDENT&sm=feedback&is=algebraic&p=rabbits&s=login.html&c=Continue').then(function() {
    driver.sleep(2000);
});

driver.findElement(webdriver.By.id('createNodeButton_label')).click().then(function() {
    driver.sleep(1000);
});

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

driver.findElement(webdriver.By.id("initialValue")).sendKeys("24").then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("selectUnits")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_14_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationBox")).sendKeys("ZZZ").then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("equationDoneButton_label")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the initial is correct.\nThe value entered for the units is correct.\nUnknown variable 'ZZZ'.");
});

driver.findElement(webdriver.By.id("equationDoneButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});

var node = driver.findElement(webdriver.By.id("id10"));
node.getAttribute('style').then(function(style) {
      assert.equal(style, "left: 400px; top: 100px; border: 2px dashed green;");
	  //assert.equal(style, "left: 800px; top: 100px; border: 2px solid green; box-shadow: rgb(0, 0, 0) 0px 0px 5px inset, rgb(0, 0, 0) 0px 0px 10px; background-color: rgb(148, 255, 148);");
});

driver.findElement(webdriver.By.id("id10")).click();

driver.findElement(webdriver.By.id("equationBox")).sendKeys("net growth").then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton_label")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "Quantity 'net growth' not defined yet.\nThe value entered for the equation is correct.");
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});

/*var node = driver.findElement(webdriver.By.id("id10"));
node.getAttribute('style').then(function(style) {
    var re = /148, 255, 148/;
	assert(re.test(style));
});*/

driver.close();

driver.sleep(1000).then(function() {
	console.log("Passed Syntax Error Test");
});