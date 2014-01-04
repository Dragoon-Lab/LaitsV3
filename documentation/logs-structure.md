# Database and Logging Structure #

This document talks about the structure of the log file. Various methods for which documentation actions will vary and how the logs will look for that.

## Database Table Structure
Table 1: Complete session detail for the user.
•	tID – this is the serial number, which is the primary key for the table.
•	SessionID – foreign key. This together with tID can also be used as a primary key even if tID is unique.
•	method – this will be the action taken by the user and what has been interpreted from those actions. Here the actions wont be so small as how the mouse was moved but rather the bigger action. Like node was created with so and so values and whether it was in line with Target Node Strategy.
•	Time – this will be the relative time since the student started working on the problem, starting from 0.0 for every new session.
•	Message - this will hold the relative messages for each action performed by the user. We can do it exactly as it was done in Andes where one column will be action column and other will be the Response column. In dragoon it would be hard to log the responses from module as everything is happening on the client side we can keep a message column only. So during implementation we will need to decide whether we use Action/Response columns or the messages column.

Table 2: this will hold all the sessions of different user. This will hold the final problem results for all the user, with different modes.
•	SessionID – primary key for this table
•	Mode – user mode -> author, power, student or delayed feedback mode.
•	Time – this will be the server time. So we will track the problem using the time in Table 1 which will start as the problem starts and the absolute time of the session will be saved here.
•	User – the name and profile of the user.
•	Class – section where the tutor is being used like whether it is CPI360 or sustainability
•	Problem - problem name on which the user is working.

Dragoon JS version will have some primary actions. These actions will be logged in different formats. The major actions for which different methodology for logging will exist are as follows :
•	Start_workflow & open_problem - send session ID to the server. New session will be created here and the details will be stored in table 1 and table 2. For open problem the action done will be - Client asks for the problem from the server and it sends the problem object in the form of XML of JSON as per the new definition for the problem. Logging will handle add the request as well as the reponse provided by the user. This entry will be kept in table 1 only as we need not add the session details again for step 2.
•	javaScript logging - javascript exception and have to be handled cross browser, the data object flow and node connections etc. Entry for this will be in Table 1.
•	UI events - not logging every key strokes or the mouse clicks but a level above it. Like switch tabs and open node editor, values added to the node editor etc. We will save the user action understanding and the responses by the pedagogical model. The entry for this will be in table 1.
•	solution steps  - logging the solution steps taken by the user w.r.t. the problem the user is working on. It can be like "turned node color to red or green" depending on whether the node created was correct or not. The entry for this will be in Table 1 only.
•	close_problem - for book keeping, i.e. when the session ended. This log should be the last log for the session and will tell when the session ended. We will store this value in table 1 as well.

In table methods are of the prime importance, as they will tell us the state of the problem. The conditions assumed here are - 
1)	Every new tab will create a new session.
2)	Closing a tab means ending the session and close_problem action has to be evoked. 

### Implementation
Table 1 holds the session details will have message column. The data entry in that will be in JSON format. JSON will be used primarily because we can change the key-value pairs as per our liking. All the extra columns that would be needed later on will be just added to the message column. It would be easier to analyse the message later on as well.
Table 2 everything will be in the normal columns. This will hold the start time of the session for the <user, class, problem> tuple.