// Creating a selenium client utilizing webdriverjs
var client = require('webdriverjs').remote({
    desiredCapabilities: {
        // See other browers at: 
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'chrome'
    },
});
//import chai assertion library
var expect = require('chai').expect;
//import functions module
var functions = require('./function.js');

describe('Test dragoon website', function(){
    //start client and redirect to dragoon page for a new problem
    before(function(done) {
        client.init().url('http://localhost/LaitsV3/www/index.html?u=Random&m=AUTHOR&sm=feedback&is=algebraic&p=rabbits&s=login.html&a=Onix2&c=Continue', done);
    });
 
    describe('Author mode', function(){
        it("should make a correct accumulator", function(done){
            client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err){
                client.click('span[id="createNodeButton_label"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "", true);
                    })
                })
            })
            client.setValue('input[id="setName"]', "Fish Population", function(err){
                client.click('div[id="messageBox"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "node name is available for use");
                    functions.checkColor(client, expect, 'div[id="widget_setName"]', "46, 254, 247");
                })
            })
        })
    });
 
    after(function(done) {
        client.end();
        done();
    });
});