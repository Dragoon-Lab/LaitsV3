# XML #

We will use the following XML definitions for problem files, for problems in the 
database (problems authored for specific sessions), and for the autosave_table 
to store a users progress. The XML will be standard across all three categories 
to ensure readability, portability, and ease of use and modification. 

The format is similar to former ITS’s (LAITS, Java version of Dragoon) to allow 
backward compatibility to already defined problems with little or no 
modification. It changes the way that the student’s graph was being saved to 
match the current model XML. It also removes redundant and deprecated code, such
as removing the old <NodeCount> section or the <Output> section.

The following examples will use portions of the problem “rabbits.xml” to show 
how the new XML document will be modeled. A specification document will also be 
developed.

## Headers and Properties ##

Each XML document will start with the standard header:

<?xml version="1.0" encoding="UTF-8"?>

The main XML document will be surrounded by a <Task> tag.

<Task phase="Intro" type="Construct">

Next the document will define the model’s properties and description. 

<Properties>
        <TaskName>Rabbits - Intro Problem</TaskName>
        <URL>images/rabbit.jpeg</URL>
        <StartTime>0</StartTime>
        <EndTime>10</EndTime>
        <Units>Years</Units>
</Properties>
    
<TaskDescription>
        In this exercise, you will construct a model of how a rabbit population grows when no rabbits die.  NEWLINE
        The first quantity in this model is the population or number of rabbits in the population. Initially, NEWLINE
        there are 100 rabbits, but the number increases with time. The new population each month is its NEWLINE
        present value plus the number of births (number of rabbits born each month).  The number of births NEWLINE
        is equal to the product of the population and the birth rate. The birthrate or the ratio of the NEWLINE
        number of rabbits born in a month to the rabbit population that month has a fixed value of 0.2.       
</TaskDescription>

<TaskName> is self-explanatory, “URL” gives the location of the picture used in the model, <StartTime> and <EndTime> are used to define how long the problem will model behavior, and <Units> gives the unit that <StartTime> and <EndTime> follow (for example, in the above example, the behavior will be modeled from 0 to 10 years).

The main changes are grouping the model’s properties in the <Properties> tags and removing the redundant <NodeCount> tags.


Model Definition


<Nodes>
        <Node type="stock" id="1" name="population" extra="no">
            <Order>1</Order>
            <Inputs>
                <Name>births</Name>
            </Inputs>
            <Position x="250" y="150"/>
            <Initial>100</Initial>           
            <Equation>+births</Equation>
            <CorrectDescription>The number of rabbits in the population</CorrectDescription>
            <AttemptCount desc="5" plan="1" calc="2"/>
        </Node>
</Nodes>

All of the nodes will be contained in the <Nodes> tags, each surrounded by <Node> tags. 

The “type” attribute defines the node as “stock” (accumulator), “flow” (equation), or “constant” (parameter). The attribute “id” assigns an identifier that is unique to the problem, “name” is self-explanatory, “extra” specifies if the node is used in the completed model (extra nodes are allowed to test student understanding of the problem).

When a problem has multiple nodes the <Order> tag can be used to define which order nodes should be completed while in “coached” mode. <Inputs> lists the other nodes that help define that node. <Position> allows the author to define where to place the node on the screen, <Initial> is an optional node that is needed for stock (accumulator) nodes. <Equation> gives the equation to compute the node, or lists a number for constant (parameter) nodes. <CorrectDescription> lists the correct definition in the Description tab of the node editor. <AttemptCount> defines how many times the user attempted the Description, Plan, and Calculations tabs before getting a correct answer. <AttemptCount> is the only part of the <Nodes> section that will change as the user progresses to ensure that the user’s progress is saved if a node is deleted. Thus, when a user loads the problem all attributes (desc, plan, and calc) will be set to ‘0’ and will increment as the user attempts each tab of each node. The student’s progress will be saved as an XML string following this format in the autosave_table of Dragoon’s MySQL database.


Student Model

<StudentModel>        
        <<Node type="stock" id="1" name="population" extra="no">
            <Order>1</Order>
            <Inputs>
                <Name>births</Name>
            </Inputs>
            <Position x="208" y="143"/>
            <Initial>100</Initial>
            <Equation>+births</Equation>
            <CorrectDescription>The number of rabbits in the population</CorrectDescription>
            <Progress>
                <Description status="demo">The number of rabbits in the population</Description>
                <Plan status="correct">accumulator</Plan>
                <Calculation status="incorrect" initial="10" equation="+ births">
                    <Inputs>
                        <Name>births</Name>
                    </Inputs>
                </Calculation>
            </Progress>
        </Node>
