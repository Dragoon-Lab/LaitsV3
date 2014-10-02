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

Each problem time would be clickable which will show a `<div>` at the top or bottom of the dashboard
page or above the table and that will show the complete detail as how many times incorrect solution 
was entered and so on. The presentation of this `<div>` has to be decided. Easiest way to show this
would be similar to the Java version. But same information can be presented in a better way using
colors instead of words. Important information to be shown in this `<div>`:

* The nodes created by the student
* Status of each property.
* How many times incorrect solution was given and what was the incorrect solution.
* In a highly detailed version for giving final grades they also asked for the time spent on each property

At the top or the bottom of the page there can be a general information about the class flow. 
This can be done using a bar chart showing how many students have done or are doing there second
problem, how many are doing the third and so on.

###Dashboard Logging Object (Controller)###
To handle different types of views for the dashboard, the script (`logProblemObject.php`) creates a PHP object which is similar
to the javascipt model object. This will be created for every session-user-problem group
and the array of objects will be returned. You can print whatever you want to and however you want to.

The object structure can be checked in `logProblemObject.php` in log
folder. Structure is based on three classes:

* UserProblemObject - This is the complete session object which contains information about the username, problem
session times, out of focus time, wasted time (when the window is selected but the user is not doing anything
for more than 7 minutes), and an array of Node objects (in PHP they are the second class).
* Node - This class has all the node related data, which is the name of the node, how many times node was opened
and the status of all the properties that the user has completed. The properties form the third class.
* Property - This class holds the lowest level of information. It name of the property (which can be description, 
type, units etc), the status of each property (this is an array), time spent on each property, correct solution 
for the property. Summations of these times will give the total time spent on the node.

Each of the properties in the class have been set to private and there are getter-setters for each variable.

####Code structure (View)####
* main.js : This is the file that is first called from the html. It has the one and only ready object. It creates a dashboard object and calls the dashboard_js.php to get the session objects from each user as per the parameters sent.
* dashboard.js : The idea of this was to convert the json objects that came from php to html and then show. There have been a series of changes made to this file to make it more and more modularised. The code can be checked and the use of each function is written in comments. The most important part is to understand how the type defines what kind of a dashboard we show. There is a modules object which defines makes the dashboard based on the values inside it. defineModules function is used to define the various parts of the html that need to be shown or not. The modules object structure and values that are possible are written below. 
- name : true/false : to show the names of the user or not in the table. If names are not shown then the name sent using "us" parameter is highlighted
- heading : String : Heading that one shows usually the board name that is predefined. 
- sub-heading : String/HTML : Any String that is shown below the heading. Can be used as instructions for the user. This is also prefined and not based on the parameters.
- color : true/false : whether to show the colors in the background of each cell of the table and also the corresponding key to the user.
- display : empty/time/errors : the first value to be shown in the cells. Empty does not show any value in the row, i.e. just a color in the background. Time shows the time spent by the user on the problem and the time wasted as well. Errors shows the number of incorrect checks and the total checks by the user.
- sessionLink : true/false : to show the clickable link on each table cell, which opens the corresponding complete session link for the user to see.
- options : true/false : to give a user the choice to switch between the values shown in the cell, i.e. errors or empty or time.
- completeAnalysis : true/false : to show the complete node about each and every property in the node or not. This and session link should be kept alternate. They can both be false in cases when we just want to show the values. But essentially they add a functionality which works on a click and so can not be true simultaneously.

Different views depend a lot on the parameter values that are sent in the URL, the params are:
* m - mode of the logs (STUDENT/AUTHOR)
* s - section
* u - user, this will show only user specific logs.
* p - problem, this will show only a problem specific logs.
* us - if you want to highlight a particular user row then that will be done using this paramaeter.
* t - type of the dashbaord to be shown

time specific logs are also possible (but they have not been tested as complete log analysis for a complete semester takes not more than 10 secs)
* fd : from date
* ft : from time
* td : to date
* tt : to time

Now specific type values possible :
* t = "dash" or default, shows everything completely.
* t = "leader", shows a leader board. It was used in Professor Kurt's class in Fall 14. It does not show the user name and highlights the user that is currently checking the dashboard. The table links are not clickable.
* t = "complete", shows the complete dashboard which actually has a lot of information. This is dashboard shows the in depth analysis, i.e. all the incorrect checks, what was the wrong answer. It also shows the time spent on each node. This is not good to be checked in class as that much info does not help during the runtime. Its primary usage is to help the grading of student work later. 
