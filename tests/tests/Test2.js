// Creating a selenium client utilizing webdriverjs
var client = require('webdriverjs').remote({
    desiredCapabilities: {
        // See other browers at: 
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'chrome'
    },
});
//import functions modle
var functions = require('./function.js');
//import chai assertion library
var expect = require('chai').expect;
 
describe('Test dragoon website', function(){
	//init website to author mode
    before(function(done) {
        var date = functions.getDate();
        client.init().url('http://localhost/LaitsV3/www/index.html?u='+date+'&m=STUDENT&sm=feedback&is=algebraic&p=rabbits&s=login.html&c=Continue', done);
    });

    describe('Rabbit Problem', function(){
    	//check incorrect responses in the function
        it('should hand incorrected response correctly in the function', function(done) {
            client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err){
            	//check the initial message box in the node editor
                client.click('span[id="createNodeButton_label"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "", true);
                    })
                })
            })
            //check the description selector and the popup resulted from the incorrect response
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
			//check another incorrect response in the description selector
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
			//check yet another incorrect response in the description editor and the corresponding results
            client.click('table[id="selectDescription"]', function(err){
                client.click('td[id="dijit_MenuItem_7_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the description is incorrect.\nThe value entered for the description is incorrect.");
                    functions.checkColor(client, expect, 'table[id="selectDescription"]', "255, 128, 128");
                    functions.checkDisabled(client, expect, ['table[id="selectDescription"]']);
                })    
            })
            //Check another incorrect response so that dragoon will give the correct answer
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
			//Check an incorrect entry into the type and check corresponding entry
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
            //Check yet another into the type and check generator given correct response
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_10_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is incorrect. The correct answer has been given.");
                    functions.checkColor(client, expect, 'table[id="typeId"]', "yellow");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]', 'table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                }) 
            })
            //Check the units selector for an incorrect selection response
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
			//Check the units selector for another incorrect selection response and wait for correct response
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_14_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the units is incorrect. The correct answer has been given.");
                    functions.checkColor(client, expect, 'table[id="selectUnits"]', "yellow");
                    functions.checkDisabled(client, expect, ['table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                }) 
            })
            //Check the equation box for an syntax error
            client.setValue('textarea[id="equationBox"]', "zzzz", function(err){
                client.click('span[id="equationDoneButton"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "Unknown variable 'zzzz'.");
                    functions.checkDisabled(client, expect, ['table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                })
            })
            //clear element in equation box
            client.clearElement('textarea[id="equationBox"]', function(err){});
            //Check for an incorrect entry ersponse in the equation box
            client.click('table[id="nodeInputs"]', function(err){
                client.click('td[id="dijit_MenuItem_19_text"]', function(err){
                    client.click('span[id="equationDoneButton"]', function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the equation is incorrect.");
                        functions.checkColor(client, expect, 'textarea[id="equationBox"]', "255, 128, 128");
                        functions.checkDisabled(client, expect, ['table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                    })
                })
            })
            //Check another incorrect response in the equation box and wait for correct response from equation box
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
            //close the node editor and check the node in the canvas
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id10"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id10"]', "", "solid", "yellow");
                    done();
                })
            })  
        });
		
		//Delete one of the node created and check if the node is deleted
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
        	//check the node editor for select description is entered correctly and message box
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('div[id="id11"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        functions.checkColor(client, expect, 'table[id="selectDescription"]', "144, 238, 144");
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "", true);
                        functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                    })
                })
            })
            //Check the type selector for an incorrect selection response
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_29_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is incorrect.");
                    functions.checkColor(client, expect, 'table[id="typeId"]', "255, 128, 128");
                    functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                }) 
            })
            //Check the type selector for another incorrect selection response
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_30_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is incorrect. The correct answer has been given.");
                    functions.checkColor(client, expect, 'table[id="typeId"]', "yellow");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]', 'input[id="initialValue"]']);
                }) 
            })
            //check the initial value selector and incorrect selection responses
            client.setValue('input[id="initialValue"]', "1", function(err){
                client.click('div[id="messageBox"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the initial is incorrect.");
                    functions.checkColor(client, expect, 'div[id="widget_initialValue"]', "255, 128, 128");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]', 'input[id="initialValue"]']);
                })
            })
            //check the initial value selector and incorrect selection responses along with wait for correct responses
            client.setValue('input[id="initialValue"]', "2", function(err){
                client.click('div[id="messageBox"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the initial is incorrect. The correct answer has been given.");
                    functions.checkColor(client, expect, 'div[id="widget_initialValue"]', "yellow");
                    functions.checkDisabled(client, expect, ['table[id="selectUnits"]']);
                })
            })
            //check the units selector and incorrect units responses
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_33_text"]', function(err){
                    client.waitForInvisible('span[id="OkButton_label"]', 1000, function(err){
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the units is incorrect.");
                        functions.checkColor(client, expect, 'table[id="selectUnits"]', "255, 128, 128");
                        functions.checkDisabled(client, expect, ['table[id="selectUnits"]']);
                    })
                }) 
            })
            //check the units selector and incorrect units responses along with wait for correct responses
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_34_text"]', function(err){
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the units is incorrect. The correct answer has been given.");
                    functions.checkColor(client, expect, 'table[id="selectUnits"]', "yellow");
                    functions.checkDisabled(client, expect, []);
                }) 
            })
            //close the node editor and check the node in the canvas
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id11"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id11"]', "", "solid", "yellow");
                    done();
                })
            })
        });

        it("should handle incomplete node correctly", function(done){
        	//click of one of the new nodes created on canvas and check message box inside
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('div[id="id13"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        functions.checkColor(client, expect, 'table[id="selectDescription"]', "144, 238, 144");
                        functions.checkMessage(client, expect, 'div[id="messageBox"]', "", true);
                        functions.checkDisabled(client, expect, ['table[id="typeId"]']);
                    })
                })
            })
            //select the correct type and check the responses
            client.click('table[id="typeId"]', function(err){
                client.click('td[id="dijit_MenuItem_38_text"]', function(err){
                    functions.checkColor(client, expect, 'table[id="selectDescription"]', "144, 238, 144");
                    functions.checkMessage(client, expect, 'div[id="messageBox"]', "The value entered for the type is correct");
                    functions.checkDisabled(client, expect, ['input[id="initialValue"]', 'table[id="selectUnits"]', 'table[id="nodeInputs"]', 'textarea[id="equationBox"]']);
                })
            })
            //close the node editor and check the node border
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id13"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id13"]', "", "dashed", "green");
                })
            })
            //select an incorrect response in the initial value box
            client.click('canvas[id="myCanvas"]', function(err){
                client.click('div[id="id13"]', function(err){
                    client.waitForInvisible('span[id="createNodeButton_label"]', 1000, function(err){
                        client.setValue('input[id="initialValue"]', "1", function(err){});
                        client.click('div[id="messageBox"]', function(err){});
                    })
                })
            })
            //close the node editor and check the ndoe border
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id13"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id13"]', "", "dashed", "255, 128, 128");
                })
            })
            //select an incorrect unit
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
            //select another incorrect unit and wait for correct responses from dragoon
            client.click('table[id="selectUnits"]', function(err){
                client.click('td[id="dijit_MenuItem_43_text"]', function(err){});
            })
            //select another incorrect initial value and wait for correct responses from dragoon
            client.setValue('input[id="initialValue"]', "2", function(err){
                client.click('div[id="messageBox"]', function(err){});
            });
            //close node editor and check node border
            client.click('span[id="closeButton_label"]', function(err){
                client.waitForVisible('div[id="id13"]', 1000, function(err){
                    functions.checkColor(client, expect, 'div[id="id13"]', "", "dashed", "yellow");
                })
            })
            //click graph and see if graph generate correct message
            client.click('span[id="graphButton_label"]', function(err){
                client.waitForVisible('div[id="solution"]', 1000, function(err){
                    functions.checkMessage(client, expect, 'div[class="dijitDialogPaneContent"]', "Not all nodes have been completed.");
                    client.click('span[title="cancel"]', function(err){});
                })
            })
            //check the undo button in the label
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