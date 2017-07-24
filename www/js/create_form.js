define([
	'dojo/_base/declare',
	"dojo/dom",
	"dijit/form/Form",
	"dijit/form/TextBox",
	"dojo/_base/lang",
], function(declare,dom,form,TextBox,lang){
	return declare(null, {
		constructor: function(formId,method,action,data){
			//create a form , given id, method and action
			this.newForm = new form({
				id: formId,
				action: action,
				method: method,
				style: "display: none", /*generally idea is to create hidden forms and submit them*/
			}, dojo.doc.createElement('div'));
			//console.log(newForm);
			document.body.appendChild(this.newForm.domNode);


			//use data to build form elements
			if(data !== null){
				this.buildForm(data);
			}
		},

		buildForm: function(data){
			console.log("building form");
			data.forEach(lang.hitch(this, function(element){
				this.createFormElement(element.type,element.name,element.value);
			}));
		},

		createFormElement: function(type,name,value){
			switch(type){
				case "text":
					var textbox = new TextBox({
						name: name,
						type: 'text',
						value:value
					}, dojo.doc.createElement('input'));
					this.newForm.domNode.appendChild(textbox.domNode);
					break;
			}
		},

	});

});