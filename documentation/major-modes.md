# Major Modes #

There are five major modes:

* COACHED 
* STUDENT(Immediate Feedback)
* TEST (Delayed Feedback)
* EDITOR (No Feedback)
* AUTHOR

Any section-specific customizations are modifications to a major mode.  This 
document lists properties of these modes and possible section-specific customizations.

## COACHED mode ##

This mode forces the student to follow the TNS (target node strategy) as described in the last section of the slides.  When the coached mode is on:

* The user must start at a root node and complete that node before continuing on to other nodes.
* Any node they attempt to work on before its parents are completed will be marked as premature (blue description) and they will not be able to finish it until they go finish its parent.
* The user receives feedback on every field in the node editor, and also in the graph/table window.

## STUDENT mode ##

This immediate feedback mode is like COACHED mode, but nodes are never marked as premature--the student can start and complete the nodes in any order they desire.

## TEST mode ##

This delayed feedback mode only gives feedback in the graph/table window, in two ways.  First, it displays all of the author's graphs along side the student ones.  Second, it displays a printed message 
 
## EDITOR mode ##

This mode gives no feedback whatsoever.

## AUTHOR mode ##
