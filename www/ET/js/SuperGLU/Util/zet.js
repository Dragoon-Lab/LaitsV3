/** Zet.js Module from https://github.com/nemisj/Zet.js
	Handles inheritance and factory function registration/creation/type-checking
    This is a fork from the original, with updates and enhancements as noted.
    Revised by: Benjamin Nye
    Package: SuperGLU
    License: APL 2.0
    
    Notes: 
        - Fixes to update it to newer versions of JS (was outdated).
        - Added class factory function for automatically registering and creating Zet objects
        - Expanded isInstance functionality for type-checking of class
        - Fixed function inheritance functionality for newer JS versions
*/
if (typeof SuperGLU === "undefined"){
    var SuperGLU = {};
    if (typeof window === "undefined") {
        var window = this;
    }
    window.SuperGLU = SuperGLU;
}

(function(){
    // GLOBAL is the reference in nodejs implementation to the global scope
    // node.js supports Modules specs, so, Zet will go into separate scope
    var globalscope = (typeof(GLOBAL) == "undefined") ? window : GLOBAL;

    // Scope which is the entry point for Classes declaration;
    var declarescope = globalscope; 

    // support for CommonJS Modules 1.0 API
    // Zet.js can be include as CommonJS module, by calling
    // var Zet = require('Zet.js');
	var _c = (typeof(exports) != "undefined") ? exports : (globalscope.Zet = function Zet(){
        if(arguments.length == 1){
            var sub = arguments[0];
            return sub.instanceOf ? sub : {
                instanceOf : function(superclass){
                    return (typeof sub == "string") ? superclass == String : sub instanceof superclass; 
                }
            };
        }else if(arguments.length == 2){
            return Zet.declare(arguments[0], arguments[1]);
        }
    });

    // cache for undefined
    var undef;

    //logger provider
    var logger;

	
	// Factory Map (in form ClassId : Class Factory)
	var _FACTORY_MAP = {};
	
	// Utility Functions
	function prepareArgs(args){
        var i;
		var result = [];
		if(args && args.length){
			for(i=0;i < args.length;i++){
				result.push(args[i]); 
			}
		}  
		return result;
	}

	function mixin(obj, prop){
        var key;
		if(typeof(prop) == "object"){
			for(key in prop){
				if(prop.hasOwnProperty(key)){
					obj[key] = prop[key];	
				}
			}
		}

        return obj;
	}

    function inherited(currentFnc, args){
        var inheritedFnc = currentFnc.__chain;
        if(inheritedFnc && (typeof(inheritedFnc) == "function")){
            var a = prepareArgs(args);
            return inheritedFnc.apply(globalscope, a);
        }
    }
	
	function runConstruct(instance, params){
		var construct = instance.construct;
		if(construct && typeof(construct) == "function"){
			construct.apply(globalscope, params);
		}
		return instance;
	}
	
	_c.declare = function(className, kwArgs) {

        // className ommited for anonymous declaration
        if(arguments.length == 1){
            kwArgs    = className;
            className = null;
        }

		var superclass = kwArgs.superclass;
		var defineBody = kwArgs.defineBody;
		var CLASS_ID = kwArgs.CLASS_ID;
        if (CLASS_ID == null) { CLASS_ID = className; }

        if (superclass && typeof(superclass) != "function") {
            throw new Error("Zet.declare : Superclass of " + className + " is not a constructor.");
        } else if (defineBody !== undef && (typeof(defineBody) != "function")) {
            throw new Error("Zet.declare : defineBody of " + className + " is not a function.");
        } else if (CLASS_ID !== undef && (typeof(CLASS_ID) != 'string')) {
			throw new Error("Zet.declare : CLASS_ID of " + className + " is not a string.");
		}
        
        var instanceOf = function instanceOf(clazz){
			if(clazz == create){
				return true;
			}else if(superclass){
                //one level deep
                if (superclass.instanceOf){
                    return superclass.instanceOf(clazz);
                } else {
                    return superclass == clazz;
                }
			} else {
				return false;
			}
        };
		
		var isInstance = function isInstance(instance) {
            var constructor;
            if (instance == null){
                return false;
            }
            constructor = instance.constructor;
            if ((typeof constructor === "undefined") || 
				(!((constructor instanceof Function) || 
                  (constructor instanceof Object))) ||
                (instance.__zet__makeNew == null)){
                return false;
            // Exact Match
            } else if (instance.constructor == create){
                return true;
            } else {
                return instance.instanceOf(create);
            }
		};

		// Function that makes a new (uninitialized) instance
		var __zet__makeNew = function __zet__makeNew(){
			var params = prepareArgs(arguments);

			var superStore  = null;
			var self        = null;        

			if(superclass){
                // protection against outside calls
				var superi = superclass.__zet__makeNew(create);
				if(superi === null){
					//throw or warning
                    throw new Error("Zet.declare : Superclass of " + className + " should return object.");
				}

				// mixin all functions into superStore, for inheritance
				superStore = mixin({}, superi);
				self = superi;
			}

			self  = self || {}; // testing if the object already exists;

            if(defineBody){
                var proto = null;
                try{
                    proto = defineBody(self);
                }catch(e){
                    if(e.__publicbody){
                        proto = e.__seeding;
                    }else{
                        throw e;	
                    }
                }

                if(proto){
                    //some extra arguments are here
                    mixin(self, proto);
                }
            }

            // doing inheritance stuff
            if(superStore){
                for(var i in superStore){
                    if((self[i] != superStore[i]) && (typeof(superStore[i]) == "function" && typeof(self[i]) == "function")){
                        //name collisions, apply __chain trick
                        self[i].__chain = superStore[i];
                    }
                }
            }   

            // adding helper functions
			mixin(self, {
                className   : className,
				CLASS_ID	: CLASS_ID,
				inherited   : inherited,
				instanceOf  : instanceOf,
				isInstance  : isInstance,
				__zet__makeNew : __zet__makeNew,
				public      : _c.public,
                constructor : create // for var self = bla.constructor();
			});
			return self;
		};
		
		// Factory function that creates initialized instances
		var create = function create(){
			var params = prepareArgs(arguments);
			var self = __zet__makeNew(params);
			self = runConstruct(self, params);
			return self;
		};

		// Data available on the Class Factory function
		create.instanceOf = instanceOf;
		create.isInstance = isInstance;
		create.__zet__makeNew = __zet__makeNew;
		create.className = className;
		create.CLASS_ID	= CLASS_ID;
        // If CLASS_ID given, add class to factory
		if (CLASS_ID){
			_c.setFactoryClass(CLASS_ID, create);
		}
		// in case for anonymous Classes declaration check for className
        return className ? _c.setClass(className, create) : create;
	};

	// Zet Public Module Functions
	_c.public = function(body){
		var error = new Error('');
		error.__seeding = body;
		error.__publicbody = true;
		throw error;
	};

    _c.profile = function(kwArgs){
        if(kwArgs.scope){
            declarescope = kwArgs.scope; 
        }

        if(kwArgs.logger){
           logger = kwArgs.logger; 
        }
    };

	// Zet Class Factory for Module-Based Access
    _c.getClass = function(className){
		var curr  = declarescope;

		var split = className.split(".");
		for(var i=0; i < split.length; i++){
            if(curr[split[i]]){
                curr =  curr[split[i]];
            } else {
                throw new Error("Zet.getClass: Can't find class: " + className);
            }
		}

        return curr;
    };

    _c.setClass = function(className, constructor){
		var curr  = declarescope;
		var split = className.split(".");
		for(var i=0;i<split.length-1;i++){
			curr = curr[split[i]] ? curr[split[i]] : (curr[split[i]] = {});
		}

		return (curr[split[split.length-1]] = constructor);
    };

    _c.hasFactoryClass = function(classId){
		return (classId in _FACTORY_MAP);
	};
    
	_c.getFactoryClass = function(classId){
		return _FACTORY_MAP[classId];
	};
	
	_c.setFactoryClass = function(classId, classRef){
		// print("ADD TO FACTORY: " + classId + " / " + classRef.className + " / "+ classRef);
		if (classId in _FACTORY_MAP){
			throw new Error("Error: Factory Map already contains class id: " + classId);
		}
		_FACTORY_MAP[classId] = classRef;
		// print("FACTORY MAP:" + Object.keys(_FACTORY_MAP));
	};
	
	//
	// Logging facilities
	//
	
    // default logger
    logger = {
        log : function(){
            if(globalscope.console && console.log){
                console.log.apply(console, arguments);
            }else if(window && window.document){
                var div= document.createElement("div");
                document.body.appendChild(div);
                var str = '';
                for(var i=0;i< arguments.length;i++){
                    str += (arguments[i] + ' ');	
                }
                div.innerHTML = str;
            }
        },

        error : function(){
            if(globalscope.console && console.error){
                console.error.apply(console, arguments);
            }else if(window && window.document){
                var div= document.createElement("div");
                document.body.appendChild(div);
                var str = '';
                for(var i=0;i< arguments.length;i++){
                    str += (arguments[i] + ' ');	
                }
                div.innerHTML = str;
                div.style.color = 'red';
            }
        }  
    };
	
    _c.level = function(lvl){
        if(logger && logger.level){
            logger.level(lvl);
        }
    };

	_c.log = function(){
        if(logger && logger.log){
            logger.log.apply(logger,arguments);
        }
	};

    _c.error = function(){
        if(logger && logger.error){
            logger.error.apply(logger,arguments);
        }
    };

})();
SuperGLU.Zet = Zet;