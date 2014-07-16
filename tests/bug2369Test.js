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
driver.findElement(webdriver.By.name('u')).sendKeys('Dragon5');
var mode = driver.findElement(webdriver.By.name('m'))
mode.click();
mode.findElement(webdriver.By.css("option[value='AUTHOR']")).click()
driver.findElement(webdriver.By.name('a')).sendKeys("random3");
driver.findElement(webdriver.By.name('c')).click();

driver.findElement(webdriver.By.id('descButton_label')).click();
driver.findElement(webdriver.By.id('authorSetImage')).sendKeys("notARealImage");
driver.findElement(webdriver.By.id('authorSetDescription')).sendKeys("Once");
driver.findElement(webdriver.By.id('descCloseButton_label')).click();

driver.findElement(webdriver.By.id('descButton_label')).click();
driver.findElement(webdriver.By.id('authorSetImage')).getText().then(function(text) {
	assert.equal("", text);
});

driver.navigate().refresh();

driver.findElement(webdriver.By.id('descButton_label')).click();
driver.findElement(webdriver.By.id('authorSetImage')).clear();
driver.findElement(webdriver.By.id('authorSetImage')).sendKeys("http://upload.wikimedia.org/wikipedia/commons/5/5b/Ultraviolet_image_of_the_Cygnus_Loop_Nebula_crop.jpg");
driver.findElement(webdriver.By.id('descCloseButton_label')).click();