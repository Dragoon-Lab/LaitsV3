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
Java-style getter and setter methods. For AUTHOR mode, one is
modifying `givenModel` while in other major modes, one is modifying
the `studentModel`.
To handle AUTHOR mode, we extend the `model` class and to have
model accessor functions that give access to the appropriate model,
depending on the major mode.  The new class is called `mmodel`.
For example, in the model class, we have the functions
`getGivenNodes()` and `getStudentNodes()` to get the `givenModel` and
`studentModel` nodes, respectively.  The function in `mmodel` would be
`getNodes()`. 

`js/pedagogical_model.js` informs the controller about updates
[controls](http://www.w3.org/TR/html401/interact/forms.html#form-controls)
in the Node Editor:

* set as enabled/disabled
* mark as correct, incorrect, or demo
* send a user message
* it may update the value associated with a control (in the case of
  demo).

The PM saves state in the `givenModel` and interacts directly with the
model for this purpose.  Although the PM reads the `studentModel`, it
generally does not update it.

Methods in the PM return an array of directives like this:

    [
		{id: "initialValue", attribute: "disabled", value: true},  // enable or disable a control
		// Send a message (id may be ignored by the controller)
		{id: "initialValue", attribute: "message", value: "You should try again."},
		{id: "selectDescription", attribute: "status", value: "demo"},  // Set the status (red/green/yellow)
		// Set the value of a control (in the case of demo)
		{id: "selectDescription", attribute: "selected", value: "id3"} 
	]

The attribute names in the above example are not set in stone:  they
should be chosen to map easily onto controls in the Node Editor.

`js/controller.js` acts as the controller.  On opening the node
editor, it sets values of the Node Editor controls based on `studentModel`.  It also
queries the PM to set other attributes of the controls.
It sends user input changes to `studentModel`  and to the PM and updates
the view based on the response of the PM.

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
