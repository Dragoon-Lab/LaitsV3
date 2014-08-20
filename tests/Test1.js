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
        client.init().url('http://localhost/LaitsV3/www/index.html?u=Pikachu18&m=STUDENT&sm=feedback&is=algebraic&p=rabbits&s=login.html&c=Continue', done);
    });
 
    describe('Rabbit Problem', function(){
        it('should have the correct accumulator', function(done) {
            //open node editor and check contents inside the node editor
            client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err){
                client.click('span[id="createNodeButton_label"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "", true);
                        functions.checkDisabled(client, expect, ['table[id="selectDescription"]']);
                    })
                })
            })
            //Selects the correct description and check contents inside the node editor
            client.click('table[id="selectDescription"]', function(err){
                client.click('td[id="dijit_MenuItem_5_text"]', function(err){
                    client.waitFor('div[id="crisisMessage"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="crisisMessage"]', "Green means correct. Good job!", true);
                    })
                })
                client.click('span[id="OkButton_label"]', function(err){
                    client.waitForInvisible('span[id="OkButton_label"]', 1000, function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the description is correct.");
                        functions.checkColor(client, expect, 'table[id="selectDescription"]', "144, 238, 144");
                        functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                    })
                })                            
            })
            //Selects the correct type and check contents inside node editor afterward
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_10_text"]', function(err){
                    client.waitFor('div[id="crissiMessage"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="crisisMessage"]', "Green means correct.", true);
                    })
                })
                client.click('span[id="OkButton_label"]', function(err){
                    client.waitForInvisible('span[id="OkButton_label"]', 1000, function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is correct.");
                        functions.checkColor(client, expect, 'table[id="typeId"]', "144, 238, 144");
                        functions.checkDisabled(client, expect, ['input[id="initialValue"]', 'table[id="selectUnits"]', 'table[id="nodeInputs"]', 'textarea[id="equationBox"]'])
                    })
                })
            })
            //Types in the correct initial value and check contents inside node editor afterward
            client.setValue('input[id="initialValue"]', "24", function(err){
                client.click('table[id="selectDescription"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the initial is correct.");
                    functions.checkColor(client, expect, 'div[id="widget_initialValue"]', "144, 238, 144");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]', 'table[id="nodeInputs"]', 'textarea[id="equationBox"]'])
                })
            })
            //Selects and correct units and check contents inside node editor afterward
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_14_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the units is correct.");
                    functions.checkColor(client, expect, 'table[id="selectUnits"]', "144, 238, 144");
                    functions.checkDisabled(client, expect, ['table[id="nodeInputs"]', 'textarea[id="equationBox"]'])
                })
            })
            //check contents inside node editor after correct equation is entered
            client.click('table[id="nodeInputs"]', function(err){
                client.click('td[id="dijit_MenuItem_18_text"]', function(err){
                    client.click('span[id="equationDoneButton"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the equation is correct.");
                        functions.checkColor(client, expect, 'textarea[id="equationBox"]', "144, 238, 144");
                        functions.checkDisabled(client, expect, []);
                    })
                })
            })
            //check the style of the node after the node editor is closed  
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id10"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id10"]', "148, 255, 148", "solid", "green");
                    done();
                })
            })                
        });

        it("should have the correct function node", function(done){
            //Check the contents inside the node editor after opening the node
            client.click('canvas[id="myCanvas"]', function(err){
                client.waitForVisible('div[id="id11"]', 3000, function(err){
                    client.click('div[id="id11"]', function(err){
                        client.waitForInvisible('span[id="createNodeButton_label"]', 2000, function(err){
                            functions.checkColor(client, expect, 'table[id="selectDescription"]', "144, 238, 144");
                            functions.checkMessage(client, expect, 'div[id="messageBox"]', "", true);
                            functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                        })
                    })
                })
            })
            //Check the contents of the node editor after type is selected
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_28_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is correct.");
                    functions.checkColor(client, expect, 'table[id="typeId"]', "144, 238, 144");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]', 'table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                })
            })
            //Check contents of the node editor after units is selected correctly
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_32_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the units is correct.");
                    functions.checkColor(client, expect, 'table[id="selectUnits"]', "144, 238, 144");
                    functions.checkDisabled(client, expect, ['table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                })
            })
            //Check contents of the node editor after equation is entered correctly
            client.click('table[id="nodeInputs"]', function(err){
                client.click('td[id="dijit_MenuItem_36_text"]', function(err){
                    client.click('span[id="timesButton_label"]', function(err){
                    })
                })
            })
            client.click('table[id="nodeInputs"]', function(err){
                client.click('td[id="dijit_MenuItem_38_text"]', function(err){
                    client.click('span[id="equationDoneButton"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the equation is correct.");
                        functions.checkColor(client, expect, 'textarea[id="equationBox"]', "144, 238, 144");
                        functions.checkDisabled(client, expect, []);
                    })
                })
            })
            //check the style of the node after the node editor is closed  
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id11"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id11"]', "148, 255, 148", "solid", "green");
                    done();
                })
            })
        });

        it("should have the correct parameter node", function(done){
            //Check the contents inside the node editor after opening the node
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('div[id="id12"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        functions.checkColor(client, expect, 'table[id="selectDescription"]', "144, 238, 144");
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "", true);
                        functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                    })
                })
            })
            //Check the contents of the node editor after type is selected
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_43_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is correct.");
                    functions.checkColor(client, expect, 'table[id="typeId"]', "144, 238, 144");
                    functions.checkDisabled(client, expect, ['input[id="initialValue"]', 'table[id="selectUnits"]'])
                })
            })
            //Check contents of the node editor after initial value is selected correctly
            client.setValue('input[id="initialValue"]', ".3", function(err){
                client.click('table[id="selectDescription"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the initial is correct.");
                    functions.checkColor(client, expect, 'div[id="widget_initialValue"]', "144, 238, 144");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]'])
                })
            })
            //Check contents of the node editor after the units is selected correctly
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_47_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the units is correct.");
                    functions.checkColor(client, expect, 'table[id="selectUnits"]', "144, 238, 144");
                    functions.checkDisabled(client, expect, [])
                })
            })
            //check the style of the node after the node editor is closed  
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForInvisible('span[id="closeButton_label"]', 1000, function(err){
                    client.click('span[id="OkButton_label"]', function(err){
                        client.waitForVisible('div[id="id12"]', 1000, function(err){
                            functions.checkColor(client, expect, 'div[id="id12"]', "148, 255, 148", "solid", "green");
                            done();
                        })
                    })
                })
            })
        });

        it("should have the right table", function(done){
            //Check for the values in the 2nd, 3rd, 11th and last row of the table
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('span[id="tableButton_label"]', function(err){
                    client.waitForInvisible('span[id="tableButton_label"]', 1000, function(err){
                        functions.checkMessage(client, expect, "//tbody/tr[2]/td[1]", "1859", true);
                        functions.checkMessage(client, expect, "//tbody/tr[2]/td[2]", "24.0", true);
                        functions.checkMessage(client, expect, "//tbody/tr[2]/td[3]", "7.20", true);
                        functions.checkMessage(client, expect, "//tbody/tr[3]/td[1]", "1860", true);
                        functions.checkMessage(client, expect, "//tbody/tr[3]/td[2]", "31.2", true);
                        functions.checkMessage(client, expect, "//tbody/tr[3]/td[3]", "9.36", true);
                        functions.checkMessage(client, expect, "//tbody/tr[10]/td[1]", "1867", true);
                        functions.checkMessage(client, expect, "//tbody/tr[10]/td[2]", "196", true);
                        functions.checkMessage(client, expect, "//tbody/tr[10]/td[3]", "58.7", true);
                        functions.checkMessage(client, expect, "//tbody/tr[62]/td[1]", "1919", true);
                        functions.checkMessage(client, expect, "//tbody/tr[62]/td[2]", "1.65e+8", true);
                        functions.checkMessage(client, expect, "//tbody/tr[62]/td[3]", "4.94e+7", true);
                    })
                })
            })
            //Check for value of 2nd, 3rd, 11th, and last row of table after growth rate is changed
            client.clearElement('input[id="textTable_id12"]', function(err){
                client.setValue('input[id="textTable_id12"]', ".2", function(err){
                    client.click('div[id="table"]', function(err){
                        functions.checkMessage(client, expect, "//tbody/tr[2]/td[1]", "1859", true);
                        functions.checkMessage(client, expect, "//tbody/tr[2]/td[2]", "24.0", true);
                        functions.checkMessage(client, expect, "//tbody/tr[2]/td[3]", "4.80", true);
                        functions.checkMessage(client, expect, "//tbody/tr[3]/td[1]", "1860", true);
                        functions.checkMessage(client, expect, "//tbody/tr[3]/td[2]", "28.8", true);
                        functions.checkMessage(client, expect, "//tbody/tr[3]/td[3]", "5.76", true);
                        functions.checkMessage(client, expect, "//tbody/tr[10]/td[1]", "1867", true);
                        functions.checkMessage(client, expect, "//tbody/tr[10]/td[2]", "103", true);
                        functions.checkMessage(client, expect, "//tbody/tr[10]/td[3]", "20.6", true);
                        functions.checkMessage(client, expect, "//tbody/tr[62]/td[1]", "1919", true);
                        functions.checkMessage(client, expect, "//tbody/tr[62]/td[2]", "1.35e+6", true);
                        functions.checkMessage(client, expect, "//tbody/tr[62]/td[3]", "2.70e+5", true);
                    })
                })
            })
            //close and reopen table, then test 2nd, 3rd, 11th and last row after initial population is changed
            client.click('span[class="dijitDialogCloseIcon"]', function(err){
                client.waitForInvisible('span[class="dijitDialogCloseIcon"]', 1000, function(err){
                    client.click('canvas[id="myCanvas"]', function(err){
                        client.click('span[id="tableButton_label"]', function(err){
                            client.waitForInvisible('span[id="tableButton_label"]', 1000, function(err){
                                client.setValue('input[id="textTable_id10"]', "20", function(err){
                                    client.click('//tbody/tr[62]/td[3]', function(err){
                                        functions.checkMessage(client, expect, "//tbody/tr[2]/td[1]", "1859", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[2]/td[2]", "20.0", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[2]/td[3]", "6.00", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[3]/td[1]", "1860", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[3]/td[2]", "26.0", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[3]/td[3]", "7.80", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[10]/td[1]", "1867", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[10]/td[2]", "163", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[10]/td[3]", "48.9", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[62]/td[1]", "1919", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[62]/td[2]", "1.37e+8", true);
                                        functions.checkMessage(client, expect, "//tbody/tr[62]/td[3]", "4.12e+7", true);
                                    })
                                })
                            })
                        })
                    })
                })
            })
            //Test the growth rate slider
            client.dragAndDrop('div[aria-valuemin="-3.506557897319982"]', 'div[class="dijitSliderIncrementIconH"]', function(err){
                functions.checkMessage(client, expect, "//tbody/tr[2]/td[1]", "1859", true);
                functions.checkMessage(client, expect, "//tbody/tr[2]/td[2]", "20.0", true);
                functions.checkMessage(client, expect, "//tbody/tr[2]/td[3]", "60.0", true);
                functions.checkMessage(client, expect, "//tbody/tr[3]/td[1]", "1860", true);
                functions.checkMessage(client, expect, "//tbody/tr[3]/td[2]", "80.0", true);
                functions.checkMessage(client, expect, "//tbody/tr[3]/td[3]", "240", true);
                functions.checkMessage(client, expect, "//tbody/tr[10]/td[1]", "1867", true);
                functions.checkMessage(client, expect, "//tbody/tr[10]/td[2]", "1.31e+6", true);
                functions.checkMessage(client, expect, "//tbody/tr[10]/td[3]", "3.93e+6", true);
                functions.checkMessage(client, expect, "//tbody/tr[62]/td[1]", "1919", true);
                functions.checkMessage(client, expect, "//tbody/tr[62]/td[2]", "2.66e+37", true);
                functions.checkMessage(client, expect, "//tbody/tr[62]/td[3]", "7.98e+37", true);
            })
            //test the initial population slider
            client.dragAndDrop('div[aria-valuemin="0.8754687373538999"]', 'div[class="dijitSliderDecrementIconH"]', function(err){
                functions.checkMessage(client, expect, "//tbody/tr[2]/td[1]", "1859", true);
                functions.checkMessage(client, expect, "//tbody/tr[2]/td[2]", "2.40", true);
                functions.checkMessage(client, expect, "//tbody/tr[2]/td[3]", "7.20", true);
                functions.checkMessage(client, expect, "//tbody/tr[3]/td[1]", "1860", true);
                functions.checkMessage(client, expect, "//tbody/tr[3]/td[2]", "9.60", true);
                functions.checkMessage(client, expect, "//tbody/tr[3]/td[3]", "28.8", true);
                functions.checkMessage(client, expect, "//tbody/tr[10]/td[1]", "1867", true);
                functions.checkMessage(client, expect, "//tbody/tr[10]/td[2]", "1.57e+5", true);
                functions.checkMessage(client, expect, "//tbody/tr[10]/td[3]", "4.72e+5", true);
                functions.checkMessage(client, expect, "//tbody/tr[62]/td[1]", "1919", true);
                functions.checkMessage(client, expect, "//tbody/tr[62]/td[2]", "3.19e+36", true);
                functions.checkMessage(client, expect, "//tbody/tr[62]/td[3]", "9.57e+36", true);
                done();
            })
        });
    });
 
    after(function(done) {
        client.end();
        done();
    });
});