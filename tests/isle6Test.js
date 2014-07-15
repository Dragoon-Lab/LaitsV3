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
driver.findElement(webdriver.By.name('p')).clear();
driver.findElement(webdriver.By.name('p')).sendKeys('isle6');
driver.findElement(webdriver.By.name('c')).click();

driver.findElement(webdriver.By.id("id21")).click();

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_13_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_16_text")).click().then(function() {
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
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("closeButton_label")).click();



driver.findElement(webdriver.By.id("id22")).click();

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_30_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_43_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("timesButton")).click();
driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_42_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton")).click();

driver.findElement(webdriver.By.id("closeButton_label")).click();



driver.findElement(webdriver.By.id("createNodeButton_label")).click();

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_55_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_59_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys(".00075");

driver.findElement(webdriver.By.id("selectDescription")).click();

driver.findElement(webdriver.By.id("closeButton_label")).click();



driver.findElement(webdriver.By.id("createNodeButton_label")).click();

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_74_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_77_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys(".003");

driver.findElement(webdriver.By.id("selectDescription")).click();

driver.findElement(webdriver.By.id("closeButton_label")).click();

driver.close();

driver.sleep(1000).then(function() {
	console.log("isle6 successfully tested");
});