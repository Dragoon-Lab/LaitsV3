# JSON Format #

## Proposed JSON format for Dragoon problems. ##

The following JSON format is proposed for problem files, for problems in the 
database (e.g. problems authored for specific sessions), and to store the user's 
progress in the autosave_table on the database. This JSON format is proposed to 
be standard across the three categories just mentioned to ensure readability, 
portability, and ease of use and modification. 

The format is different from former Intelligent Tutoring Systems (LAITS, Java 
version of Dragoon) in that they used XML to store their problems. Because 
JavaScript uses JSON naturally we are proposing to use it for the JavaScript 
version of Dragoon. The proposed JSON format is similar to the format used in 
older XML problems in Dragoon to allow easierconversion of problems that have 
previously been defined. It is significantly different than what was being saved 
in the autosave_table. This is to allow it to match the other problems. This new 
format also attempts to remove redundant and deprecated code that existed in the 
XML formats.

The following examples show the conversion of the problem "rabbits.xml" into the 
new JSON format to show how the new format will be modeled. 

## General Formatting Conventions ##

JSON is a language that defines elements and attributes in name/value pairings.
For more information see http://www.json.org/. For the JavaScript version of the 
Dragoon project, elements will begin with a lower-case letter and will be 
written in camelCase (all words are combined into one word with the first letter 
of each subsequent word capitalized, such as camel case -> camelCase), except 
for acronyms such as URL, which will be capitalized. Using camel case is for 
consistency and to mimic the corresponding variables in the model. 

## Beginning Properties##

