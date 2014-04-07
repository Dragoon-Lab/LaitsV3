# JSON Format #

## Proposed JSON format for Dragoon problems. ##

The following JSON format is proposed for problem files, for problems in the 
database (e.g. problems authored for specific sessions), and to store the user's 
progress in the `solutions` table on the database. This JSON format is proposed to 
be standard across the three categories just mentioned to ensure readability, 
portability, and ease of use and modification. 

The format is different from former Intelligent Tutoring Systems (LAITS, Java 
version of Dragoon) in that they used XML to store their problems. Because 
JavaScript uses JSON naturally we are proposing to use it for the JavaScript 
version of Dragoon. The proposed JSON format is similar to the format used in 
older XML problems in Dragoon to allow easier conversion of problems that have 
previously been defined. It is significantly different than what was being saved 
in the `autosave_table`.  This new 
format also attempts to remove redundant and deprecated code that existed in the 
XML formats.

The following examples show the conversion of the problem "rabbits.xml" into the 
new JSON format to show how the new format will be modeled. 

## General Formatting Conventions ##

JSON is a language that defines elements and attributes in name/value pairings.
For more information see [json.org](http://www.json.org/). For the JavaScript version of the 
Dragoon project, elements will begin with a lower-case letter and will be 
written in [camelCase](http://en.wikipedia.org/wiki/CamelCase), except 
for acronyms such as URL, which will be capitalized. Using camelCase is for 
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
                "type": "construct"
            },
            "time": {
                "start": 0,
                "end": 10,
                "step": 1,
                "units": "years"
            },
            "image": {
                "URL": "images/rabbit.jpeg",
                "width": 225,
                "height": 100
            },
            "taskDescription": "In this exercise, you will construct a model of 
            how a rabbit population grows when no rabbits die. The first 
            quantity in this model is the population or number of rabbits in the 
            population. Initially, there are 100 rabbits, but the number 
            increases with time. The new population each month is its present 
            value plus the number of births (number of rabbits born each month). 
            The number of births is equal to the product of the population and 
            the birth rate. The birth rate or the ratio of the number of rabbits 
            born in a month to the rabbit population that month has a fixed 
            value of 0.2.",

Within the properties element, "phase" and "type" refer to the type of task and 
let the program know what kind of help the student should receive. Within the 
"time" element "startTime", "endTime", and "timeStep" refer to the time frame 
that the problem is modeling and are self explanatory, and "units" refers to the 
time that the model spans. Within the "image" element "URL" gives the location 
of the picture used for the problem, with "width" and "height" giving its 
desired dimensions. The element "taskDescription" gives the student information 
needed to complete the model.

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
            "order": 1,
            "units": "rabbits",
            "inputs": [ { "ID" : "id2" } ],
            "initial": 100,
            "equation": "+ id2",
            "description": "The number of rabbits in the population",
            "attemptCount": {
                "description": 2,
                "type": 1,
                "initial": 2,
                "units": 4,
                "equation": 3
            },
            "status": {
                "description": "correct",
                "type": "demo",
                "initial": "correct",
                "units": "demo",
                "equation": "correct"
            }
        },
        ...
    ]

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
additionally challenge the student. 

The node element "units" differs from the task element units (which refers to 
time) and signifies the item that the node refers to (in the above example, the 
unit is rabbits, meaning the number of rabbits in the population). The element 
"inputs" list other nodes that are required in the node's equation. The element 
"initial" is used in accumulator nodes to give an initial value that the 
equation builds upon, "equation" holds the equation used for the value of the 
node at each time step, and "description" contains the correct description of 
the node. 

The elements "attemptCount" and "status" are used for grading and, as they are 
in the given model, they cannot be changed by erasing a node and starting over. 
They keep track of the number of attempts a student uses on a node and how a 
student arrived at the current solution ("correct" indicates that the student 
solved that portion correctly, "incorrect" or "null" indicates the student has 
not yet solved it correctly, and "demo" indicates that the student asked the 
program to give the correct solution or attempted the problem incorrectly too 
many times). Once it is marked "demo" this mark will not be changed.

## Extra Descriptions ##

