var webdriver = require('selenium-webdriver'),
	assert = require('assert'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer("C:/Selenium/selenium-server-standalone-2.42.2.jar", {
  port: 4444
});

server.start();

var driver = new webdriver.Builder().
    usingServer(server.address()).
    withCapabilities(webdriver.Capabilities.phantomjs()).
    build();

driver.get('http://localhost/LaitsV3/www/login.html');
driver.findElement(webdriver.By.name('u')).sendKeys('Dragon1');
driver.findElement(webdriver.By.name('p')).clear();
driver.findElement(webdriver.By.name('p')).sendKeys('isle2');
driver.findElement(webdriver.By.name('c')).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("createNodeButton_label")).click().then(function() {
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

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.");
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_7_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.");
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys("20").then(function() {
    driver.sleep(1000);
	driver.findElement(webdriver.By.id("selectDescription")).click();
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the initial is correct.");
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_12_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the initial is correct.\nQuantity 'moose births' not defined yet.\nThe value entered for the equation is correct.");
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});

var node = driver.findElement(webdriver.By.id("id4"));
node.getAttribute('style').then(function(style){
	var re = /148, 255, 148/;
	assert(re.test(style));
});





driver.findElement(webdriver.By.id("createNodeButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_17_text")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.");
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_21_text")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.");
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_23_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("timesButton")).click();
driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_24_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nQuantity 'moose birth rate' not defined yet.\nThe value entered for the equation is correct.");
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});

var node = driver.findElement(webdriver.By.id("id5"));
node.getAttribute('style').then(function(style){
	var re = /148, 255, 148/;
	assert(re.test(style));
});



driver.findElement(webdriver.By.id("createNodeButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_29_text")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.");
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_32_text")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.");
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys(".2").then(function() {
    driver.sleep(1000);
	driver.findElement(webdriver.By.id("selectDescription")).click();
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the initial is correct.");
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

var node3 = driver.findElement(webdriver.By.id("id6"));
node3.getAttribute('style').then(function(style) {
    var re = /148, 255, 148/;
	assert(re.test(style));
});

driver.close();

driver.sleep(1000).then(function() {
	console.log("isle2 successfully tested");
});