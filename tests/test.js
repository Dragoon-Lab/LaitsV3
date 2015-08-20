var sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;
var await = sync.await;  // Wrap this around asynchronous functions. Returns 2nd arg to callback
var defer = sync.defer;  // Pass this as the callback function to asynchronous functions
var assert = require('chai').assert;

var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};
var client = webdriverio.remote(options);
var dtest = require('./scripts/dtestlib');

/*function testfun(){
    await(client.init(defer()));
    await(client.url('http://www.google.com',defer()));
    var title = await(client.title(defer())).value;
    assert(title == "Google", "Expected \"Google\" but got"+title);
}*/

describe("Simple test", function() {
    describe("inner test", function(){
        it ('should return "Google"', async(function(){


            //dtest.testfun(client);

            //dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
            //                          ["section","regression-testing"],
            //                        ["logging","true"]]);
            //sync.fiber(function(){

            
            await(client.init(defer()));
            await(client.url('http://www.google.com',defer()));
            var title = await(client.title(defer())).value;
            assert(title == "Google", "Expected \"Google\" but got"+title);
        


            //await(client.end(defer()));
            //done();
            //})
    /*client.init()
        .url('http://www.google.com')
        .title(function(err, sync.defer) {
            console.log('Title was: ' + res.value);
        }))
        .end();*/
        }));
    });

    after(function(done){
        client.end(done());
    });
})
