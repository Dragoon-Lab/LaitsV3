# Node Editor Design #

## Class Structure

We have AMD modules, `js/model.js` and `js/controller.js`, that implement the MVC for the
node editor.  The view is implemented in `index.html` and using the
[Dijit](http://dojotoolkit.org/reference-guide/dijit/) libraries.  In
addition, we have the Pedagogical Module (PM). 

`js/model.js` provides an interface to the model.  It has many
Java-style getter and setter methods. For AUTHOR mode, the student
is mofiying the **given model**, subclass `given`, while in other major
modes, the student is modifying the **student model**, subclass
`student`.  The **given model** includes both the solution quantities
plus any extra quantities ("allowed," "extra," "irrelevant," *et
cetera*) that have been defined.  The `solution` subclass contains
accessors to the solution quantities.

To handle switching between modes, we introduce  an **active model**,
subclass `active`, which points to the appropriate model.  For example, 
`given.getNodes()` and `student.getNodes()` get the given model and
student model nodes, respectively.  The corresponding **active model**
function is `active.getNodes()`. 

## Pedagogical Module ##

`js/pedagogical_module.js` informs the controller about updates
[controls](http://www.w3.org/TR/html401/interact/forms.html#form-controls)
in the Node Editor:

* set as enabled/disabled
* mark as correct, incorrect, or demo
* send a user message
* it may update the value associated with a control (in the case of
  demo).

The PM saves state in the **given model** and interacts directly with the
model for this purpose.  Although the PM reads the **student model**, it
generally does not update it (changing an input value on "demo" *may*
be an exception).

Methods in the PM return an array of directives like this:

    [
		{id: "initial", attribute: "disabled", value: true},  // enable or disable a control
		// Send a message.
		{id: "message", attribute: "append", value: "You should try again."},
		{id: "description", attribute: "status", value: "demo"},  // Set the status (red/green/yellow)
		// Set the value of a control (in the case of demo)
		{id: "description", attribute: "value", value: "id3"},
		// Set the equation; the equation contains the text, as written by the student (no IDs).
		{id: "equation", attribute: "value", "-fish * fowl"}
		// Disable individual choices in a pull-down menu
		{id: "type", attribute: "disableOption", value: "function"},
		// Open a blocking pop-up box
		{id: "crisisAlert", attribute: "open", value: "You should be more careful."}
	]

The attribute names can be: `description`, `type`, `initial`,
`units`, `inputs`, `equation`, or `crisisAlert`.  The controller 
maps these names onto the appropriate widget `id` in `index.html`.
The attributes `enableOption`/`disableOption` can be used to
enable/disable individual options in a select control.  If no value is
given, then all options in the control are enabled/disabled.

`js/controller.js` acts as the controller.  On opening the node
editor, it sets values of the Node Editor controls based on the **active
model**.  It also queries the PM to set other attributes of the controls.
It sends user input changes to the **active model**  and to the PM and updates
the view based on the response of the PM.  The controller does not
access the **given model** or **student model** directly.


## Expression Input Methods##

There are two basic methods for inputting expressions for Accumulator and Function nodes.  Algrebraic Expression Input is more flexible and suitable for users with stronger math skills, while Structured Expression Input is intended for users with weaker math skills.  For all major modes, choosing which of the two input method is available to the student/author is a pedagogical decision.  It is based on a student model, possibly using default settings for a section, subject to the constraints mentioned below.

###Algebraic Expression Input###

In this case, there is an input text area, a pull-down menu to select quantities, and buttons for some arithmetic operators.

###Structured Expression Input###

If Structured Expression Input is available, then there will be radio buttons to allow the student to choose between "Sum" and "Product."  Alternatively, these choices may be listed as subchoices of "Function" and "Accumulator" in the Type selector control.

The second consists of two select controls.  The first control allows the user to list positive contributions while the second allows the user to list negative contributions to the quantity. In AUTHOR mode, the user must be able to type in node names that do not yet exist in the list of nodes.  This precludes using the HTML control `<select multiple>` or the Dijit widget `dijit/form/MultiSelect`.  Instead, we will use `dijit/form/Select` in the student modes and `dijit/form/ComboBox` in AUTHOR mode.  Selecting an item will add that item to the expression shown below the box.  The "Clear" button will clear all the quantities selected.

Structured input style can only be used on nodes where the expression is a pure sum or product, as defined by
the functions `isSum()` and `isProduct()` in `www/js/equation.js`.  Thus, this input format may be enabled only on problems where *all* the Accumulator and Function nodes in the given model are pure sums or products.  This should be tested when a problem is opened.
