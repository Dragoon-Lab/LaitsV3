# XML #

Proposed XML format for Dragoon problems.

The following XML format is proposed for problem files, for problems in the 
database (e.g. problems authored for specific sessions), and to store the user's 
progress in the autosave_table on the database. The XML will be standard across 
all three categories to ensure readability, portability, and ease of use and 
modification. 

The format is similar to former ITS's (LAITS, Java version of Dragoon) to allow 
backward compatibility to already defined problems with little or no 
modification. It changes the way that the student's progress was being saved to 
match XML problems. It also removes redundant and deprecated code, such
as removing the old &lt;NodeCount> or the &lt;Output> tags.

The following examples will use portions of the problem "rabbits.xml" to show 
how the new XML document is proposed to be modeled. A specification document 
will also be developed.

## Headers and Properties ##

Each XML document will start with the standard header and the XML schema 
validation information:

    <?xml version="1.0" encoding="UTF-8"?>
    <model:DragoonProblem xmlns:model="http://localhost/laits/js/xml"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xsi:schemaLocation="http://localhost/laits/js/xml dragoon_schema.xsd">

The main part of the XML document will be surrounded by a &lt;Task> tag with 
attributes to specify different types of problems.

    <Task phase="Intro" type="Construct">

Next the document will define the model's properties and description. 

    <Properties>
        <TaskName>Rabbits - Intro Problem</TaskName>
        <URL>images/rabbit.jpeg</URL>
        <StartTime>0</StartTime>
        <EndTime>10</EndTime>
        <Units>Years</Units>
    </Properties>
    
    <TaskDescription>
        In this exercise, you will construct a model of how a rabbit population  NEWLINE
        grows when no rabbits die. The first quantity in this model is the  NEWLINE
        population or number of rabbits in the population. Initially, there are NEWLINE 
        100 rabbits, but the number increases with time. The new population each NEWLINE
        month is its present value plus the number of births (number of rabbits NEWLINE
        born each month).  The number of births is equal to the product of the NEWLINE
        population and the birth rate. The birthrate or the ratio of the number NEWLINE
        of rabbits born in a month to the rabbit population that month has a NEWLINE
        fixed value of 0.2.       
    </TaskDescription>

&lt;TaskName> is self-explanatory, &lt;URL> gives the location of the picture used 
in the model, &lt;StartTime> and &lt;EndTime> are used to define how long the 
problem will model behavior, and &lt;Units> gives the time measurement unit that
&lt;StartTime> and &lt;EndTime> follow (in the code above, the behavior will be
modeled from 0 to 10 years).

The main changes are grouping the model's properties in the &lt;Properties> tags 
and removing the redundant &lt;NodeCount> tags.


## Model Definition ##

Following the headers and properties is the definition of the model. From this 
section the program will know what nodes the student should construct to solve 
the problem.

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

All of the nodes will be contained within the &lt;Nodes> tags, with each 
individual node surrounded by &lt;Node> tags (note the plural "Nodes" and the 
singular "Node"). 

The "type" attribute defines the node as "stock" (accumulator), "flow" 
(equation), or "constant" (parameter). The attribute "id" assigns an identifier 
that is unique to the problem, "name" is self-explanatory, "extra" specifies if 
the node is used in the completed model (extra nodes are allowed to test a 
student's understanding of the problem).

When a problem has multiple nodes the &lt;Order> tag can be used to define the 
order that nodes should be completed while in "coached" mode. &lt;Inputs> lists the 
other nodes that help define that node. &lt;Position> allows the author to define 
where to place the node on the screen, &lt;Initial> is an optional node that is 
needed for stock (accumulator) nodes. &lt;Equation> gives the equation to compute 
the node, or lists a number for constant (parameter) nodes. &lt;CorrectDescription> 
lists the correct definition in the Description tab of the node editor. 
&lt;AttemptCount> defines how many times the user attempted the Description, 
Plan, and Calculations tabs before getting a correct answer. 

&lt;AttemptCount> 
is the only part of the &lt;Nodes> section that will change as the user 
progresses. It will ensure that the user's attempts are saved if a node is deleted. 
Thus, when a user loads the problem all attributes (desc, plan, and calc) will 
be set to "0" and will increment as the user attempts each tab of each node. The 
student's progress will be saved as an XML string following this format in the 
autosave_table of Dragoon's MySQL database.


## Student Model ##

The next section, the student model serves two purposes. First, it allows the 
author to define nodes he/she would like present when the problem is loaded for 
the first time (this functionality was in the former &lt;GivenModel> tags). 
Second, it tracks progress by the student. 

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
                <Calculation status="incorrect" initial="10">+ births</Calculation>
            </Progress>
        </Node>
    </StudentModel>

The student model is nearly identical to the model definition (inside the 
&lt;Nodes> tags), except that it records the current location of the node in the 
&lt;Position> tags, if it has been changed by the instructor or the student. 
Also, instead of the &lt;AttemptCount> tags, it uses &lt;Progress> tags to show 
the progress the student has made. The attribute "status" tracks if the 
student's latest attempt was correct, incorrect, or demo (if the student gave up or 
attempted too many incorrect answers and was given the correct answer). The node 
can then be colored appropriately by the program. 

Within the &lt;Calculation> tags the "initial" attribute is optional in the XML
schema and is used by accumulator nodes. It lists the initial value that is 
currently entered. The values between the &lt;Description>, &lt;Plan>, and 
&lt;Calculation> tags also show the currently entered value.

## Example of a Complete XML Document ##

The following code shows how the new XML specification will appear in an XML 
document. It shows the problem partially completed by the student, with one node
completed and a second node partially completed.

    <?xml version="1.0" encoding="UTF-8"?>
    <model:DragoonProblem xmlns:model="http://localhost/laits/js/xml"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xsi:schemaLocation="http://localhost/laits/js/xml dragoon_schema.xsd">

        <Task phase="Intro" type="Construct">

            <Properties>
                <TaskName>Rabbits - Intro Problem</TaskName>
                <URL>images/rabbit.jpeg</URL>
                <StartTime>0</StartTime>
                <EndTime>10</EndTime>
                <Units>Years</Units>
            </Properties>

            <TaskDescription>
                In this exercise, you will construct a model of how a rabbit population  NEWLINE
                grows when no rabbits die. The first quantity in this model is the  NEWLINE
                population or number of rabbits in the population. Initially, there are NEWLINE 
                100 rabbits, but the number increases with time. The new population each NEWLINE
                month is its present value plus the number of births (number of rabbits NEWLINE
                born each month).  The number of births is equal to the product of the NEWLINE
                population and the birth rate. The birthrate or the ratio of the number NEWLINE
                of rabbits born in a month to the rabbit population that month has a NEWLINE
                fixed value of 0.2.        
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
                    <CorrectDescription>
                        The ratio of number of rabbits born in a month to the rabbit population that month
                    </CorrectDescription>
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
                        <Calculation status="incorrect" initial="10">+ births</Calculation>
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
                        <Description status="incorrect">
                            The ratio of rabbits born with super powers to ordinary rabbits
                        </Description>
                        <Plan status=""></Plan>
                        <Calculation status=""></Calculation>
                    </Progress>
                </Node>

            </StudentModel>

        </Task>
    </model:DragoonProblem>