The author may include quantities which are not part of the model
solution to allow for different ways of expressing the model and
to provide distractors in the list of quantity choices.
They are included in the "givenModelNode" array, as in the following example.

            {
                "genus": "extra",
                "ID": "id7",
                "name": "month two population",
                "type": "parameter",
                "parentNode": true,
                "units": "rabbits",
                "inputs": [],
                "initial": 100,
                "description":
				"The number of rabbits in the population after 1 year ",
                "attemptCount": {
                    "description": 2,
                    "type": 1,
                    "initial": 2,
                    "units": 2,
                    "equation": 0
                },
                "status": {
                    "description": "correct",
                    "type": "correct",
                    "initial": "demo",
                    "units": "correct"
                }
            },

The attributes can include all of the attributes in the given model, though they 
are not required to. This allows the student to potentially construct a full 
node that is not needed, requiring the student to better understand the problem 
and deduce which nodes are actually needed.

The element "genus" identifies the type of extra node.  It *may* have the
following values:

* "allowed"   The student *may* include this quantity in a solution.
Use of this quantity will still allow the student to construct a model that agrees
with the given model.  This quantity *may* have no explicit "type".
There is no penalty (or negative feedback) if the student includes this quantity, but there
will be no hints or feedback suggesting the use of this quantity.

* "extra" A quantity that might be part of a valid model, and
  mentioned in the problem description, but
  inclusion of this quantity will generally not allow the student to
  construct a model that agrees with the given model.  There *may*
  be a penalty or negative feedback if the student uses this quantity.
  
* "irrelevant"  A quantity that is not part of the given model and
  not mentioned in the problem description. There *may*
  be a penalty or negative feedback if the student uses this quantity.

* "initialValue"   The initial value of a quantity that is in the given model.

For solution nodes, "genus" is either the empty string or not included.

## Student Model Nodes ##

Student model nodes are nodes that the student has created while trying to 
complete the model or that the author wants visible when the problem
is first opened.   They are visible on the screen.

    "studentModelNodes": [
        {
            "ID": "id4",
            "descriptionID": "id1",
            "type": "accumulator",		
            "initial": 100
            "units": "rabbits",
            "inputs":  [ { "ID": "id5" } ],
            "equation": "id5",
            "position": {
                "x": 100,
                "y": 100
            },
            "status": {
                "description": {
                    "status": "correct", 
                    "disabled": true
                },
                "type": {
                    "status": "demo",
                    "disabled": false
                },
                ...		    
            }
        },
        ...
    ]

They contain information that identifies the node, positions it, and marks the 
student's selections. The attribute "descriptionID" specifies a node in the
given model or in "extraDescriptions" that has been selected by the student.
Thus, the student *may* generate nodes that are not in the given
model and are not part of the solution.

If the student equation can be parsed, the attribute "equation" contains  the
equation written in terms of student node ids, when possible.  If the parse fails,
then it contains the student string and the "inputs" array is empty.
Likewise,  "initial" contains the numerical value of the
student input; if the parse fails, it contains the student string.

The attribute "status" saves state for the node editor, listing
status and enable/disable for each of the controls.

Another function of the student model is to allow the author to create a 
partially completed model that the user will have to correct or complete. Thus 
an author can build a model and specify which nodes should be present when the 
user opens the problem for the first time. 

## Example of a Complete JSON Formatted Problem ##

