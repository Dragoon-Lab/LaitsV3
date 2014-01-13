<?php
session_start();
//********************************************************************************************************************************
//*********This file is for development to test functionality and is not part of the MVC or the JavaScript implementation.
//*********It shows the model's usefulness in loading or building a model.
//********************************************************************************************************************************
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8"/>
        <title>Tutorial: Hello Dojo!</title>
    </head>
    <body>
        <h1>Object Store Demonstration</h1>

        <!--hidden form to submit POST variables in JavaScript below-->
        <form id="sampleForm" name="sampleForm" method="post" action="../../author-load-save.php">
            <input type="hidden" name="action" id="action" value="">
            <input type="hidden" name="id" id="id" value="">
            <input type="hidden" name="section" id="section" value="">
            <input type="hidden" name="problem" id="problem" value="">
            <input type="hidden" name="saveData" id="saveData" value="">
        </form>

        <!-- load dojo and provide config via data attribute -->
        <script src="//ajax.googleapis.com/ajax/libs/dojo/1.8.5/dojo/dojo.js" data-dojo-config="async: true"></script>



        <script>
            require(["/laits/js/json/model"], function(model) {

                //The next three lines show loading a model from a JSON formated string
                var loadModel = new model(null, null, null, null, null, null);
                var string = '{"task": { "phase": "intro", "type": "construct", "properties": { "taskName": "Rabbits - Intro Problem", "URL": "images/rabbit.jpeg", "startTime": 0, "endTime": 10, "timeStep": 1, "units": "years" }, "taskDescription": "In this exercise, you will construct a model of how a rabbit population grows when no rabbits die. The first quantity in this model is the population or number of rabbits in the population. Initially, there are 100 rabbits, but the number increases with time. The new population each month is its present value plus the number of births (number of rabbits born each month). The number of births is equal to the product of the population and the birth rate. The birthrate or the ratio of the number of rabbits born in a month to the rabbit population that month has a fixed value of 0.2.", "givenModelNodes": [ { "ID": "id1", "name": "population", "type": "stock", "parentNode": false, "extra": false, "order": 1, "units": "rabbits", "inputs": [ { "ID": "id2" } ], "position": { "x": 100, "y": 100 }, "initial": 100, "equation": "+ id2", "correctDesc": "The number of rabbits in the population", "attemptCount": { "desc": 2, "plan": 1, "calc": 1 }, "solution": { "desc": "correct", "plan": "demo", "calc": "correct" } }, { "ID": "id2", "name": "births", "type": "flow", "parentNode": true, "extra": false, "order": 2, "units": "births", "inputs": [ { "ID": "id1" }, { "ID": "id3" } ], "position": { "x": 300, "y": 100 }, "initial": "", "equation": "id1 * id3", "correctDesc": "The number of rabbits born each month", "attemptCount": { "desc": 2, "plan": 1, "calc": 3 }, "solution": { "desc": "correct", "plan": "correct", "calc": "demo" } }, { "ID": "id3", "name": "birth rate", "type": "constant", "parentNode": false, "extra": false, "order": 3, "units": "percent", "inputs": [], "position": { "x": 500, "y": 100 }, "initial": "", "equation": ".2", "correctDesc": "The ratio of number of rabbits born in a month to the rabbit population that month", "attemptCount": { "desc": 2, "plan": 1, "calc": 1 }, "solution": { "desc": "correct", "plan": "correct", "calc": "correct" } } ], "studentModelNodes": [ { "ID": "id1", "name": "population", "inGivenModel": true, "inputs": [ { "ID": "id2" } ], "position": { "x": 700, "y": 100 }, "studentSelections": { "desc": "The number of rabbits in the population", "plan": "stock", "units": "rabbits", "initial": 100, "equation": "+ id2" } }, { "ID": "id2", "name": "births", "inGivenModel": true, "inputs": [ { "ID": "id1" }, { "ID": "id3" } ], "position": { "x": 900, "y": 100 }, "studentSelections": { "desc": "The number of rabbits born each month", "plan": "flow", "units": "births", "initial": null, "equation": "id1 * id3" } }, { "ID": "id3", "name": "birth rate", "inGivenModel": true, "inputs": [], "position": { "x": 1100, "y": 100 }, "studentSelections": { "desc": "The ratio of number of rabbits born in a month to the rabbit population that month", "plan": "constant", "units": "percent", "initial": null, "equation": "0.2" } } ] } }';
                loadModel.loadModel(string);

                // The next section builds a model from scratch as would happen as an author creates a problem
                var rabbits = new model("Rabbits - Intro Problem", "images/rabbit.jpeg", 0, 10, 1, "years");
                rabbits.setTaskDescription("In this exercise, you will construct a model of how a rabbit population grows when no rabbits die. The first quantity in this model is the population or number of rabbits in the population. Initially, there are 100 rabbits, but the number increases with time. The new population each month is its present value plus the number of births (number of rabbits born each month).  The number of births is equal to the product of the population and the birth rate. The birthrate or the ratio of the number of rabbits born in a month to the rabbit population that month has a fixed value of 0.2.");
                rabbits.setPhase("intro");
                rabbits.setType("construct");
                var rabbitID = rabbits.addNode();
                rabbits.setNodeName(rabbitID, "population");
                rabbits.setNodeParent(rabbitID, false);
                rabbits.setNodeType(rabbitID, "accumulator");
                rabbits.setNodeExtra(rabbitID, false);
                rabbits.setNodeUnits(rabbitID, "rabbits");
                rabbits.setNodeInitial(rabbitID, 100);
                rabbits.setNodeEquation(rabbitID, "+ id2");
                rabbits.setNodeCorrectDesc(rabbitID, "The number of rabbits in the population");
                rabbits.addNodeWithAttributes("births", true, "function", false, "births", null, "id1 * id3", "The number of rabbits born each month");
                rabbits.addNodeWithAttributes("birth rate", false, "parameter", false, "percent", null, ".2", "The ratio of number of rabbits born in a month to the rabbit population that month");
                rabbits.addNodeInput(rabbits.getNodeIDByName("births"), rabbits.getNodeIDByName("population"));
                rabbits.addNodeInput(rabbits.getNodeIDByName("population"), rabbits.getNodeIDByName("births"));
                rabbits.addNodeInput(rabbits.getNodeIDByName("birth rate"), rabbits.getNodeIDByName("births"));
                rabbits.addStudentNodeWithName("population");
                rabbits.addStudentNodeWithName("births");
                rabbits.addStudentNodeWithName("birth rate");
                rabbits.addStudentNodeInput(rabbits.getNodeIDByName("births"), rabbits.getNodeIDByName("population"));
                rabbits.addStudentNodeInput(rabbits.getNodeIDByName("population"), rabbits.getNodeIDByName("births"));
                rabbits.addStudentNodeInput(rabbits.getNodeIDByName("birth rate"), rabbits.getNodeIDByName("births"));
                rabbits.setStudentSelection("id1", "description", "The number of rabbits in the population");
                rabbits.setStudentSelection("id1", "type", "function");
                rabbits.setStudentSelection("id1", "type", "parameter");
                rabbits.setToDemo("id1", "type");
                rabbits.setStudentSelection("id1", "units", "rabbits");
                rabbits.setStudentSelection("id1", "initial", 100);
                rabbits.setStudentSelection("id1", "equation", "+ id2");
                
                rabbits.setStudentSelection("id2", "description", "The number of rabbits born each month");
                rabbits.setStudentSelection("id2", "type", "function");
                rabbits.setStudentSelection("id2", "units", "births");
                rabbits.setStudentSelection("id2", "initial", null);
                rabbits.setStudentSelection("id2", "equation", "id1 * id3");

                rabbits.setStudentSelection("id3", "description", "The ratio of number of rabbits born in a month to the rabbit population that month");
                rabbits.setStudentSelection("id3", "type", "parameter");
                rabbits.setStudentSelection("id3", "units", "percent");
                rabbits.setStudentSelection("id3", "initial", null);
                rabbits.setStudentSelection("id3", "equation", "0.2");


                //The next section prints the entire model on the screen, and then uses several getters to access the models information

//                alert(rabbits.getPhase());
//                alert(rabbits.getType());
//                alert(rabbits.getTaskName());
//                alert(rabbits.getURL());
//                alert(rabbits.getStartTime());
//                alert(rabbits.getEndTime());
//                alert(rabbits.getTimeStep());
//                alert(rabbits.getUnits());
//                alert(rabbits.getTaskDescription());
                //alert(rabbits.getNodeIDByName("birth rate"));
//
//                rabbits.deleteStudentNode("id1");
//                rabbits.deleteStudentNode("id2");
//                rabbits.deleteNode("id2");
//                rabbits.deleteNodeInput("id2", "id1");
//                rabbits.deleteNodeInput("id2", "id3");
//                rabbits.deleteNodeInput("id10", "id3");
                document.write(JSON.stringify(rabbits.model, null, 4));
//                alert(rabbits.getNodeAttemptCount("id1", "type"));

                //alert("Order of " + rabbits.getNodeIDByName("birth rates") + ": " + rabbits.getNodeOrder(rabbits.getNodeIDByName("birth rates")));

            });
        </script>

    </body>

</html>
