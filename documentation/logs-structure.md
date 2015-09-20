# Logging Format #
sss
This document discusses the structure of the logging and the associated table formats on the server.

## Database Table Structure ##

The logging will use the **`session`** table (see [sessions.md](sessions.md))  and:

**`step`**:  Log individual events from client:

*	`tid` – An auto-incremented integer that uniquely identifies each log event.
*	`session_id` – foreign key. 
*	`method` can be one of the following:
	*	`start-session` send session ID to the server as well as the user name and section and major mode.  Normally, it will also include the problem name and the author name for custom problems.  This will create an entry in the `session` table.
	* `open-problem` - Client asks for the problem from the server or opens a local file.  The message will include problem name and possibly section name and author name for custom problems.
	*	`client-message` - Java/JavaScript exceptions and warnings.  Messages associated with the dragoon code itself.
	*	`ui-action` - Actions taken by the user on the interface, such
	    as clicking on a menu, opening the node editor, or moving a node on the canvas, that are
	   not problem-solving steps.   We will not log keystrokes or mouse events but a level above it.
 * `seek-help` -  Student request for help and the response. Not implemented yet in Dragoon (as of June 2014).
 *	`close-problem` - The student has closed the session.  This may be missing if the session was interrupted (e.g. the network connection died).
 * `window-focus` - The student window goes in and out of focus after the session has been started. 
    See [`andes/drawing.js`](https://github.com/bvds/andes/blob/master/web-UI/andes/drawing.js) for an example.
*	`message` - A `text` format field that holds actual log message. The format is specified in the section "Message Format" below.

This table is analogous to the table `STEP_TRANSACTION` in Andes; see [`create_STEP_TRANSACTION.sql`](https://github.com/bvds/andes/blob/master/LogProcessing/database/create_STEP_TRANSACTION.sql).  The Andes table can be used to see how the `step` table should be formatted.


## Data to be logged##

Following a conversation with the instructors of the classes which
have used Dragoon, we've identified specific information which must be
included in the logs.  The following list enumerates the
most important information missing from the present logging:
 
* Enter Node Editor (method `ui-action`) Needed info:
  + Entered thru Create Node action or existing Node
  + Which was the last checked value
  + Which is the next value to be filled in the node (if existing)
* User answer is **Checked** (method `solution-step`) Needed info:
  + The node
  + Property that was checked
  + Value student entered
  + Correct or Incorrect
  + If incorrect, what was correct value
* User answer gets **Demo-ed** (method `seek-help`) Needed info:
  + The node
  + Property for which the help was given
* Close Node Editor (method `ui-action` or `solution-step`?) Needed info:
 + Was node completed, which was the last property filled if incomplete.
* **Show Graph** button (method `ui-action`) Needed info:
  + Was correct or incorrect
  + If correct, indicate problem is completed
* **Show Forum** button pressed (method `ui-action`)
* End session (method `close-problem`) Needed info:
 + Was problem completed

For many examples, we have found the choice of `method` to be
ambiguous.  Thus, we need to further clarify the definitions of the
methods and perhaps merge some of them.

## Message Format ##

The `message` column of the `step` table will be in
[JSON](http://json.org/) format.  Each log message will include a member `time` that
contains the number of seconds, according to the client, that have elapsed since the start of
the session.

We will not write a formal definition of the log message format.  Instead, we will define it via a set of
examples. We can use the Andes logging as a staring point for creating
the Dragoon log message format.  See an 
[annotated session log for Andes](http://gideon.eas.asu.edu/web-UI/Documentation/AsuDocs/nokes-example-json.txt)
as well as the
[json-rpc SMD](http://dojotoolkit.org/reference-guide/dojox/rpc/smd.html)
specification of the
[Andes logging format](http://gideon.eas.asu.edu/web-UI/andes/andes3.smd).

### Example Session ###

Here is the logging for an example session:

Student opened a new task ID: 105 - Intro Problem 1  
--  method: `open-problem`  message: `{"time": 1.3, "problem":"105"}`  
For custom problems, it will also include the author and section.

Student pressed the **create node** button.  This might create two messages:
one for the menu button and one for opening the node editor.  
-- method: `ui-action`  
-- message: `{"time": 21.3, "type": "menu-choice",  "name": "create-node"}`  
-- method: `ui-action`  
-- message: `{"time": 21.3, "type": "open-dialog-box", "name": "node-editor", "nodeID": "id10"}`  
The node id "id10" is an arbitrary unique identifier for each node.

Student chooses a quantity in the description tab.  
-- method: `solution-step`  
-- message: `{"time": 40.2, "nodeID": "id10", "type": "enter-quantity",
  "node": "fat content", "text": "The ratio of the weight of the fat
  in a potato chip to the weight of the potato chip", "checkResult":
  "CORRECT"}`  

Student chooses node type:  
-- method: `solution-step`  
-- message: `{"time": 53.1, "node": fat content, "nodeID": "id10", "type": "solution-checked",
  property : "type",  "value": "ACCUMULATOR", "checkResult":  "CORRECT"}`

Student fills out the initial value:   
-- method: `solution-step`  
-- message: `{"time": 60.2, "node": "fat content", "nodeID": "id10", "type":"solution-checked",
  "property": "initial", "value": "0.35", "correctValue: "0.35", 
  "checkResult":  "CORRECT"}`  
for incorrect value:  
-- method: `solution-step`  
-- message: `{"time": 60.2, "node": "fat content", "nodeID": "id10", "type":"solution-checked",
  "property": "initial-value", "value": "0.35", "correctValue": "0.45", 
  "checkResult":  "INCORRECT"}`  
for parser errors:  
-- method: `solution-step`  
-- message: `{"time": 60.2, "node": "fat content", "nodeID": "id10", "type": "parse-error",
  "property" : "initial-value", "value": "35%", "correctValue": "0.35", 
  "checkResult":  "INCORRECT"}`  

User deletes a node:  
-- method: `ui-action`    
-- message: `{"time":'65.9', "type":'node-delete', "node":'fat
   content', "nodeID": "id10", "nodeComplete": true}`

Student closes node editor:  
-- method: `ui-action`  
-- message: `{"time": 61.6, "type": "close-dialog-box",
  "nodeID": "id10", "nodeComplete": true, "node": "fat content"}`  

#### Incremental activity logs
Student opens activity popup   
-- method: `ui-action`  
-- message: `{"time":2.255,"type":"open-tweak-popup","node":"net growth","nodeID":"id11"}`

Student closes activity popup.  
-- method: `ui-action`  
-- message: `{"time":6.503,"type":"close-tweak-popup","node":"net growth","nodeID":"id11"}`

Student opens the equation box from the popup  
-- method: `ui-action`  
-- message `{"time":6.501,"type":"open-equation","node":"net growth","nodeID":"id11"}`

Close equation box  
-- method `ui-action`  
-- message `{"time":8.382,"type":"close-equation", "node": "net growth"}`

The student answers will be handled as it is handled for other node related solution step

### Execution activity logs
Student opens activity popup   
-- method: `ui-action`   
-- message: `{"time":2.255,"type":"open-tweak-popup","node":"net growth","nodeID":"id11"}`

Student closes activity popup.   
-- method: `ui-action`   
-- message: `{"time":2.255,"type":"open-tweak-popup","node":"net growth","nodeID":"id11"}`

The equation close actions will be same as incremental activity messages. The answer actions
will be same as it is handled in construction activity using solution step.

#### Author mode
Node creation - giving values to various properties during construction step  
-- method: `solution-step`  
-- message: `{"time":1233.535,"type":"solution-enter","nodeID":"id1",
   "propoerty":"name","node":"V across C","value":"V across C","error":false}`

Here property can take the value like name, description, type, equation, initialValue 
and so on to explain the part that is being updated.

ui-actions in author mode are same as that in student mode. There is a graph
modification action which tells when an author changes parameter values using sliders.
In that case log messages is:  
-- method: `ui-action`  
-- message: `{"time":1915.861,"type":"solution-manipulation","name":"graph-tab"}`

### Node properties ###
Following are the different properties in the node:

* description
* type
* initial
* units
* equations

To calculate the time spent working on a property, we start by
labelling all logging events when the node editor is opened according
to the associated property.  The time between any two consecutive logging events
is assigned to the property associated with the later logging event.

The check comes on its own after the answer is filled. So all the solutions will be logged under
solution-step.

### Window focus messages ###

*  When user brings the window in focus.  
  -- method:  `window-focus`  
  -- message: `{"time": '56.9', "type": "in-focus"}`

* When user goes away from the window or starts doing something else:  
 -- method: `'window-focus`   
 -- message: `{"time": '56.9', "type": "out-of-focus"} `
