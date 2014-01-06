# Logging Format #

This document discusses the structure of the logging and the associated table formats on the server.

## Session ID ##

Associated with each java/javascript instance of Dragoon will be a unique session identifier.  In the javascript version, a page reload will generate a new session ID.  In the java version, each running of `Laits.jar` will generate a new session ID.  Opening more than one problem (or renaming a problem) *may* occur during a given session.

The format for the session ID variable `sessionId` will be a string of length 50.
It is convenient to generate `sessionId` by applying a hash function to the user name and section name and adding a timestamp.  An example javascript implementation can be found in Andes:  see the function `FNV1aHash` and the code that follows it in the file  [web-UI/andes/startup.js](https://github.com/bvds/andes/blob/master/web-UI/andes/startup.js).

## Database Table Structure ##

**`step`**:  Log individual events from client:

*	`tId` – An auto-incremented integer that uniquely identifies each log event.
*	`SessionId` – foreign key. 
*	`method` can be one of the following:
 *	`Start_workflow` send session ID to the server as well as the user name and section.  Normally, it will also send the problem name.  This will create an entry in the `session` table.
 * `open_problem` - Client asks for the problem from the server or opens a local file.  The message will in  Logging will handle add the request as well as the reponse provided by the user. This entry will be kept in table 1 only as we need not add the session details again for step 2.
 *	javaScript logging - javascript exception and have to be handled cross browser, the data object flow and node connections etc. Entry for this will be in **step**.
 *	UI events - not logging every key strokes or the mouse clicks but a level above it. Like switch tabs and open node editor, values added to the node editor etc. We will save the user action understanding and the responses by the pedagogical model. The entry for this will be **step**.
 *	solution steps  - logging the solution steps taken by the user w.r.t. the problem the user is working on. It can be like "turned node color to red or green" depending on whether the node created was correct or not. The entry for this will be in **step**.
 *	close_problem - for book keeping, i.e. when the session ended. This log should be the last log for the session and will tell when the session ended. We will store this value in table 1 as well. 
this will be the action taken by the user and what has been interpreted from those actions. Here the actions wont be so small as how the mouse was moved but rather the bigger action. Like node was created with so and so values and whether it was in line with Target Node Strategy.
*	Time – this will be the relative time since the student started working on the problem, starting from 0.0 for every new session.
*	Message - this will hold the relative messages for each action performed by the user. We can do it exactly as it was done in Andes where one column will be action column and other will be the Response column. In dragoon it would be hard to log the responses from module as everything is happening on the client side we can keep a message column only. So during implementation we will need to decide whether we use Action/Response columns or the messages column.

This table similar to the table `STEP_TRANSACTION` in Andes; see [create_STEP_TRANSACTION.sql](https://github.com/bvds/andes/blob/master/LogProcessing/database/create_STEP_TRANSACTION.sql).  This can be used to see how the table should be formatted.


**`session`**: this will hold all the sessions of different user. This will hold the final problem results for all the user, with different modes.

*	`SessionId` – primary key for this table
*	Mode – user mode -> author, power, student or delayed feedback mode.
*	Time – this will be the server time. So we will track the problem using the time in Table 1 which will start as the problem starts and the absolute time of the session will be saved here.
*	User – the name and profile of the user.
*	Class – section where the tutor is being used like whether it is CPI360 or sustainability
*	Problem - problem name on which the user is working.

This table similar to the table `PROBLEM_ATTEMPT` in Andes; see [create_PROBLEM_ATTEMPT.sql](https://github.com/bvds/andes/blob/master/LogProcessing/database/create_PROBLEM_ATTEMPT.sql).  This can be used to see how the table should be formatted.


In table methods are of the prime importance, as they will tell us the state of the problem. The conditions assumed here are:

1.	Every new tab will create a new session.
2.	Closing a tab means ending the session and close_problem action has to be evoked. 


## Implementation ##

**step** holds the session details will have message column. The data entry in that will be in JSON format. JSON will be used primarily because we can change the key-value pairs as per our liking. All the extra columns that would be needed later on will be just added to the message column. It would be easier to analyse the message later on as well.
**session** everything will be in the normal columns. This will hold the start time of the session for the <user, class, problem> tuple.
