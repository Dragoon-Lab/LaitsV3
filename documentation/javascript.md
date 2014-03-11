# JavaScript user interface #

## Libraries ##

We are using:

* The [Dojo](http://dojotoolkit.org) framework.
* A [fork of jsPlumb](https://github.com/bhosaledipak/JsPlumb_Dojo_Integreate)
  that uses AMD and Dojo.
* A [fork of js-expression-eval](https://github.com/bvds/js-expression-eval) 
 that uses AMD and can accept variable names with spaces.

We might use  [d3js](http://d3js.org):
See [MIT Media lab project](http://immersion.media.mit.edu), you can 
login with your email account.

## Model-View-Controller for the node editor

We have AMD modules, `js/model.js` and `js/controller.js`, that implement the MVC for the
node editor.  The view is implemented in `index.html` and using the
[Dijit](http://dojotoolkit.org/reference-guide/dijit/) libraries.  In
addition, we have the Pedagogical Module (PM). 

`js/model.js` provides an interface to the model.  It has many
Java-style getter and setter methods. For AUTHOR mode, the student
is mofiying the **given model**, subclass `given`, while in other major
modes, the student is modifying the **student model**, subclass `student`.
To handle switching between modes, we introduce  an **active model**,
subclass `active`, which points to the appropriate model.  For example, 
`given.getNodes()` and `student.getNodes()` get the given model and
student model nodes, respectively.  The corresponding **active model**
function is `active.getNodes()`. 

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
		// Send a message (id may be ignored by the controller)
		{id: "initial", attribute: "message", value: "You should try again."},
		{id: "description", attribute: "status", value: "demo"},  // Set the status (red/green/yellow)
		// Set the value of a control (in the case of demo)
		{id: "description", attribute: "selected", value: "id3"} 
	]

The attribute names can be: `description`, `type`, `initial`,
`units`, `inputs`, or `equation`.  The controller 
maps these names onto the appropriate widget `id` in `index.html`.

`js/controller.js` acts as the controller.  On opening the node
editor, it sets values of the Node Editor controls based on the **active
model**.  It also queries the PM to set other attributes of the controls.
It sends user input changes to the **active model**  and to the PM and updates
the view based on the response of the PM.  The controller does not
access the **given model** or **student model** directly.

## Automatic node placement ##

Our algorithm for automatic node placement will
produce a pattern like this:

     0  1  4  9
     2  3  5 10
     6  7  8 11
    12 13 14 15

Here is some code that will produce this:

    n is the number of the node
    q = int(sqrt(n));
    if(n<q^2+q)
      position=(q,n-q^2)
    else
      position=(n-q^2-q,q)

An explanation, showing the above table, should be included as a comment in the code.