The following code shows the "rabbits" problem with the new specification in a 
JSON document.

    {
        "task": {
            "taskName": "Rabbits - Intro Problem",
            "properties": {
                "phase": "intro",
                "type": "construct"
            },
            "time": {
                "start": 0,
                "end": 10,
                "step": 1,
                "units": "years"
            },
            "image": {
                "URL": "images/rabbit.jpeg",
                "width": 225,
                "height": 100
            },
            "taskDescription": "In this exercise, you will construct a model of how a rabbit population grows when no rabbits die. The first quantity in this model is the population or number of rabbits in the population. Initially, there are 100 rabbits, but the number increases with time. The new population each month is its present value plus the number of births (number of rabbits born each month). The number of births is equal to the product of the population and the birth rate. The birthrate or the ratio of the number of rabbits born in a month to the rabbit population that month has a fixed value of 0.2.",
            "givenModelNodes": [
                {
                    "ID": "id1",
                    "name": "population",
                    "type": "accumulator",
                    "parentNode": false,
                    "order": 1,
                    "units": "rabbits",
                    "inputs": [ { "ID" : "id2" } ],
                    "initial": 100,
                    "equation": "id2",
                    "description": "The number of rabbits in the population",
                    "attemptCount": {
                        "description": 2,
                        "type": 1,
                        "initial": 2,
                        "units": 4,
                        "equation": 3
                    },
                    "status": {
                        "description": "incorrect",
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
                    "order": 2,
                    "units": "births",
                    "inputs": [ { "ID": "id1" }, { "ID": "id3" } ],
                    "initial": null,
                    "equation": "id1 * id3",
                    "description": "The number of rabbits born each month",
                    "attemptCount": {
                        "description": 2,
                        "type": 1,
                        "initial": 0,
                        "units": 2,
                        "equation": 1
                    },
                    "status": {
                        "description": "demo",
                        "type": "demo",
                        "units": "correct",
                        "equation": "correct"
                    }
                },
                {
                    "ID": "id3",
                    "name": "birth rate",
                    "type": "parameter",
                    "parentNode": false,
                    "order": 3,
                    "units": "percent",
                    "inputs": [],
                    "initial": 0.2,
                    "description": "The ratio of number of rabbits born in a month to the rabbit population that month",
                    "attemptCount": {
                        "description": 1,
                        "type": 1,
                        "initial": 0,
                        "units": 1,
                        "equation": 0
                    },
                    "status": {
                        "description": "correct",
                        "type": "correct",
                        "initial": "demo",
                        "units": "correct"
                    }
                },
                {
                    "ID": "id7",
                    "name": "month two population",
                    "genus": "extra",
                    "type": "parameter",
                    "parentNode": true,
                    "units": "rabbits",
                    "inputs": [],
                    "initial": 120,
                    "description": "The number of rabbits in the population during the second month",
                    "attemptCount": {
                        "description": 2,
                        "type": 1,
                        "initial": 2,
                        "units": 2,
                        "equation": 0
                    },
                    "status": {
                        "description": "correct",
                        "type": "correct",
                        "initial": "demo",
                        "units": "correct"
                    }
                },
                {
                    "ID": "id8",
                    "name": "superpower fraction",
                    "description": "The ratio of rabbits born with superpowers to ordinary rabbits",
                    "units": "rabbits per rabbit",
                    "genus": "irrelevant"
                }
            ],
            "studentModelNodes": [
                {
                    "ID": "id4",
                    "descriptionID": "id1",
                    "type": "accumulator",
                    "initial": 100,
                    "units": "rabbits",
                    "inputs": [ { "ID": "id5" } ],
                    "equation": "id4+id5",
                    "position": {
                        "x": 100,
                        "y": 100
                    },
                    "status": {
                        "description": {
                            "status": "correct", 
                            "disabled": true
                        },
                        "type": {
                            "status": "demo",
                            "disabled": false
                        },
                        "units": {
                            "status": "incorrect",
                            "disabled": false
                        }
                    }
                },
                {
                    "ID": "id5",
                    "descriptionID": "id2",
                    "type": "function",
                    "units": "births",
                    "inputs": [ { "ID": "id4" }, { "ID": "id6" } ],
                    "equation": "id4*id6",
                    "position": {
                        "x": 300,
                        "y": 100
                    },
                    "status": {
                        "description": {
                            "status": "correct", 
                            "disabled": true
                        },
                        "type": {
                            "status": "demo",
                            "disabled": true
                        },
                        "units": {
                            "status": "demo",
                            "disabled": true
                        }
                    }
                },
                {
                    "ID": "id6",
                    "descriptionID": "id3",
                    "type": "parameter",
                    "initial": 0.2,
                    "units": "percent",
                    "inputs": [],
                    "position": {
                        "x": 500,
                        "y": 100
                    },
                    "status": {
                        "description": {
                            "status": "demo", 
                            "disabled": true
                        },
                        "type": {
                            "status": "correct",
                            "disabled": true
                        },
                        "units": {
                            "status": "correct",
                            "disabled": false
                        }
                    }
                }
            ]
        }
    }
