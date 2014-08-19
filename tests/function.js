//Check to see if the all entries except the ones given in ids are disabled in the node editor
exports.checkDisabled = function(client, expect, ids){
    var listIds = ['table[id="selectDescription"]', 'table[id="typeId"]', 'input[id="initialValue"]', 'table[id="selectUnits"]', 'table[id="nodeInputs"]', 'textarea[id="equationBox"]']
    for (var i in ids){
        for (var j in listIds){
            if (ids[i] == listIds[j]){
                listIds.splice(j, 1);
            }
        }
    }
    for (var disabledId in listIds){
        client.getAttribute(listIds[disabledId], "aria-disabled", function(err, bool){
            expect(bool).to.equal("true");
        })
    }
}

//Check to see if the dom object with the given id has the message
//if equal is true, it check for equal instead of contains
exports.checkMessage = function(client, expect, id, message, equal){
    if (equal){
        client.getText(id, function(err, text){
            expect(text).to.equal(message);
        })
    }
    else{
        client.getText(id, function(err, text){
            expect(text).to.have.string(message);
        })
    }
}

//Check to see if the dom object with the given id has the given color in style
//if borderType and borderColor has value, check for borderType and borderColor
exports.checkColor = function(client, expect, id, color, borderType, borderColor){
    client.getAttribute(id, "style", function(err, style){
        expect(style).to.have.string(color);
        if (borderType != undefined && borderColor != undefined){
            expect(style).to.have.string(borderType);
            expect(style).to.have.string(borderColor);
        }
    })
}

//Check to see if the dom object with the given value
exports.checkMessage = function(client, expect, id, message){
    client.getValue(id, function(err, value){
        expect(value).to.equal(message);
    })
}

//get the current time and date
exports.getDate = function(){
    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth()+1;
    var yyyy = date.getFullYear();
    var seconds = date.getTime()/1000;

    date = mm+'/'+dd+'/'+yyyy+'/'+seconds;
    return date;
}