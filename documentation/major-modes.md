# Major Modes #

I would suggest that we stick with the four major modes:
* COACHED
* STUDENT
* AUTHOR
* TEST
And then do any section-specific customization on top of that.  This document lists properties
of these modes and possible section-specific customizations.

## All modes ##

**This needs to be moded ** 
The Show Graph button colors the "g" 
indicators (I'm not sure if it does this now).  If the target graph does not match the 
model's graph, then the "g" indicator on the node turns red.  If they do match, 
then the "g" indicator is green.    
As soon as the user makes any change to the model, the "g" indicators on every node 
turn white (unchecked).

## COACHED mode ##

We need a mode that requires the student to follow the TNS (target node strategy) as described in the last section of the slides.  When the coached mode is on:

* the create node button in the menu bar is disabled.  Every model starts with a single node that is not yet been given a description. Thus, the only way a user can create nodes is via the "create a new node" button on the inputs tab (there is a separate card for adding this button).

* the only way a user can exit a tab is when it is green or yellow. 

* a user cannot close or delete a node until its calculation is green. 

* on the description tab (including the one that pops up when the user clicks on the create a new node button on the calculations tab), if the user selects a description that would normally turn green but is not one of the right nodes to define right now according to the TNS, then the background of the tab turns cyan and a message says, "This quantity is legal, but now is not the time to define it." 

### Help Bubbles ###

A section specific customization would be to turn on help bubbles:
UCLA teachers didn't want bubbles:  they will go through the first problems
with the students in class, showing what to do step-by-step on projector.
However, not all users will necessarily be in a class and not all instructors
will want to use up class time to go through the introduction.
See [Bug #2156](http://www.andestutor.org/bugzilla/show_bug.cgi?id=2156).


## STUDENT mode ##

Check and Demo buttons are enabled on all tabs.  They provide immediate red/green 
feedback and a bottom-out hint.

## AUTHOR mode ##

## TEST mode ##

UCLA teacher asked for mode where it only gives `Check` and `Demo` feedback
in only two places:  the Description tab of the node editor and on the 
graphs (where the student graph is compared to the model graph).
Thus, on the plan and calculations tabs, the `Check` and `Demo` buttons are disabled.
The graph window works the same as STUDENT mode.  

We would need to set a policy for allowing the student to create additional
nodes once all the solution nodes have been created:  currently, this is not
allowed.