The JSON document will begin with the "task" element, of which all other 
elements will be attributes. It will be followed by the name, properties and 
description of the task (problem) that is being modeled.

        {
            "task": {
                "taskName": "Rabbits - Intro Problem",
                "properties": {
                    "phase": "intro",
                    "type": "construct",
                    "URL": "images/rabbit.jpeg",
                    "startTime": 0,
                    "endTime": 10,
                    "timeStep": 1,
                    "units": "years"
                },
                "taskDescription": "In this exercise, you will construct a model of how a 
                    rabbit population grows when no rabbits die. The first quantity in this 
                    model is the population or number of rabbits in the population. Initially, 
                    there are 100 rabbits, but the number increases with time. The new 
                    population each month is its present value plus the number of births 
                    (number of rabbits born each month).  The number of births is equal to the 
                    product of the population and the birth rate. The birthrate or the ratio 
                    of the number of rabbits born in a month to the rabbit population that 
                    month has a fixed value of 0.2.",

Within the properties element, "phase" and "type" refer to the type of task and 
let the program know what kind of help the student should receive. The element 
"URL" gives the location of the picture used for the problem, "startTime", 
"endTime", and "timeStep" refer to the time frame that the problem is modeling 
and are self explanatory, and "units" refers to the time that the model spans. 
The element "taskDescription" gives the student information needed to complete 
the model.

## Given Model Nodes ##

All of the nodes that are part of the model are contained in "givenModelNodes". 
They are not visible on the screen unless they are also in the student model, 
but a student has not correctly solved the model until the corresponding 
elements of the nodes in the student model match the non-extra nodes in the 
given model.

        "givenModelNodes": [
            {
                "ID": "id1",
                "name": "population",
                "type": "accumulator",
                "parentNode": false,
                "extra": false,
                "order": 1,
                "units": "rabbits",
                "inputs": [
                    {
                        "ID": "id2"
                    }
                ],
                "initial": 100,
                "equation": "+ id2",
                "correctDesc": "The number of rabbits in the population",
                "attemptCount": {
                    "description": 2,
                    "type": 1,
                    "initial": 2,
                    "units": 4,
                    "equation": 3
                },
                "solution": {
                    "description": "correct",
                    "type": "demo",
                    "initial": "correct",
                    "units": "demo",
                    "equation": "correct"
                }
            },

Each node has a unique ID, which is how the node will typically be referred to 
in the code. This allows the name to be changed without disrupting other nodes 
that use the node as an input. An attempt was made to remove redundant 
information that could be derived from other parts of the node, so old XML 
attributes and elements like "type" and "Plan" were combined into one element, 
in this case, "type", which indicates if the node is an accumulator, a function, 
or a parameter node. This is information similar to what was in the former 
"Plan" element. 

Students may benefit from completing nodes in a certain order. For example, if 
Node A requires Nodes B and C to be completed, by starting with Node A, the 
student is led to complete Nodes B and C as well. Node A is said to be the first 
node in a tree. The element "parentNode" allows the author to indicate if a node 
is a parent node, or the first node in a tree. This affects the order of nodes 
appearing when the student presses "Demo" to get the correct description and 
name. If "Demo" is pressed a parent node will be chosen before its children. The 
element "order" is deprecated with "parentNode" and it currently not being 
used. It is retained in case it is needed later but can be removed if needed. 

The author can also include nodes that are not necessary for completion to 
additionally challenge the student. The element "extra" indicates whether or not 
a node is one of these extra nodes. If it is marked true, it is not required. 

The node element "units" differs from the task element units (which refers to 
time) and signifies the item that the node refers to (in the above example, the 
unit is rabbits, meaning the number of rabbits in the population). The element 
"inputs" list other nodes that are required in the node's equation. The element 
"initial" is used in accumulator nodes to give an initial value that the 
equation builds upon, "equation" holds the equation used for the value of the 
node at each time step, and "correctDesc" contains the correct description of 
the node. 

The elements "attemptCount" and "solution" are used for grading and, as they are 
in the given model, they cannot be changed by erasing a node and starting over. 
They keep track of the number of attempts a student uses on a node and how a 
student arrived at the current solution ("correct" indicates that the student 
solved that portion correctly, "incorrect" or "null" indicates the student has 
not yet solved it correctly, and "demo" indicates that the student asked the 
program to give the correct solution or attempted the problem incorrectly too 
many times). Once it is marked "demo" this mark will not be changed.

## Student Model Nodes ##

Student model nodes are nodes that the student has created while trying to 
complete the model or that the author wants visible when the problem is begun. 
They are visible on the screen.

        "studentModelNodes": [
            {
                "ID": "id1",
                "name": "population",
                "inGivenModel": true,
                "inputs": [
                    {
                        "ID": "id2"
                    }
                ],
                "position": {
                    "x": 100,
                    "y": 100
                },
                "studentSelections": {
                    "desc": "The number of rabbits in the population",
                    "plan": "accumulator",
                    "units": 100,
                    "initial": "rabbits",
                    "equation": "+ id2"
                }
            },

They contain information that identifies the node, positions it, and marks the 
student's selections. The element "inGivenModel" tells the program if there is 
a node in the given model to link it with. Other than the ID and the name, the 
information in the student model may not match information in the given 
model as the student may or may not select correct information. The student can 
also generate nodes that are not in the given model and are not part of the 
solution.

Another function of the student model is to allow the author to create a 
partially completed model that the user will have to correct or complete. Thus 
an author can build a model and specify which nodes should be present when the 
user opens the problem for the first time. 

When a node is given a name by the student the name will be checked against 
other nodes in the given model and if a match is found then the element 
"inGivenModel" will be set to true and the ID will be updated to match the node 
in the given model.

## Example of a Complete JSON Formatted Problem ##

The following code shows the "rabbits" problem with the new specification in a 
JSON document.

        {
            "task": {
                "taskName": "Rabbits - Intro Problem",
                "properties": {
                    "phase": "intro",
                    "type": "construct",
                    "URL": "images/rabbit.jpeg",
                    "startTime": 0,
                    "endTime": 10,
                    "timeStep": 1,
                    "units": "years"
                },
                "taskDescription": "In this exercise, you will construct a model of how a rabbit population grows when no rabbits die. The first quantity in this model is the population or number of rabbits in the population. Initially, there are 100 rabbits, but the number increases with time. The new population each month is its present value plus the number of births (number of rabbits born each month). The number of births is equal to the product of the population and the birth rate. The birthrate or the ratio of the number of rabbits born in a month to the rabbit population that month has a fixed value of 0.2.",
                "givenModelNodes": [
                    {
                        "ID": "id1",
                        "name": "population",
                        "type": "accumulator",
                        "parentNode": false,
                        "extra": false,
                        "order": 1,
                        "units": "rabbits",
                        "inputs": [
                            {
                                "ID": "id2"
                            }
                        ],
                        "initial": 100,
                        "equation": "+ id2",
                        "correctDesc": "The number of rabbits in the population",
                        "attemptCount": {
                            "description": 2,
                            "type": 1,
                            "initial": 2,
                            "units": 4,
                            "equation": 3
                        },
                        "solution": {
                            "description": "correct",
                            "type": "demo",
                            "initial": "correct",
                            "units": "demo",
                            "equation": "correct"
                        }
                    },
                    {
                        "ID": "id2",
                        "name": "births",
                        "type": "function",
                        "parentNode": true,
                        "extra": false,
                        "order": 2,
                        "units": "births",
                        "inputs": [
                            {
                                "ID": "id1"
                            },
                            {
                                "ID": "id3"
                            }
                        ],
                        "initial": null,
                        "equation": "id1 * id3",
                        "correctDesc": "The number of rabbits born each month",
                        "attemptCount": {
                            "description": 2,
                            "type": 1,
                            "initial": 0,
                            "units": 2,
                            "equation": 1
                        },
                        "solution": {
                            "description": "demo",
                            "type": "demo",
                            "initial": "null",
                            "units": "correct",
                            "equation": "correct"
                        }
                    },
                    {
                        "ID": "id3",
                        "name": "birth rate",
                        "type": "parameter",
                        "parentNode": false,
                        "extra": false,
                        "order": 3,
                        "units": "percent",
                        "inputs": [],
                        "initial": null,
                        "equation": ".2",
                        "correctDesc": "The ratio of number of rabbits born in a month to the rabbit population that month",
                        "attemptCount": {
                            "description": 1,
                            "type": 1,
                            "initial": 0,
                            "units": 1,
                            "equation": 3
                        },
                        "solution": {
                            "description": "correct",
                            "type": "correct",
                            "initial": "null",
                            "units": "correct",
                            "equation": "correct"
                        }
                    }
                ],
                "studentModelNodes": [
                    {
                        "ID": "id1",
                        "name": "population",
                        "inGivenModel": true,
                        "inputs": [
                            {
                                "ID": "id2"
                            }
                        ],
                        "position": {
                            "x": 100,
                            "y": 100
                        },
                        "studentSelections": {
                            "desc": "The number of rabbits in the population",
                            "plan": "accumulator",
                            "units": 100,
                            "initial": "rabbits",
                            "equation": "+ id2"
                        }
                    },
                    {
                        "ID": "id2",
                        "name": "births",
                        "inGivenModel": true,
                        "inputs": [
                            {
                                "ID": "id1"
                            },
                            {
                                "ID": "id3"
                            }
                        ],
                        "position": {
                            "x": 300,
                            "y": 100
                        },
                        "studentSelections": {
                            "desc": "The number of rabbits born each month",
                            "plan": "function",
                            "units": "null",
                            "initial": "births",
                            "equation": "id1 * id3"
                        }
                    },
                    {
                        "ID": "id3",
                        "name": "birth rate",
                        "inGivenModel": true,
                        "inputs": [],
                        "position": {
                            "x": 500,
                            "y": 100
                        },
                        "studentSelections": {
                            "desc": "The ratio of number of rabbits born in a month to the rabbit population that month",
                            "plan": "parameter",
                            "units": "null",
                            "initial": "percent",
                            "equation": ".2"
                        }
                    }
                ]
            }
        }
