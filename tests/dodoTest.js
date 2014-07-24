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
    withCapabilities(webdriver.Capabilities.phantomjs()).
    build();

driver.get('http://localhost/LaitsV3/www/login.html');
driver.findElement(webdriver.By.name('u')).sendKeys('Dragon11');
driver.findElement(webdriver.By.name('p')).clear();
driver.findElement(webdriver.By.name('p')).sendKeys('Dodos');
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

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_7_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys("1000").then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("minusButton")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_11_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});



driver.findElement(webdriver.By.id("createNodeButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_16_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_21_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_23_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("timesButton")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_25_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});



driver.findElement(webdriver.By.id("createNodeButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_30_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_32_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys(".2").then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("closeButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.close().then(function() {
    driver.sleep(1000);
});

driver.sleep(1000).then(function() {
	console.log("Dodo problem successfully tested");
});