</StudentModel>

The student model serves two purposes. First, it allows the author to define nodes he/she would like present when the problem is loaded for the first time. Second, it tracks progress by the student.

The student model is nearly identical to the model definition (inside the <Nodes> tags), except that it records the current location of the node in the <Position> tags, if it has been moved by the student. Also, instead of the <AttemptCount> tags, it uses <Progress> tags to show the progress the student has made. The attribute “status” tracks if the students latest attempt was correct, incorrect, or if the student gave up or attempted too many incorrect answers and was given the correct answer. The node can then be colored appropriately.

Example of complete XML document

<?xml version="1.0" encoding="UTF-8"?>

<Task phase="Intro" type="Construct">
    
    <Properties>
        <TaskName>Rabbits - Intro Problem</TaskName>
        <URL>images/rabbit.jpeg</URL>
        <StartTime>0</StartTime>
        <EndTime>10</EndTime>
        <Units>Years</Units>
    </Properties>
    
    <TaskDescription>
        In this exercise, you will construct a model of how a rabbit population grows when no rabbits die.  NEWLINE
        The first quantity in this model is the population or number of rabbits in the population. Initially, NEWLINE
        there are 100 rabbits, but the number increases with time. The new population each month is its NEWLINE
        present value plus the number of births (number of rabbits born each month).  The number of births NEWLINE
        is equal to the product of the population and the birth rate. The birthrate or the ratio of the NEWLINE
        number of rabbits born in a month to the rabbit population that month has a fixed value of 0.2.       
    </TaskDescription>

    <Nodes>
        
        <Node type="stock" id="1" name="population" extra="no">
            <Order>1</Order>
            <Inputs>
                <Name>births</Name>
            </Inputs>
            <Position x="250" y="150"/>
            <Initial>100</Initial>           
            <Equation>+births</Equation>
            <CorrectDescription>The number of rabbits in the population</CorrectDescription>
            <AttemptCount desc="5" plan="1" calc="2"/>
        </Node>

        <Node type="flow" id="2" name="births" extra="no">
            <Order>2</Order>
            <Inputs>
                <Name>population</Name>
                <Name>birth rate</Name>
            </Inputs>
            <Position x="350" y="150"/>
            <Equation>population * birth rate</Equation>
            <CorrectDescription>The number of rabbits born each month</CorrectDescription>
            <AttemptCount desc="1" plan="0" calc="0"/>
        </Node>

        <Node type="constant" id="3" name="birth rate" extra="no">
            <Order>3</Order>
            <Inputs/>
            <Position x="400" y="250"/>
            <Equation>.2</Equation>
            <CorrectDescription>The ratio of number of rabbits born in a month to the rabbit population that month</CorrectDescription>
            <AttemptCount desc="0" plan="0" calc="0"/>
        </Node>
        
    </Nodes>

    <StudentModel>

        <Node type="stock" id="1" name="population" extra="no">
            <Order>1</Order>
            <Inputs>
                <Name>births</Name>
            </Inputs>
            <Position x="208" y="143"/>
            <Initial>100</Initial>
            <Equation>+births</Equation>
            <CorrectDescription>The number of rabbits in the population</CorrectDescription>
            <Progress>
                <Description status="demo">The number of rabbits in the population</Description>
                <Plan status="correct">accumulator</Plan>
                <Calculation status="incorrect" initial="10" equation="+ births">
                    <Inputs>
                        <Name>births</Name>
                    </Inputs>
                </Calculation>
            </Progress>
        </Node>

        <Node type="flow" id="2" name="births" extra="no">
            <Order>2</Order>
            <Inputs>
                <Name>population</Name>
                <Name>birth rate</Name>
            </Inputs>
            <Position x="350" y="150"/>
            <Equation>population * birth rate</Equation>
            <CorrectDescription>The number of rabbits born each month</CorrectDescription>
            <Progress>
                <Description status="incorrect">The ratio of rabbits born with super powers to ordinary rabbits</Description>
                <Plan status=""></Plan>
                <Calculation status=""></Calculation>
            </Progress>
        </Node>
        
    </StudentModel>

</Task>

