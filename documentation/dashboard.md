# Dashboard #

This document discusses the Dashboard created which shows the progress of the class.
During discussion with professor, they had given a detail of information that they 
would like to know. [K. Verbert et. al 2012] mentions that the relevant information 
to be shown in the dashboard can be taken from the professor. After the Fall 2013, there
was an extensive discussion on what relevant information to show on the Dashboard. The 
information highlighted by them was:

* time spent on the problems.
* add the tab in which give up was pressed, 
* how many times check button was pressed in a tab,
* see when the student is looking the presentation 
* time spent on each tab
* for how much time was the problem in focus and out of focus.

These were based on the java version. But the information is still the same. There is
no give up button now but instead the answer is shown once the user has given wrong answer
too many times. So the information can still be shown. There are a lot of different ways
to show the information.

Easiest way to show the information is using a table. The table will show the problems done
by the class in a time range. It will give time each student took to complete the problem.
In brackets it will show the time for which the problem was out of focus. This will be most
consised and informative format.


| Student | Rabbits  | Isle 1  | Isle 2  |
|:-------:|:---------|:--------|:--------|
| Name1   | 846(211) | 545(23) | 651(99) |
| Name2   |    --    | 432(15) | 598(55) |


Each problem time would be clickable which will show a div at the top or bottom of the dashboard
page or above the table and that will show the complete detail as how many times incorrect solution 
was entered and so on. The presentation of this div has to be decided. Easiest way to show this
would be similar to the Java version. But same information can be presented in a better way using
colors instead of words. Important information to be shown in this div:
* The nodes created by the student
* Status of each property.
* How many times incorrect solution was given and what was the incorrect solution.
* In a highly detailed version for giving final grades they also asked for the time spent on each property

At the top or the bottom of the page there can be a general information about the class flow. 
This can be done using a bar chart showing how many students have done or are doing there second
problem, how many are doing the third and so on.

###Dashboard Logging Object###
To handle different types of views for the dashboard, the script (`logProblemObject.php`) creates a PHP object which is similar
to the javascipt model object. This will be created for every session-user-problem group
and the array of objects will be returned. You can print whatever you want to and however you want to.

The object structure can be checked in `logProblemObject.php` in log folder. Structure is based on three classes:
* UserProblemObject - This is the complete session object which contains information about the username, problem
session times, out of focus time, wasted time (when the window is selected but the user is not doing anything
for more than 7 minutes), and an array of Node objects (in PHP they are the second class).
* Node - This class has all the node related data, which is the name of the node, how many times node was opened
and the status of all the properties that the user has completed. The properties form the third class.
* Property - This class holds the lowest level of information. It name of the property (which can be description, 
type, units etc), the status of each property (this is an array), time spent on each property, correct solution 
for the property. Summations of these times will give the total time spent on the node.

Each of the properties in the class have been set to private and there are getter-setters for each variable.

Different views that are created will be added iteratively.