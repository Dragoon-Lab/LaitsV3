/**
 * 
 */


define(["dojo/_base/declare","dojo/_base/array"],
		function(declare, array){
	return declare(null, {

		//public variables
		array_list_true:0,
		array_list_false:0,
		function_name:"",
	
		//initialize function name and arrays
		constructor:function(function_name, arr_list_true,arr_list_false)
		{
			this.array_list_true = arr_list_true;
			this.array_list_false = arr_list_false;
			this.function_name = function_name;
		},
		
		//function to check if current rule is valid by checking it against its dependencies
		//this is a skeleton for making rule. return true if rule is made successfully
		makeRule:function()
		{
			console.debug("In makerule function");
			array.forEach(this.array_list_true,  function(item){
			
				if(item != true)
				{
				      return false;	
				}
			});
			
			array.forEach(this.array_list_false,  function(item){
				
				if(item != false)
				{
				      return false;	
				}
			});
	
			//Add actions here
			return true;
		}
	

		
	});
	
});




