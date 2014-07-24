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
driver.findElement(webdriver.By.name('u')).sendKeys('Dragon');
driver.findElement(webdriver.By.name('p')).clear();
driver.findElement(webdriver.By.name('p')).sendKeys('isle5');
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
driver.findElement(webdriver.By.id("dijit_MenuItem_9_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("OkButton_label")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys("2");

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_14_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("minusButton")).click();
driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_15_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton")).click();

driver.findElement(webdriver.By.id("closeButton_label")).click();



driver.findElement(webdriver.By.id("createNodeButton_label")).click();

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_21_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_27_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_29_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("timesButton")).click();
driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_30_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton")).click();

driver.findElement(webdriver.By.id("closeButton_label")).click();



driver.findElement(webdriver.By.id("createNodeButton_label")).click();

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_39_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_44_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_46_text")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("timesButton")).click();
driver.findElement(webdriver.By.id("nodeInputs")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_50_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("equationDoneButton")).click();

driver.findElement(webdriver.By.id("closeButton_label")).click();



driver.findElement(webdriver.By.id("createNodeButton_label")).click();

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_54_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_59_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys(".75");

driver.findElement(webdriver.By.id("selectDescription")).click();

driver.findElement(webdriver.By.id("closeButton_label")).click();



driver.findElement(webdriver.By.id("createNodeButton_label")).click();

driver.findElement(webdriver.By.id("selectDescription")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_68_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("typeId")).click().then(function() {
    driver.sleep(1000);
});
driver.findElement(webdriver.By.id("dijit_MenuItem_70_text")).click().then(function() {
    driver.sleep(1000);
});

driver.findElement(webdriver.By.id("initialValue")).sendKeys(".67");

driver.findElement(webdriver.By.id("selectDescription")).click();

driver.findElement(webdriver.By.id("closeButton_label")).click();

driver.close();

driver.sleep(1000).then(function() {
	console.log("isle5 successfully tested");
});