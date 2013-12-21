<?php
session_start();
//********************************************************************************************************************************
//*********This file is for development to test functionality and is not part of the MVC or the JavaScript implementation
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
            require(["dojo/store/Memory", "/laits/js/json/model"], function(Memory, model) {
                var newModel = new model("Santa", "google.com", 1, 10, "Days");
//                newModel.taskDescription = "This is a test";
//                var id = newModel.addNode();
//                newModel.setNodeName(id, "apples");
//                id = newModel.addNode();
//                newModel.setNodeName(id, "bananas");
//                id = newModel.addNode();
//                newModel.setNodeName(id, "carrots");
//                id = newModel.addNode();
//                newModel.setNodeName(id, "danger berries");
//                id = newModel.addNode();
//                newModel.setNodeName(id, "eggplant");
////                newModel.addNodeInput("id1", "id2");
////                newModel.addNodeInput("id1", "id2");
//                newModel.addNodeInput("id2", "id1");
//                newModel.addNodeInput("id1", "id3");
//
//                newModel.phase = "It works!";
//                newModel.properties.Units = "Months";
//
//
//
//                var oldModel = new model("Rudolph", null, null, null, null);
//                id = oldModel.addNode();
//                oldModel.setNodeName(id, "figs");
//                id = oldModel.addStudentModelNode();
//                oldModel.setStudentModelNodeName(id, "figs");
////                id = oldModel.addNode();
////                oldModel.setNodeName(id, "dates");
////                id = oldModel.addNodeInput("id1", "id2");
////                id = oldModel.addNodeInput("id2", "id1");
//
//                newModel.deleteNode("bananas");
//                newModel.updateOrder("carrots", 1);
//                console.log(newModel.nodes);
//                newModel.buildModel();
//                oldModel.buildModel();
//
//                var string = '{ "Task": {"Phase": "Intro","Type": "Construct","Properties": {"TaskName": \n\
//                        "Rabbits - Intro Problem","URL": "images/rabbit.jpeg","StartTime": 0,"EndTime": 10,\n\
//                        "Units": "Years"},"TaskDescription": \n\
//                        "In this exercise, you will construct a model of how a rabbit population grows when no rabbits die. The first quantity in this model is the population or number of rabbits in the population. Initially, there are 100 rabbits, but the number increases with time. The new population each month is its present value plus the number of births (number of rabbits born each month).  The number of births is equal to the product of the population and the birth rate. The birthrate or the ratio of the number of rabbits born in a month to the rabbit population that month has a fixed value of 0.2.",\n\
//                        "Nodes": [{"Node": {"Type": "stock","ID": "id1","Name": "population","Extra": "no",\n\
//                        "Order": 1,"Units": "","Inputs": [{"ID": "id2"}],"Position": {"X": 250,"Y": 150},\n\
//                        "Initial": 100,"Equation": "+id2","CorrectDescription": "The number of rabbits in the population",\n\
//                        "AttemptCount": {"Desc": 5,"Plan": 1,"Calc": 2},"StudentSolution": {"Desc": "demo",\n\
//                        "Plan": "correct","Calc": "incorrect"}}},{"Node": {"Type": "flow","ID": "id2","Name": \n\
//                        "births","Extra": "no","Order": 2,"Units": "","Inputs": [{"ID": "id1"},{"ID": "id3"}],\n\
//                        "Position": {"X": 350,"Y": 150},"Equation": "id1 * id3","CorrectDescription": \n\
//                        "The number of rabbits born each month","AttemptCount": {"Desc": 1,"Plan": 0,"Calc": 0},\n\
//                        "StudentSolution": {"Desc": "incorrect","Plan": "","Calc": ""}}},{"Node": {"Type": \n\
//                        "constant","ID": "id3","Name": "birth rate","Extra": "no","Order": 3,"Units": "",\n\
//                        "Position": {"x": 300,"y": 250},"Equation": ".2","CorrectDescription": \n\
//                        "The ratio of number of rabbits born in a month to the rabbit population that month",\n\
//                        "AttemptCount": {"Desc": 0,"Plan": 0,"Calc": 0},"StudentSolution": {"Desc": "","Plan": \n\
//                        "","Calc": ""}}}],"StudentModel": [{"Node": {"ID": "id1","Name": "population","Inputs": \n\
//                        [{"ID": "id2"}],"Position": {"X": 250,"Y": 150},"StudentSelections": {"Desc": \n\
//                        "The number of rabbits in the population","Plan": "accumulator","Initial": "10","Equation": \n\
//                        "+ id1"}}},{"Node": {"ID": "id2", "Name": "births","Inputs": [{"ID": "id1"},{"ID": "id3"}],\n\
//                        "Position": {"X": 350,"Y": 150},"StudentSelections": {"Desc": \n\
//                        "The ratio of rabbits born with super powers to ordinary rabbits","Plan": "","Initial": "","Equation": ""}}}]}}';
//                //var string = '{"TaskName" : "' + "Johnny" + '",\n"URL" : "' + "url" +
//                '",\n"StartTime" : ' + 7 + ',\n"EndTime" : ' + 10 +
//                        ',\n"Units" : "' + "units" + '"}';
//                newModel.loadModel(string);
                //alert(newModel.model.Task.TaskDescription);
//                alert(newModel.model.Task.Nodes[1].Node.Equation);
//                alert(JSON.stringify(newModel.model, null, 4));
//                alert("!\n" + newModel.getModel());
                //console.log(newModel.model);



                document.sampleForm.action.value = "save";
                document.sampleForm.id.value = "JohnnyLingo";
                document.sampleForm.section.value = "Muhana";
                document.sampleForm.problem.value = "rabbits";
                document.sampleForm.saveData.value = JSON.stringify(newModel.model, null, 4);
                //document.forms["sampleForm"].submit();


                // building a model from scratch as an author would (in progress)
                var rabbits = new model("Rabbits - Intro Problem", "images/rabbit.jpeg", 0, 10, "Years");
                rabbits.taskDescription = "In this exercise, you will construct a model of how a rabbit population grows when no rabbits die. The first quantity in this model is the population or number of rabbits in the population. Initially, there are 100 rabbits, but the number increases with time. The new population each month is its present value plus the number of births (number of rabbits born each month).  The number of births is equal to the product of the population and the birth rate. The birthrate or the ratio of the number of rabbits born in a month to the rabbit population that month has a fixed value of 0.2.";
                rabbits.phase = "Intro";
                rabbits.type = "Construct";
                var rabbitId = rabbits.addNode();
                rabbits.setNodeAttributes(rabbitId, "pop", true, "stock", false, "rabbits", 100, "+id2", "The number of rabbits in the population");
                rabbits.setNodeAttributes(rabbitId, "population", null, null, null, null, null, null, null);
                //id, name, parent, type, extra, units, initial, equation, correctDesc
                

                rabbits.buildModel();
                alert(JSON.stringify(rabbits.model, null, 4));
                //alert(rabbits.model.Task.Phase);

                //next section saves and loads a JSON formatted string to the database

//                var result;
//                <?php
//                    if ($_SESSION['theResults'] == null) {
//                        echo "alert(\"action value: \" + sampleForm.action.value);";
//                        echo "document.sampleForm.action.value = \"load\";";
//                        echo "document.forms[\"sampleForm\"] . submit();";
//                    } else {
//                        echo "result = " . $_SESSION['theResults'] . ";";
//                        //echo "alert('SESSION variable result: ' + JSON.stringify(result, null, 4));";
//                    }
//                
?>

//                if (result !== null) {
//                    alert("Loaded result: " + JSON.stringify(result, null, 4));
//                    result = null;
//                    <?php
//                        $_SESSION['theResults'] = null;
//                    
?>
//                    var anotherModel = new model("Rudolph", null, null, null, null);
////                    anotherModel.loadModel(result);
////                    alert(result);
//                }

            });
        </script>

    </body>

</html>
