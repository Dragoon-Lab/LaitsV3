<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8"/>
        <title>Tutorial: Hello Dojo!</title>
    </head>
    <body>
        <h1>Object Store Demonstration</h1>
        <!-- load dojo and provide config via data attribute -->
        <script src="//ajax.googleapis.com/ajax/libs/dojo/1.8.5/dojo/dojo.js" data-dojo-config="async: true"></script>



        <script>
            require(["dojo/store/Memory", "/laits/js/json/model"], function(Memory, model) {
                var newModel = new model("Santa", "google.com", 1, 10, "Days");
                newModel.taskDescription = "This is a test";
                newModel.addNode("apples", null, null);
                newModel.addNode("bananas", null, null);
                newModel.addNode("carrots", null, null);
                newModel.addNode("danger berries", null, null);
                newModel.addNode("eggplant", null, null);
//                newModel.addNodeInput("apples", "bananas");
//                newModel.addNodeInput("apples", "bananas");
                newModel.addNodeInput("bananas", "apples");
                newModel.addNodeInput("bananas", "carrots");

                newModel.phase = "It works!";
                newModel.properties.Units = "Months";



                var oldModel = new model("Rudolph", null, null, null, null);
                oldModel.addNode("figs", 249, 182);
                oldModel.addStudentModelNode("figs");
//                oldModel.addNode("dates", null, null);
//                oldModel.addNodeInput("figs", "dates");
//                oldModel.addNodeInput("dates", "figs");

                newModel.deleteNode("bananas");
                newModel.updateOrder("carrots", 1);
                console.log(newModel.nodes);


//                alert(newModel.getModel());
//                alert(oldModel.getModel());
                var string = '{ "Task": {"Phase": "Intro","Type": "Construct","Properties": {"TaskName": "Rabbits - Intro Problem","URL": "images/rabbit.jpeg","StartTime": 0,"EndTime": 10,"Units": "Years"},"TaskDescription": "In this exercise, you will construct a model of how a rabbit population grows when no rabbits die. The first quantity in this model is the population or number of rabbits in the population. Initially, there are 100 rabbits, but the number increases with time. The new population each month is its present value plus the number of births (number of rabbits born each month).  The number of births is equal to the product of the population and the birth rate. The birthrate or the ratio of the number of rabbits born in a month to the rabbit population that month has a fixed value of 0.2.","Nodes": [{"Node": {"Type": "stock","ID": 1,"Name": "population","Extra": "no","Order": 1,"Units": "","Inputs": [{"Name": "births"}],"Position": {"X": 250,"Y": 150},"Initial": 100,"Equation": "+births","CorrectDescription": "The number of rabbits in the population","AttemptCount": {"Desc": 5,"Plan": 1,"Calc": 2},"StudentSolution": {"Desc": "demo","Plan": "correct","Calc": "incorrect"}}},{"Node": {"Type": "flow","ID": 2,"Name": "births","Extra": "no","Order": 2,"Units": "","Inputs": [{"Name": "population"},{"Name": "birth rate"}],"Position": {"X": 350,"Y": 150},"Equation": "population * birth rate","CorrectDescription": "The number of rabbits born each month","AttemptCount": {"Desc": 1,"Plan": 0,"Calc": 0},"StudentSolution": {"Desc": "incorrect","Plan": "","Calc": ""}}},{"Node": {"Type": "constant","ID": 3,"Name": "birth rate","Extra": "no","Order": 3,"Units": "","Position": {"x": 300,"y": 250},"Equation": ".2","CorrectDescription": "The ratio of number of rabbits born in a month to the rabbit population that month","AttemptCount": {"Desc": 0,"Plan": 0,"Calc": 0},"StudentSolution": {"Desc": "","Plan": "","Calc": ""}}}],"StudentModel": [{"Node": {"Name": "population","Inputs": [{"Name": "births"}],"Position": {"X": 250,"Y": 150},"StudentSelections": {"Desc": "The number of rabbits in the population","Plan": "accumulator","Initial": "10","Equation": "+ births"}}},{"Node": {"Name": "births","Inputs": [{"Name": "population"},{"Name": "birth rate"}],"Position": {"X": 350,"Y": 150},"StudentSelections": {"Desc": "The ratio of rabbits born with super powers to ordinary rabbits","Plan": "","Initial": "","Equation": ""}}}]}}';
                //var string = '{"TaskName" : "' + "Johnny" + '",\n"URL" : "' + "url" +
                        '",\n"StartTime" : ' + 7 + ',\n"EndTime" : ' + 10 +
                        ',\n"Units" : "' + "units" + '"}';
                newModel.loadModel(JSON.parse(string));
                alert(newModel.testModel.Task.StudentModel[1].Node.Name);
                //console.log(newModel.testModel);

            });
        </script>
    </body>

</html>
