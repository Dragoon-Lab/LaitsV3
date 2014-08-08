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
        client.init().url('http://localhost/LaitsV3/www/index.html?u=Random&m=AUTHOR&sm=feedback&is=algebraic&p=rabbits&s=login.html&a=Onix8&c=Continue', done);
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
            client.setValue('input[id="setDescription"]', "Fish Population", function(err){
                client.click('div[id="messageBox"]', function(err){
                    functions.checkColor(client, expect, 'div[id="widget_setDescription"]', "46, 254, 247");
                })
            })
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_3_text"]', function(err){
                    functions.checkColor(client, expect, 'table[id="typeId"]', "46, 254, 247");
                })
            })
            client.setValue('input[id="initialValue"]', "dfa", function(err){
                client.click('div[id="messageBox"]', function(err){
                    client.waitForVisible('div[id="dijit_TooltipDialog_1"]', 1000, function(err){
                        functions.checkMessage(client, expect, 'div[id="dijit_TooltipDialog_1"]', "Non-numeric data not accepted");
                    })
                })
            })
            client.setValue('input[id="initialValue"]', "10", function(err){
                client.click('div[id="messageBox"]', function(err){
                    functions.checkColor(client, expect, 'div[id="widget_initialValue"]', "46, 254, 247");
                })
            })
            client.setValue('input[id="setUnits"]', "fish", function(err){
                client.click('div[id="messageBox"]', function(err){
                    functions.checkColor(client, expect, 'div[id="widget_setUnits"]', "46, 254, 247");
                })
            })
            client.setValue('textarea[id="equationBox"]', "net growth", function(err){
                client.click('span[id="equationDoneButton_label"]', function(err){
                    functions.checkColor(client, expect, 'textarea[id="equationBox"]', "46, 254, 247");
                })
            })
            client.click('span[id="undoButton_label"]', function(err){
                functions.checkMessage(client, expect, 'textarea[id="equationBox"]', "", true);
            })
            client.setValue('textarea[id="equationBox"]', "net growth", function(err){
                client.click('span[id="equationDoneButton_label"]', function(err){
                })
            })
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id1"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id1"]', "", "solid", "gray");
                    done();
                })
            })
        });

        it("should save all information in the node correctly", function(done){
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('div[id="id1"]', function(err){
                    client.waitForInvisible('div[id="id1"]', 1000, function(err){
                        functions.checkValue(client, expect, 'input[id="setName"]', "Fish Population", true);
                        functions.checkValue(client, expect, 'input[id="setDescription"]', "Fish Population", true);
                        functions.checkMessage(client, expect, 'span[class="dijitReset dijitInline dijitSelectLabel dijitValidationTextBoxLabel', "Accumulator", true);
                        functions.checkValue(client, expect, 'input[id="initialValue"]', "10", true);
                        functions.checkValue(client, expect, 'input[id="setUnits"]', "fish", true);
                        functions.checkMessage(client, expect, 'textarea[id="equationBox"]', "net growth", true);
                        client.click('span[id="closeButton_label"]', function(err){
                            client.waitForVisible('div[id="id1"]', 1000, function(err){});
                            done();
                        })
                    })
                })
            })
        });

        // it("should make a correct function", function(done){
        //     client.click('canvas[id="myCanvas"]', function(err){
        //         client.pause(2000, function(err){
        //         client.click('div[id="id2"]', function(err){
        //             client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
        //                 functions.checkMessage(client, expect, 'div[id="messageBox"]', "node name is available for use", true);
        //             })
        //         })
        //         })
        //     })
        //     client.setValue('input[id="setDescription"]', "net growth", function(err){
        //         client.click('div[id="messageBox"]', function(err){
        //             functions.checkColor(client, expect, 'div[id="widget_setDescription"]', "46, 254, 247");
        //         })
        //     })
        //     client.click('table[id="typeId"]', function(err){
        //         client.click('td[id="dijit_MenuItem_9_text"]', function(err){
        //             functions.checkColor(client, expect, 'table[id="typeId"]', "46, 254, 247");
        //         })
        //     })
        //     client.setValue('input[id="setUnits"]', "fish/year", function(err){
        //         client.click('div[id="messageBox"]', function(err){
        //             functions.checkColor(client, expect, 'div[id="widget_setUnits"]', "46, 254, 247");
        //         })
        //     })
        //     client.setValue('textarea[id="equationBox"]', "Fish Population * growth rate", function(err){
        //         client.click('span[id="equationDoneButton_label"]', function(err){
        //             functions.checkColor(client, expect, 'textarea[id="equationBox"]', "46, 254, 247");
        //         })
        //     })
        //     client.click('span[id="closeButton_label"]', function(err){
        //         client.waitForVisible('div[id="id2"]', 1000, function(err){
        //             functions.checkColor(client, expect, 'div[id="id2"]', "", "solid", "gray");
        //             done();
        //         })
        //     })
        // });

        // it("should make a correct parameter", function(done){
        //     client.click('canvas[id="myCanvas"]', function(err){
        //         client.pause(2000, function(err){
        //         client.click('div[id="id3"]', function(err){
        //             client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
        //                 functions.checkMessage(client, expect, 'div[id="messageBox"]', "node name is available for use", true);
        //             })
        //         })
        //         })
        //     })
        //     client.setValue('input[id="setDescription"]', "growth rate", function(err){
        //         client.click('div[id="messageBox"]', function(err){
        //             functions.checkColor(client, expect, 'div[id="widget_setDescription"]', "46, 254, 247");
        //         })
        //     })
        //     client.click('table[id="typeId"]', function(err){
        //         client.click('td[id="dijit_MenuItem_12_text"]', function(err){
        //             functions.checkColor(client, expect, 'table[id="typeId"]', "46, 254, 247");
        //         })
        //     })
        //     client.click('input[id="initialValue"]', function(err){
        //         client.setValue('input[id="initialValue"]', ".1", function(err){
        //             client.click('div[id="messageBox"]', function(err){
        //                 functions.checkColor(client, expect, 'div[id="widget_initialValue"]', "46, 254, 247");
        //             })
        //         })
        //     })
        //     client.setValue('input[id="setUnits"]', "1/year", function(err){
        //         client.click('div[id="messageBox"]', function(err){
        //             functions.checkColor(client, expect, 'div[id="widget_setUnits"]', "46, 254, 247");
        //         })
        //     })
        //     client.click('span[id="closeButton_label"]', function(err){
        //         client.waitForVisible('div[id="id3"]', 1000, function(err){
        //             functions.checkColor(client, expect, 'div[id="id3"]', "", "solid", "gray");
        //             done();
        //         })
        //     })
        // });

        // it("should have the right table", function(done){
        //     //Check for the values in the 2nd, 3rd, 11th and last row of the table
        //     client.click('canvas[id="myCanvas"]', function(err){
        //         client.click('span[id="tableButton_label"]', function(err){
        //             client.waitForInvisible('span[id="tableButton_label"]', 1000, function(err){
        //                 functions.checkMessage(client, expect, "//tbody/tr[2]/td[1]", "0.000", true);
        //                 functions.checkMessage(client, expect, "//tbody/tr[2]/td[2]", "10.0", true);
        //                 functions.checkMessage(client, expect, "//tbody/tr[2]/td[3]", "1.00", true);
        //                 functions.checkMessage(client, expect, "//tbody/tr[3]/td[1]", "0.5000", true);
        //                 functions.checkMessage(client, expect, "//tbody/tr[3]/td[2]", "10.5", true);
        //                 functions.checkMessage(client, expect, "//tbody/tr[3]/td[3]", "1.05", true);
        //                 functions.checkMessage(client, expect, "//tbody/tr[10]/td[1]", "4.000", true);
        //                 functions.checkMessage(client, expect, "//tbody/tr[10]/td[2]", "14.8", true);
        //                 functions.checkMessage(client, expect, "//tbody/tr[10]/td[3]", "1.48", true);
        //             })
        //         })
        //     })
        //     //Check for value of 2nd, 3rd, 11th, and last row of table after growth rate is changed
        //     client.setValue('input[id="textTable_id3"]', ".2", function(err){
        //         client.click('div[id="table"]', function(err){
        //             functions.checkMessage(client, expect, "//tbody/tr[2]/td[1]", "0.000", true);
        //             functions.checkMessage(client, expect, "//tbody/tr[2]/td[2]", "10.0", true);
        //             functions.checkMessage(client, expect, "//tbody/tr[2]/td[3]", "2.00", true);
        //             functions.checkMessage(client, expect, "//tbody/tr[3]/td[1]", "0.5000", true);
        //             functions.checkMessage(client, expect, "//tbody/tr[3]/td[2]", "11.0", true);
        //             functions.checkMessage(client, expect, "//tbody/tr[3]/td[3]", "2.20", true);
        //             functions.checkMessage(client, expect, "//tbody/tr[10]/td[1]", "4.000", true);
        //             functions.checkMessage(client, expect, "//tbody/tr[10]/td[2]", "21.4", true);
        //             functions.checkMessage(client, expect, "//tbody/tr[10]/td[3]", "4.29", true);
        //         })
        //     })
        //     //Test the growth rate slider
        //     client.dragAndDrop('div[aria-valuemin="-4.605170185988092"]', 'div[class="dijitSliderIncrementIconH"]', function(err){
        //         functions.checkMessage(client, expect, "//tbody/tr[2]/td[1]", "0.000", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[2]/td[2]", "10.0", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[2]/td[3]", "10.0", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[3]/td[1]", "0.5000", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[3]/td[2]", "15.0", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[3]/td[3]", "15.0", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[10]/td[1]", "4.000", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[10]/td[2]", "256", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[10]/td[3]", "256", true);
        //     })
        //     //test the initial population slider
        //     client.dragAndDrop('div[aria-valuemin="0"]', 'div[class="dijitSliderDecrementIconH"]', function(err){
        //         functions.checkMessage(client, expect, "//tbody/tr[2]/td[1]", "0.000", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[2]/td[2]", "1.00", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[2]/td[3]", "1.00", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[3]/td[1]", "0.5000", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[3]/td[2]", "1.50", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[3]/td[3]", "1.50", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[10]/td[1]", "4.000", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[10]/td[2]", "25.6", true);
        //         functions.checkMessage(client, expect, "//tbody/tr[10]/td[3]", "25.6", true);
        //         done();
        //     })
        // });
    });
 
    after(function(done) {
        client.end();
        done();
    });
});