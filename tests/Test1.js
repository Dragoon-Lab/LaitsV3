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

driver.get('http://localhost/LaitsV3/www/index.html?u=webdriver24&m=STUDENT&sm=feedback&is=algebraic&p=rabbits&s=login.html&c=Continue').then(function() {
    driver.sleep(2000);
});

driver.findElement(webdriver.By.id('createNodeButton_label')).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_2_text")).click().then(function() {
    driver.sleep(2000);
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
driver.findElement(webdriver.By.id("dijit_MenuItem_10_text")).click().then(function() {
    driver.sleep(2000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.");
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys("24").then(function() {
    driver.sleep(1000);
	driver.findElement(webdriver.By.id("selectDescription")).click();
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the initial is correct.");
});

driver.findElement(webdriver.By.id("selectUnits")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_14_text")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the initial is correct.\nThe value entered for the units is correct.");
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_19_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("equationDoneButton_label")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the initial is correct.\nThe value entered for the units is correct.\nQuantity 'net growth' not defined yet.\nThe value entered for the equation is correct.");
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});

var node = driver.findElement(webdriver.By.id("id10"));
node.getAttribute('style').then(function(style){
	var re = /148, 255, 148/;
	assert(re.test(style));
});



driver.findElement(webdriver.By.id('createNodeButton_label')).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_27_text")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.");
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_35_text")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.");
});

driver.findElement(webdriver.By.id("selectUnits")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_39_text")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the units is correct.");
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_42_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("timesButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_44_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton_label")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the units is correct.\nQuantity 'growth rate' not defined yet.\nThe value entered for the equation is correct.");
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});

var node2 = driver.findElement(webdriver.By.id("id11"));
node2.getAttribute('style').then(function(style) {
    var re = /148, 255, 148/;
	assert(re.test(style));
});



driver.findElement(webdriver.By.id('createNodeButton_label')).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_52_text")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.");
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_57_text")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.");
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys(".3").then(function() {
    driver.sleep(1000);
	driver.findElement(webdriver.By.id("selectDescription")).click();
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the initial is correct.");
});

driver.findElement(webdriver.By.id("selectUnits")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_64_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("equationDoneButton_label")).click().then(function() {
    driver.sleep(1000);
});

var messageBox = driver.findElement(webdriver.By.id("messageBox"));
messageBox.getText().then(function(text){
	assert.equal(text, "The value entered for the description is correct.\nThe value entered for the type is correct.\nThe value entered for the initial is correct.\nThe value entered for the units is correct.");
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

var node3 = driver.findElement(webdriver.By.id("id12"));
node3.getAttribute('style').then(function(style) {
    var re = /148, 255, 148/;
	assert(re.test(style));
});

driver.findElement(webdriver.By.id("tableButton_label")).click().then(function() {
    driver.sleep(1000);
});

var entry = driver.findElement(webdriver.By.xpath("//tbody/tr[2]/td[3]"));
entry.getText().then(function(text){
	assert.equal(text, "7.20");
});

var entry = driver.findElement(webdriver.By.xpath("//tbody/tr[3]/td[2]"));
entry.getText().then(function(text){
	assert.equal(text, "31.2");
});

var entry = driver.findElement(webdriver.By.xpath("//tbody/tr[10]/td[3]"));
entry.getText().then(function(text){
	assert.equal(text, "58.7");
});

driver.findElement(webdriver.By.id("textTable_id12")).clear();
driver.findElement(webdriver.By.id("textTable_id12")).sendKeys("0.2");
driver.findElement(webdriver.By.xpath("//tbody/tr[10]/td[3]")).click().then(function(){
	driver.sleep(1000);
});

var entry = driver.findElement(webdriver.By.xpath("//tbody/tr[2]/td[3]"));
entry.getText().then(function(text){
	assert.equal(text, "4.80");
});

var entry = driver.findElement(webdriver.By.xpath("//tbody/tr[3]/td[2]"));
entry.getText().then(function(text){
	assert.equal(text, "28.8");
});

var entry = driver.findElement(webdriver.By.xpath("//tbody/tr[10]/td[3]"));
entry.getText().then(function(text){
	assert.equal(text, "20.6");
});

driver.findElement(webdriver.By.className("dijitDialogCloseIcon")).click().then(function(){
	driver.sleep(1000);
});
driver.findElement(webdriver.By.id("tableButton_label")).click().then(function() {
	driver.sleep(1000);
});

/*driver.findElement(webdriver.By.id("textTable_id10")).clear();
driver.findElement(webdriver.By.id("textTable_id10")).sendKeys("20");
driver.findElement(webdriver.By.xpath("//tbody/tr[10]/td[3]")).click().then(function(){
	driver.sleep(1000);
});

var entry = driver.findElement(webdriver.By.xpath("//tbody/tr[2]/td[3]"));
entry.getText().then(function(text){
	assert.equal(text, "6.00");
});

var entry = driver.findElement(webdriver.By.xpath("//tbody/tr[3]/td[2]"));
entry.getText().then(function(text){
	assert.equal(text, "26.0");
});

var entry = driver.findElement(webdriver.By.xpath("//tbody/tr[10]/td[3]"));
entry.getText().then(function(text){
	assert.equal(text, "48.9");
});*/

driver.close();

driver.sleep(1000).then(function(){
	console.log("perfect node test passed");
});