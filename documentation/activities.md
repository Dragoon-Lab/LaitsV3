# Activities #

## Overview of the activities

* Construction Activity
* Execution Activity
* Automated Execution Activity
* Up and Down Activity
* Automated Up and Down Activity

### Relationship between activities and modes

### Construction Activity

### Execution Activity

### Automated Execution Activity

### Up and Down Activity

### Automated Up and Down Activity

## Architecture
This section gives an outline of the coding method we will follow to implement activities. Most important thing to understand here is to understand how modes and activities are related. 

### Relationship between activities and modes
To visualize this we can imagine activities and modes to laid out on grid like structure. See the image:
![Alt Interaction of Activity and Modes](activity_modes.jpg "Interaction of Activities and Modes")

Now, Dragoon can be used in n X m ways where `n` is number of activities and `m` are number of modes. To add another new activity we will add just another line in the grid in that direction. Thus code changes have to be in a similar manner as well. There are a few activities which wont be available in all the modes and we will stop that from happening using `activities-parameters.js`.

Now lets see the proper changes that we need to make to specific parts of dragoon. The basic coding methodology will be to make Dragoon plug and play. What sort of parameters that we have for activity and mode interaction will define how Dragoon interface will change. One important thing here is we need to automate all this, that is we need the minimal changes to the model. So for certain activities we might need to copy the given nodes to student nodes with appropriate changes.

* Changes to model - The exact new parameters that we need to add for each activity will be updated in [Model JSON file](json_format.md). For all the new parameters we will need getter and setters as well as model related changes in both Author and Student mode as per the requirement.
* Changes to controller - To give Dragoon modularised approach we will need to make a lot of code changes in the controller. Each field should be updated to be handled with a parameter. If that parameter is switched off then that field will not be visible in Node editor. These parameters will come from ui-parameters.js. 
* Changes to PM - PM holds the most important data structure for feedback. It is connected to each mode. Now we will need to extend it to two dimensional data structure. Where when student wrote a wrong answer in a construction activity, the values were picked from mode and the corresponding error status of the student. Now it will be picked up from activity, mode and then the error status. So basically the table will be three dimensional (3D) now. After updating the table we will need to make sure the previous code changes are made and tested properly. Then we will start adding the other activity feedbacks and corresponding field changes for it.
* New ui-parameters - This will tell us for a particular activity and mode, what are we supposed to show. This will be purely UI changes, i.e. what to show in Menu bar and what to show in Node editor and other UI changes. 
* New activity-parameters - This will tell us for each activity and corresponding mode, what are the functionalities that will be used. Like for Test mode we dont want feedback. So this will come from this file. This will exhaustively define what kind of behavior will each activity have.

