/**
 * 
 */


define(["../../dojo/_base/declare","../../dijit/layout/TabContainer", "../../dijit/layout/ContentPane","../../dojo/dom-construct"],
		function(declare, Tab,Content,domConst){
	return declare(null, {
    	
	abc:"AAA",
	def:"BBB",
	obj:null,
	
	constructor:function(a,b,tabName)
	{
		this.abc = a;
		this.def = b;
	    this.obj = new Tab({
	    	
	    	style: "height: 100%; width: 100%;"
	    },tabName);	
	},
		
	show: function()
	{
		console.log(this.abc);
		console.log(this.def);
        
	},
	
	createContent:function(contentName,description)
	{
		var content = new Content({
        	title:contentName,
        	content:description
        });
        this.obj.addChild(content);
        this.obj.startup();
	}
	

		
	});
	
});




