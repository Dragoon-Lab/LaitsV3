define([], function(){
	var parameters = {
		fast: {
			linear_transfer:{
				accumulator: {
					l0: {},
					transition: {},
					guess: {},
					slip: {}
				},
				parameter: {
					l0: {},
					transition: {},
					guess: {},
					slip: {}
				}
			},
			exponenetial_transfer: {
				accumulator: {
					l0: {},
					transition: {},
					guess: {},
					slip: {}
				},
				func: {
					l0: {},
					transition: {},
					guess: {},
					slip: {}
				},
				parameter: {
					l0: {},
					transition: {},
					guess: {},
					slip: {}
				}
			},
			accelerating_transfer: {
				accumulator: {
					l0: {},
					transition: {},
					guess: {},
					slip: {}
				},
				func: {
					l0: {},
					transition: {},
					guess: {},
					slip: {}
				},
				parameter: {
					l0: {},
					transition: {},
					guess: {},
					slip: {}
				}
			}
		}
	};
	
	return declare(null, {
		constructor: function(){
			this.algorithm = "fast";
		},

		get: function(schema, type, paramType, property){
			if(type == "function")
				type = "func";
			return this.algorithm != "default" ? parameters[this.algorithm][schema][type] : -1;
		},

		setAlgorithm: function(a){
			this.algorithm = a;
		},

		getAlgorithm: function(){
			return this.algorithm;
		}

	});
});
