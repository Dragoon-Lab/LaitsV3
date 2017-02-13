/**
* Creates the dragoon form when included.
* Call createForm to create the initial div and initial structure. It will always be hidden
* Set property values using addFormProperty function
* validate form is called when you submit the form.
* form can be submitted by calling the submit function
*/

var formID = "dragoon-form";

// function to be called at the bottom of the body which will create the for
function createForm(){
	//create a form wrapper
	var wrapper = document.createElement("div");
	wrapper.setAttribute("id", "form-wrapper");
	wrapper.setAttribute("style", "display:none;");

	//create a form
	var f = document.createElement("form");
	f.setAttribute("id", formID);
	f.setAttribute("method", "POST");
	f.setAttribute("action", "index.php");
	f.setAttribute("onsubmit", "return validateForm()");

	//this was part of the login.html so to keep the things backward compatible;
	var c = document.createElement("input");
	c.setAttribute("name", "c");
	c.setAttribute("value", "Continue");
	c.setAttribute("type", "submit");

	f.appendChild(c);
	wrapper.appendChild(f);
	
	document.getElementsByTagName("body")[0].appendChild(wrapper);
	// test values
	//addFormProperty("u", "asdf");
	//addFormProperty("m", "AUTHOR");
	//addFormProperty("a", "construction");
	//addFormProperty("p", "ra");
	//addFormProperty("g", "test");
	//addFormProperty("is", "algebraic");
	//addFormProperty("sm", "feedback");
	//addFormProperty("s", "test");
}

// see above parameter examples, 
// parameters - property name and the values to create the complete form
function addFormProperty(/* String */ property, /* String */ value){
	var form = document.forms[formID];
	
	var x = document.createElement("input");
	x.setAttribute("name", property);
	x.setAttribute("type", "text");
	x.setAttribute("value", value);

	form.appendChild(x);
}

//validates the form
function validateForm(){
	var form = document.forms[formID];

	// check if user is set in the form
	var x = form.u && form.u.value;
	if(x == null || x == ""){
		console.error("user is not set");
		return false;
	}
	
	// check if mode is author then activity should only be construction
	// and they should be set
	x = form.a && form.a.value;
	var y = form.m && form.m.value;
	if(x && y && y == "AUTHOR" && x != "construction"){
		console.error("mode and activity values are inconsistent");
		return false;
	}

	// check if problem is set
	x = form.p && form.p.value;
	if(x == null || x == ""){
		console.error("problem value is not set");
		return false;
	}

	// check if section is set
	x = form.s && form.s.value;
	if(x == null || x == ""){
		console.error("section value is not set");
		return false;
	}

	return true;
}

function submit(){
	var form = document.forms[formID];
	form.submit();
}
