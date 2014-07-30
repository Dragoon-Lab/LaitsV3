// Creating a selenium client utilizing webdriverjs
var client = require('webdriverjs').remote({
    desiredCapabilities: {
        // See other browers at: 
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'chrome'
    },
});
var functions = require('./function.js');
var expect = require('chai').expect;
 
describe('Test dragoon website', function(){
    before(function(done) {
        client.init().url('http://localhost/LaitsV3/www/index.html?u=Raichu24&m=STUDENT&sm=feedback&is=algebraic&p=rabbits&s=login.html&c=Continue', done);
    });

    describe('Rabbit Problem', function(){
        it('should hand incorrected response correctly in the accumulator', function(done) {
            client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err){
                client.click('span[id="createNodeButton_label"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "", true);
                    })
                })
            })
            client.click('table[id="selectDescription"]', function(err){
                client.click('td[id="dijit_MenuItem_6_text"]', function(err){
                    client.waitFor('div[id="crisisMessage"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="crisisMessage"]', "You tried to define a parameter for a number you read in the problem.");
                    })
                    client.click('span[id="OkButton_label"]', function(err){
                        client.waitForInvisible('span[id="OkButton_label"]', 1000, function(err){
                            functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the description is incorrect.");
                            functions.checkColor(client, expect, 'table[id="selectDescription"]', "255, 128, 128");
                            functions.checkDisabled(client, expect, ['table[id="selectDescription"]']);
                        })
                    })
                })
            })
            client.click('table[id="selectDescription"]', function(err){
                client.click('td[id="dijit_MenuItem_4_text"]', function(err){
                    client.waitFor('div[id="crisisMessage"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="crisisMessage"]', "The quantity is irrelevant to this problem. Choose a different one.");
                    })
                    client.click('span[id="OkButton_label"]', function(err){
                        client.waitForInvisible('span[id="OkButton_label"]', 1000, function(err){
                            functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the description is incorrect.\nThe value entered for the description is incorrect.");
                            functions.checkColor(client, expect, 'table[id="selectDescription"]', "255, 128, 128");
                            functions.checkDisabled(client, expect, ['table[id="selectDescription"]']);
                        })
                    })
                })    
            })
            client.click('table[id="selectDescription"]', function(err){
                client.click('td[id="dijit_MenuItem_7_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the description is incorrect.\nThe value entered for the description is incorrect.");
                    functions.checkColor(client, expect, 'table[id="selectDescription"]', "255, 128, 128");
                    functions.checkDisabled(client, expect, ['table[id="selectDescription"]']);
                })    
            })
            client.click('table[id="selectDescription"]', function(err){
                client.click('td[id="dijit_MenuItem_6_text"]', function(err){
                    client.waitFor('div[id="crisisMessage"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="crisisMessage"]', "Can you figure out why this is the right type for the node?");
                    })
                    client.click('span[id="OkButton_label"]', function(err){
                        client.waitForInvisible('span[id="OkButton_label"]', 1000, function(err){
                            functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the description is incorrect. The correct answer has been given.");
                            functions.checkColor(client, expect, 'table[id="selectDescription"]', "yellow");
                            functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                        })
                    })
                })    
            })
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_9_text"]', function(err){
                    client.waitFor('div[id="crisisMessage"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="crisisMessage"]', "Your answer is incorrect. Please try again.");
                    })
                    client.click('span[id="OkButton_label"]', function(err){
                        client.waitForInvisible('span[id="OkButton_label"]', 1000, function(err){
                            functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is incorrect.");
                            functions.checkColor(client, expect, 'table[id="typeId"]', "255, 128, 128");
                            functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                        })
                    })
                }) 
            })
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_10_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is incorrect. The correct answer has been given.");
                    functions.checkColor(client, expect, 'table[id="typeId"]', "yellow");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]', 'table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                }) 
            })
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_13_text"]', function(err){
                    client.waitFor('div[id="crisisMessage"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="crisisMessage"]', "Your answer is incorrect.");
                    })
                    client.click('span[id="OkButton_label"]', function(err){
                        client.waitForInvisible('span[id="OkButton_label"]', 1000, function(err){
                            functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the units is incorrect.");
                            functions.checkColor(client, expect, 'table[id="selectUnits"]', "255, 128, 128");
                            functions.checkDisabled(client, expect, ['table[id="selectUnits"]', 'table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                        })
                    })
                }) 
            })
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_14_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the units is incorrect. The correct answer has been given.");
                    functions.checkColor(client, expect, 'table[id="selectUnits"]', "yellow");
                    functions.checkDisabled(client, expect, ['table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                }) 
            })
            client.setValue('textarea[id="equationBox"]', "zzzz", function(err){
                client.click('span[id="equationDoneButton"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "Unknown variable 'zzzz'.");
                    functions.checkDisabled(client, expect, ['table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                })
            })
            client.clearElement('textarea[id="equationBox"]', function(err){});
            client.click('table[id="nodeInputs"]', function(err){
                client.click('td[id="dijit_MenuItem_19_text"]', function(err){
                    client.click('span[id="equationDoneButton"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the equation is incorrect.");
                        functions.checkColor(client, expect, 'textarea[id="equationBox"]', "255, 128, 128");
                        functions.checkDisabled(client, expect, ['table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                    })
                })
            })
            client.clearElement('textarea[id="equationBox"]', function(err){});
            client.click('table[id="nodeInputs"]', function(err){
                client.click('td[id="dijit_MenuItem_22_text"]', function(err){
                    client.click('span[id="equationDoneButton"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the equation is incorrect. The correct answer has been given.");
                        functions.checkColor(client, expect, 'textarea[id="equationBox"]', "yellow");
                        functions.checkDisabled(client, expect, []);
                    })
                })
            })
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id10"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id10"]', "", "solid", "yellow");
                    done();
                })
            })  
        });

        it('should delete a node correctly', function(done) {
            client.click('canvas[id="myCanvas"]', function(err){
                client.rightClick('div[id="id12"]', function(err){
                    client.click('table[widgetid="dijit_Menu_2"]', function(err){
                        client.getAttribute('div[id="id12"]', "style", function(err, style){
                            expect(style).to.equal(null);
                            done();
                        })
                    })
                })
            })
        });

        it('should handle responses in parameter node correctly', function(done){
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('div[id="id11"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        functions.checkColor(client, expect, 'table[id="selectDescription"]', "144, 238, 144");
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "", true);
                        functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                    })
                })
            })
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_29_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is incorrect.");
                    functions.checkColor(client, expect, 'table[id="typeId"]', "255, 128, 128");
                    functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                }) 
            })
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_30_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is incorrect. The correct answer has been given.");
                    functions.checkColor(client, expect, 'table[id="typeId"]', "yellow");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]', 'input[id="initialValue"]']);
                }) 
            })
            client.setValue('input[id="initialValue"]', "1", function(err){
                client.click('div[id="messageBox"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the initial is incorrect.");
                    functions.checkColor(client, expect, 'div[id="widget_initialValue"]', "255, 128, 128");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]', 'input[id="initialValue"]']);
                })
            })
            client.setValue('input[id="initialValue"]', "2", function(err){
                client.click('div[id="messageBox"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the initial is incorrect. The correct answer has been given.");
                    functions.checkColor(client, expect, 'div[id="widget_initialValue"]', "yellow");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]']);
                })
            })
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_33_text"]', function(err){
                    client.waitForInvisible('span[id="OkButton_label"]', 1000, function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the units is incorrect.");
                        functions.checkColor(client, expect, 'table[id="selectUnits"]', "255, 128, 128");
                        functions.checkDisabled(client, expect, ['table[id="selectUnits"]']);
                    })
                }) 
            })
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_34_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the units is incorrect. The correct answer has been given.");
                    functions.checkColor(client, expect, 'table[id="selectUnits"]', "yellow");
                    functions.checkDisabled(client, expect, []);
                }) 
            })
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id11"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id11"]', "", "solid", "yellow");
                    done();
                })
            })
        });

        it("should handle incomplete node correctly", function(done){
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('div[id="id13"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        functions.checkColor(client, expect, 'table[id="selectDescription"]', "144, 238, 144");
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "", true);
                        functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                    })
                })
            })
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_38_text"]', function(err){
                    functions.checkColor(client, expect, 'table[id="selectDescription"]', "144, 238, 144");
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is correct");
                    functions.checkDisabled(client, expect, ['input[id="initialValue"]', 'table[id="selectUnits"]', 'table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                })
            })
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id13"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id13"]', "", "dashed", "green");
                })
            })
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('div[id="id13"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        client.setValue('input[id="initialValue"]', "1", function(err){});
                        client.click('div[id="messageBox"]', function(err){});
                    })
                })
            })
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id13"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id13"]', "", "dashed", "255, 128, 128");
                })
            })
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('div[id="id13"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        client.click('div[id="messageBox"]', function(err){
                            client.click('table[id="selectUnits"]', function(err){
                                client.click('td[id="dijit_MenuItem_44_text"]', function(err){
                                    functions.checkColor(client, expect, 'table[id="selectUnits"]', "255, 128, 128");
                                })
                            })
                        })
                    })
                })
            })
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_43_text"]', function(err){});
            })
            client.setValue('input[id="initialValue"]', "2", function(err){
                client.click('div[id="messageBox"]', function(err){});
            });
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id13"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id13"]', "", "dashed", "yellow");
                })
            })
            client.click('span[id="graphButton_label"]', function(err){
                client.waitForVisible('div[id="solution"]', 1000, function(err){
                    functions.checkMessage(client, expect, 'div[class="dijitDialogPaneContent"]', "Not all nodes have been completed.");
                    client.click('span[title="cancel"]', function(err){});
                })
            })
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('div[id="id13"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        client.setValue('textarea[id="equationBox"]', "growth rate", function(err){
                            client.click('span[id="equationDoneButton"]', function(err){
                                functions.checkColor(client, expect, 'textarea[id="equationBox"]', "255, 128, 128");
                            })
                        })
                    })
                })
            })
            client.click('span[widgetid="undoButton"]', function(err){
                functions.checkMessage(client, expect, 'textarea[id="equationBox"]', "", true);
                done();
            })
        });     
    });

    after(function(done) {
        client.end();
        done();
    });
});