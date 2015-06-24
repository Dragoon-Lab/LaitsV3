# Activities #

Activities are various ways of interacting with a Dragoon model for various pedagogical goals.  In the past, model construction has been the primary method of instruction, with model exploration being done secondarily, using the sliders in the graph window.  Activities will allow a single authored model to be used in multiple ways, chosen at the start of the activity.

## Overview of the Activities
Dragoon will support the following activities:
* Construction Activity
* Execution Activity
* Automated Execution Activity
* Up and Down Activity
* Automated Up and Down Activity

### Relationship Between Activities and Modes

### Construction Activity
The construction activity is identical to traditional Dragoon problems.  Construction activities can be done in author mode, or any of the student modes.

### Execution Activity
In the execution activity, the student is given the model and executes its calculations by hand.  This is similar to (and ideally, would replace) the task of filling in tables in the introductory workbooks.  The student will fill in the values for the functions and accumulators, then the model will advance to the next timestep and the student will fill them in again.  This repeats until the student has completed the desired number of timesteps (suggested number is two); then the graph/table window is shown for the rest.  Depending on the feedback mode, the student may be required to fill out the nodes in a particular order.

#### Pedagogical Goals
* To learn how the values of quantities are propogated through models
* To observe closely how the values of a particular model are calculated (?)

#### Workflow
All nodes which the author marked as "in model" and "optional" (?) will appear on the canvas.  The appearance of a node will depend on its type:
* Parameters 
  * All fields are filled in corretly by the system at the start; the student will never need to modify parameters
  * Solid green border
  * Interior of the node shows the value and units (in all cases in this document, units appear only when entered by author)
  * Clicking on the node opens the node editor with all fields disabled (uneditable)
* Functions and Accumulators
  * Nodes begin with dashed borders 
  * For functions: the interior of the node shows a blank where the value should be, with the units filled in beneath.
  * For accumulators: the interior of the node has four lines:
    * The initial value
    * A downward pointing arrow
    * The new value for this timestep (i.e. the initial value + value of expression); initially blank
    * The units
  * Clicking on the node opens the node editor with all fields disabled and filled in with author's values except for a new field called "current value" which the student must fill in.
  * The expression field is always given, however it will be hidden initially and may be revealed by clicking on it.
  * After the current value is filled in:
    * The node border becomes solid, and depending on the feedback mode may become colored as well.
    * Arrows leaving that node will be highlighted (depending on the feedback mode ?)

When all nodes have been given the correct values, a completion message window appears.  
* "You have computed all of the values for <time> of <total time student is required to execute>.  Click ok to advance to the next timestep."
* On advancing, the values are cleared from the functions and accumulators and they return to having grey dashed borders.  The initial values in the accumulators are replaced with the value the student computed in the previous timestep.
* When the final desired timestep has been completed, the message becomes "You have computed all of the required values for time <time>.  Now Dragoon will do the rest for you.  Click 'Graph' to see the results."

The start and end time will be given to the system at the start of the problem, so the instructor may decide how many iterations the student will work through, rather than the author.
  
#### Feedback Modes

### Automated Execution Activity
This activity is similar to the aforementioned Execution Activity, but
#### Pedagogical Goals
* To demonstrate how Dragoon computes values at each timestep
#### Workflow
#### Feedback Modes

### Up and Down Activity
#### Pedagogical Goals
#### Workflow
#### Feedback Modes

### Automated Up and Down Activity
#### Pedagogical Goals
#### Workflow
#### Feedback Modes

## Architecture

* Changes to model
* Changes to controller
* Changes to PM
* New ui-parameters
* New activity-parameters

