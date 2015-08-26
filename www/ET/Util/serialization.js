//////////////////////////////////////////////////////
// File Name: serialization.js
//
// Description: 
//   Serialization Package
//   -----------------------------------
//   This package is intended to allow serializing and unserializing
//   between JavaScript objects and various serial/string representations (e.g., JSON, XML).
//   The following objects are included:
//     * Serializable: Base class for serializable objects, needed for custom serialization
//     * StorageToken: Intermediate representation of a serializable object
//     * TokenRWFormats: Serializes and recovers storage tokens and primatives to specific formats (e.g., JSON)
//
/////////////////////////////////////////////////////////

// Requires UUID,js and zet.js
if (typeof window === "undefined") {
    var window = this;
}


// Module Declaration
(function (Serialization, undefined) {

    var MAP_STRING = "map",
        LIST_STRING = 'list';
    
    var NAME_KEY = 'name';

	// Utility functions
	var updateObjProps = function(targetObj, sourceObj){
        var key;
		for (key in sourceObj){
			targetObj[key] = sourceObj[key];
		}
	};

	// Format Constants
	var JSON_FORMAT = 'json',
		XML_FORMAT = 'xml',
		VALID_SERIAL_FORMATS = [JSON_FORMAT, XML_FORMAT];
	
    // Base classes for serializable objects
    //---------------------------------------------

    // Class Serializable
    // A serializable object, that can be saved to token and opened from token
    Zet.declare('Serializable', {
        superclass : null,
        defineBody : function(self){
			// Constructor Function
            
            self.construct = function construct(id){
            /** Constructor for serializable
            *   @param id (optional): GUID for this object.  If none given, a V4 random GUID is used.
            */
                if (id == null) {
                    self._id = UUID.genV4().toString();
                } else {
                    self._id = id;
                }
                
                //A factory mapping that is used when unpacking serialized objects. 
                //if (self.CLASS_ID){
                //    _addFactoryClass(self.className, self.constructor);
                //} else {
                //    throw new TypeError("Serializable class did not have a class id.");
                //}
            };
            // Public Functions 
            self.eq = function eq(other){
				return ((self.getClassId() == other.getClassId()) && (self.getId() == other.getId()));
            };

            self.ne = function ne(other){
                return !(self.eq(other));
            };

            self.getId = function getId(){
                return self._id;
            };
            
            self.updateId = function updateId(id){
                if (id === undefined) {
                    self._id = UUID.genV4().toString();
                } else {
                    self._id = id;
                }
            };

            self.getClassId = function getClassId(){
                return self.className;
            };

            self.initializeFromToken = function initializeFromToken(token, context){
            /** Initialize serializable from token.
                @param context (optional): Mutable context for the loading process. Defaults to null. 
            */
				self._id = token.getId();
            };

            self.saveToToken = function saveToToken(){
				var token = StorageToken(self.getId(), self.getClassId());
                return token;
            };
            
            self.saveToSerialized = function saveToSerialized(){
                return makeSerialized(self.saveToToken());
            };
            
            self.clone = function clone(newId){
                if (newId == null){ newId = true; }
                var s = makeSerialized(self.saveToToken());
                s = untokenizeObject(makeNative(s));
                if (newId){
                    s.updateId();
                }
                return s;
            };
        }
    });

    Zet.declare('NamedSerializable' , {
        superclass : Serializable,
        defineBody : function(self){
			// Constructor Function
            self.NAME_KEY = NAME_KEY;
            
            self.construct = function construct(id, name){
                if (name == null) { name=null;}
                self.inherited(construct, [id]);
                self._name = name;
            };
            
            self.getName = function getName(){
                return self._name;
            };
            
            self.setName = function setName(name){
                if (name == null){
                    name = null; 
                } else if (name instanceof String || typeof name === 'string'){
                    self._name = name;
                } else {
                    throw new Error("Set name failed, was not a string.");
                }
            };
            
            self.eq = function eq(other){
                return (self.inherited(eq, [other]) && (self._name === other._name));
            };
            
            self.initializeFromToken = function initializeFromToken(token, context){
                self.inherited(initializeFromToken, [token, context]);
                self._name = untokenizeObject(token.getitem(self.NAME_KEY, true, null), context);
            };
            
            self.saveToToken = function saveToToken(){
                var token = self.inherited(saveToToken);
                if (self._name != null){
                    token.setitem(self.NAME_KEY, tokenizeObject(self._name));
                }
                return token;
            };
        }
    });
    
    // Class StorageToken
    // An object that stores data in a form that can be serialized
    Zet.declare('StorageToken', {
        superclass : null,
        defineBody : function(self){
            // -- Class fields
            self.ID_KEY = 'id';
            self.CLASS_ID_KEY = 'classId';
            
            // Constructor
            self.construct = function construct(id, classId, data) {
            /** Create a storage token, which can be directly serialized into a string
                @param id (optional): A GUID for the storage token.  If none given, uses a V4 random GUID.
                @param classId (optional): Id for the class that this StorageToken should create.  Defaults to null.
                @param data (optional): Starting data for the token.  Either a map {} for an array of map pairs [[key, val]].
            */
                var i;
                self._data = {};
                if (data !== undefined) {
                    //we are assuming that the data will either already
                    //be in a dictionary form ({key: value, key2: value2, ...}) 
                    //or is in a sequence form ([[key, value], [key2, value2], ...])
                    if (data instanceof Array){ //[[key, value], [key2, value2], ...]
                        for (i in data){
                            if ((data[i] instanceof Array) && (data[i].length == 2)){
                                  self._data[data[i][0]] = data[i][1];
                            } else {
                                throw new TypeError("Input array doesn't follow the format of [[key, value], [key2, value2], ...]");
                            }
                        }
                    } else {// {key: value, key2: value2, ...}
                        self._data = data;
                    }
                }else {
                    self._data = {};
                }                
                if (id !== undefined){
                    self.setId(id);
                } else if ((self.getId() === undefined)){
                    self.setId(UUID.genV4().toString());
                }                
                if (classId !== undefined) {
                    self.setClassId(classId);
                }
            };
        
            // -- Instance methods
            self.getId = function getId(){
                return self._data[self.ID_KEY];
            };

            self.setId = function setId(value){
                self._data[self.ID_KEY] = value;
            };

            self.getClassId = function getClassId(){
                return self._data[self.CLASS_ID_KEY];
            };

            self.setClassId = function setClassId(value){
                self._data[self.CLASS_ID_KEY] = value;
            };
            
            // Convenience Accessor for Named Serializables
            self.getName = function getName(){
                if (NAME_KEY in self._data){
                    return self._data[NAME_KEY];
                } else {
                    return null;
                }
            };

            self.setName = function setName(value){
                self._data[NAME_KEY] = value;
            };

            // -- ##Generic Accessors
            self.len = function len(){
                return self._data.length;
            };

            self.contains = function contains(key){
                return key in self._data;
            };

            self.getitem = function getitem(key, hasDefault, defaults){
            /** Get an item from the data dictionary
                @param key: Key for the item
                @param hasDefault (optional): If True, give a default value.  Else, raise an error if key not found.
                @param defaults (optional): The optional value for this item.
            */
                if (!(key in self._data) && (hasDefault)){
                    return defaults;
                }else {
                    return self._data[key];
                }
            };

            self.setitem = function setitem(key, value){
                self._data[key] = value;
            };

            self.delitem = function delitem(key){
                delete self._data[key];
            };

            self.__iterator__ = function __iterator__(){
                var keys = Object.keys(self._data).sort();
                var keys_pos = 0;
                return {
                    next: function(){
                        if (keys_pos >= keys.length){
                            throw StopIteration;
                        }
                        return keys[keys_pos++];
                    }
                };
            };

            self.keys = function keys(){
                var k, aKeys;
                aKeys = [];
                for (k in self._data){
                    aKeys.push(k);
                }
                return aKeys;
            };

            // -- ##Comparison
            self.eq = function eq(other){
                return (typeof(self) == typeof(other)) && (self._data == other._data);
            };

            self.ne = function ne(other){
                return !(self.eq(other));
            };

            // -- ##Validation
            self.isValidKey = function isValidKey(key){
                return typeof(key) in self.VALID_KEY_TYPES;
            };

            self.isValidValue = function isValidValue(value){
                return typeof(value) in self.VALID_VALUE_TYPES;
            };

            self.isValid = function isValid(){
                var idKey;
                var classIdKey;
                
                //Check that ID is valid
                if ((self._data[self.ID_KEY] == null) ||
                    ((typeof(self._data[self.ID_KEY]) !== 'string') &&
                     (typeof(self._data[self.ID_KEY]) !== 'number'))) {
                  return false;
                }
                //Check that class name is valid
                if ((self._data[self.CLASS_ID_KEY] == null) ||
                    (typeof(self._data[self.CLASS_ID_KEY]) !== 'string')) {
                  return false;
                }
                // Check that the name (if it exists) is valid
                if ((self._data[NAME_KEY] != null) && 
                    (typeof(self._data[NAME_KEY]) !== 'string')) {
                  return false;
                }
                return true;      
            };
        }
    });

    //-------------------------------------------
    // Packing and Unpacking from Serial Formats
    //-------------------------------------------
    // Generic RW Format
    Zet.declare('TokenRWFormat', {
        superclass : null,
        defineBody : function(self){
            // Public Class Properties
            
            // Valid Types in Storage Token
            self.VALID_KEY_TYPES = {'string': true};
            self.VALID_ATOMIC_VALUE_TYPES = {'number': true, 'string': true, 'boolean': true, 'undefined': true};
            self.VALID_SEQUENCE_VALUE_TYPES = {'list': true, 'tuple' : true};
            self.VALID_MAPPING_VALUE_TYPES = {'map': true};
            self.VALID_VALUE_TYPES = {};

            // Setup for Class Properties
            updateObjProps(self.VALID_VALUE_TYPES, self.VALID_ATOMIC_VALUE_TYPES);
            updateObjProps(self.VALID_VALUE_TYPES, self.VALID_SEQUENCE_VALUE_TYPES);
            updateObjProps(self.VALID_VALUE_TYPES, self.VALID_MAPPING_VALUE_TYPES);
            self.VALID_VALUE_TYPES.StorageToken = true;
            
            // Constructor method
            self.construct = function construct(){};
            
            // Public methods
            self.parse = function parse(string) {
                // Parse a string into javascript objects
                throw new Error("NotImplementedError");
            };

            self.serialize = function serialize(data) {
                // Serialize javascript objects into a string form
                throw new Error("NotImplementedError");
            };
        }
    });


    //JSON Formatting: Use JSONEncoder/JSONDecoder
    Zet.declare('JSONRWFormat', {
        superclass : TokenRWFormat,
        defineBody : function(self){
            
            // Constructor method
            self.construct = function construct(){};
            
            // Public methods
            self.parse = function parse(String) {//Parse a JSON string into javascript objects
                var decoded = JSON.parse(String);
                return self.makeNative(decoded);
            };

            self.serialize = function serialize(data) {//Serialize javascript objects into a JSON string form
                var serializable = self.makeSerializable(data);
                return JSON.stringify(serializable);
            };

            self.makeSerializable = function makeSerializable(x){
                var i, key, keys, rt, temp, xType;
                xType = typeof(x);
                rt = null;
				if ((xType in self.VALID_ATOMIC_VALUE_TYPES) || (x === null)){// Primitive variables
                    rt = x;
                } else if (x instanceof Array){ // Array
                    rt = {};
                    temp = [];
                    for (i=0; i<x.length; i++) {
                        temp[i] = self.makeSerializable(x[i]);
                    }
                    rt[LIST_STRING] = temp;
                } else if ((x instanceof Object) && 
                            !(StorageToken.isInstance(x))){ // Object
                    rt = {};
                    temp = {};
                    for (key in x){
						temp[key] = self.makeSerializable(x[key]);
                    }
                    rt[MAP_STRING] = temp;
                } else if (StorageToken.isInstance(x)){ // StorageToken
                    rt = {};
                    temp = {};
                    keys = x.keys();
                    for (i=0; i<keys.length; i++) {
						temp[self.makeSerializable(keys[i])] = self.makeSerializable(x.getitem(keys[i]));
                    }
                    rt[x.getClassId()] = temp;
                } else { //Error
                    throw new TypeError("Tried to serialize unserializable object of type (" + xType + "): " + x);
                }
                return rt;
            };

            self.makeNative = function makeNative(x){
                var i, key, rt, temp, xType, dataTypeName;
                xType = typeof(x);
                rt = null;
                if ((self.VALID_ATOMIC_VALUE_TYPES[xType]) || (x == null)){// Primitive variables
                  rt = x;
                  return rt;
                }
                for (dataTypeName in x){
                    break;
                }
                if (dataTypeName in self.VALID_SEQUENCE_VALUE_TYPES){ // Array
                    rt = [];
                    for (i=0; i<x[dataTypeName].length; i++) {
                        rt[i] = self.makeNative(x[dataTypeName][i]);
                    }
                } else if (dataTypeName in self.VALID_MAPPING_VALUE_TYPES) { // Object
                    rt = {};
                    for (key in x[dataTypeName]) {
                        rt[key] = self.makeNative(x[dataTypeName][key]);
                    }
                } else { //Default StorageToken
                    rt = {};
                    rt[MAP_STRING] = x[dataTypeName];
                    rt = self.makeNative(rt);
                    rt = StorageToken(undefined, undefined, rt);
                }
                return rt;
            };
        }
    });
    
    var JSONRWFormatter = JSONRWFormat(),
		XMLRWFormat = null,
		XMLRWFormatter = null;
	
	// Function to Create an Object From a Token
	var createFromToken = function(token, context, onMissingClass){
	/** Create a serializable instance from an arbitrary storage token
		@param token: Storage token
		@param context (optional): Mutable context for the loading process. Defaults to null. 
        @param onMissingClass (optional): Function to transform/error on token if class missing
	*/
        var classId, AClass;
		var id = token.getId();
		var instance = {};
		if ((context != null) && (id in context)){
			instance = context[id];
		} else {
			//Need to import the right class
			classId = token.getClassId();
			AClass = Zet.getFactoryClass(classId);
			if (typeof AClass !== "undefined"){
                instance = AClass();
                instance.initializeFromToken(token, context);
            } else {
                if (onMissingClass == null){
                    onMissingClass = defaultOnMissing;
                }
                instance = onMissingClass(token);
            }	
		}
		return instance;
	};
	
    var defaultOnMissing = function(token, errorOnMissing){
        if (!(errorOnMissing)){
            console.log("ERROR: Couldn't make class from factory: " + token.getClassId());
            return token;
        } else {
            throw new Error("Class Factory failed to import " + token.getClassId());
        }
    };
    
    // Convenience Function to Serialize and Un-Serialize Objects
    //----------------------------------------------------------
    var serializeObject = function serializeObject(obj, sFormat){
        /** A function that will attempt to turn any valid object 
            (Serializable, StorageToken, map, list, atomic) into 
            its string serialized equivalent.
            @param obj: Any object that can be serialized, i.e., Serializable, StorageToken, TokenRWFormat.VALID_VALUE_TYPES
            @type obj: object
            @param sFormat: Serializable format to pack things as
            @type sFormat: string
            @return: Serialized object
            @rtype: string
        **/
        return makeSerialized(tokenizeObject(obj), sFormat);
    };
    
    var nativizeObject = function nativizeObject(obj, context, sFormat){
        /** A function that will attempt to turn any valid object 
            (Serializable, StorageToken, map, list, atomic) into 
            its highest native equivalent (Serializable > StorageToken > list/map > atomic).
            @param obj: Any object that can be serialized, i.e., Serializable, StorageToken, TokenRWFormat.VALID_VALUE_TYPES
            @type obj: object
            @param sFormat: Serializable format to unpack things as
            @type sFormat: string
            @return: Least serialized form of this object
            @rtype: string
        **/ 
        if (Serializable.isInstance(obj)){
            return obj;
        } else if (StorageToken.isInstance(obj)){
            return createFromToken(obj, context);
        } else if (typeof obj === "string" || obj instanceof String){
            obj = makeNative(obj, sFormat);
            return untokenizeObject(obj);
        } else {
            return obj;
        }
    };
    
    // Convenience Function to Tokenize and Un-Tokenize Objects
    //----------------------------------------------------------
    var tokenizeObject = function (obj) {
        var i, key, rt;
        rt = null;
        //Generic function to tokenize an object
        if (Serializable.isInstance(obj)) {// Serializable
            rt = obj.saveToToken();  
        } else if (obj instanceof Array){ // Array
            rt = [];
            for (i=0; i<obj.length; i++) {
                rt[i] = tokenizeObject(obj[i]);  
            }
        } else if ((obj instanceof Object) &&
                  !(obj instanceof Array)){ // Object
            rt = {};
            for (key in obj) {
                rt[tokenizeObject(key)] = tokenizeObject(obj[key]);  
            }
        } else {
            rt = obj;
        }
        return rt;
    };

    var untokenizeObject = function(obj, context){
    /** Generic function to create an object from a token 
        @param obj: Object to turn from tokens into object
        @param context (optional): Mutable context for the loading process. Defaults to null. 
    */
        var i, key;
        var rt = null;
        if (StorageToken.isInstance(obj)) {// StorageToken
            rt = createFromToken(obj, context);
        } else if (obj instanceof Array) { // Array
            rt = [];
            for (i in obj) { 
                rt[i] = untokenizeObject(obj[i], context);
            }
        } else if ((obj instanceof Object) &&
                  !(obj instanceof Array)){ // Object
            rt = {};
            for (key in obj) {
                rt[untokenizeObject(key, context)] = untokenizeObject(obj[key], context);
            }
        } else {
            rt = obj;
        }
        return rt;
    };
    
    // Convenience functions to serialize and unserialize tokens and raw data
    //---------------------------------------------
    var makeSerialized = function makeSerialized(obj, sFormat){
    /** Generic function to turn a tokenized object into serialized form
        @param obj: Tokenized object
        @param sFormat (optional): Serialization format.  Defaults to JSON_FORMAT
    */
        if (sFormat === undefined){ // Default format is JSON_FORMAT
            sFormat = JSON_FORMAT;
        }
        if (sFormat == JSON_FORMAT){
            return JSONRWFormatter.serialize(obj);
        }else if (sFormat == XML_FORMAT){
            return XMLRWFormatter.serialize(obj);
        } else {
            throw new TypeError("No serialization format of type: " + sFormat);
        }
    };

    var makeNative = function makeNative(String, sFormat){
    /** Generic function to turn a serialized string into a tokenized object
    *   @param String: Serialized object, as a string
    *   @param sFormat (optional): Serialization format.  Defaults to JSON_FORMAT
    */
        if (sFormat === undefined){ // Default format is JSON_FORMAT
            sFormat = JSON_FORMAT;
        }
        if (sFormat == JSON_FORMAT){
            return JSONRWFormatter.parse(String);
        }else if (sFormat == XML_FORMAT){
            // Not currently implemented
            return XMLRWFormatter.parse(String);
        } else {
            throw new TypeError("No unserialization format of type: " + sFormat);
        }
    };
    
    // Expose Variables Publicly
    Serialization.JSON_FORMAT = JSON_FORMAT;
    Serialization.XML_FORMAT = XML_FORMAT;
    Serialization.VALID_SERIAL_FORMATS = VALID_SERIAL_FORMATS;
    
    // Expose Functions Publicly
	Serialization.createFromToken = createFromToken;
    Serialization.serializeObject = serializeObject;
    Serialization.nativizeObject = nativizeObject;
    Serialization.makeSerialized = makeSerialized;
    Serialization.makeNative = makeNative;
    Serialization.tokenizeObject = tokenizeObject;
    Serialization.untokenizeObject = untokenizeObject;
    
    // Expose Classes Publicly
    Serialization.Serializable = Serializable;
    Serialization.NamedSerializable = NamedSerializable;
    Serialization.StorageToken = StorageToken;
    Serialization.TokenRWFormat = TokenRWFormat;
    Serialization.JSONRWFormat = JSONRWFormat;
	//Serialization.XMLRWFormat = XMLRWFormat;
	
	// Expose Instances Publicly
	Serialization.JSONRWFormatter = JSONRWFormatter;
	//Serialization.XMLRWFormatter = XMLRWFormatter;
})(window.Serialization = window.Serialization || {});

// Basic Test Debug Code: To see that things work
if (false) {
    print("Create The Serializable");
    x = Serialization.Serializable();
    print("Is Serializable: " + Zet(x).instanceOf(Serializable));
    print("Is Token: " + Zet(x).instanceOf(StorageToken));
    print("ID: " + x.getId());
    print("ClassID: " + x.getClassId());
    print("");
    
    print("Create the Storage Token");
    token = x.saveToToken();
    print("Is Serializable: " + Zet(token).instanceOf(Serializable));
    print("Is Token: " + Zet(token).instanceOf(StorageToken));
    print("ID: " + token.getId());
    print("ClassID: " + token.getClassId());
    print("Keys: " + token.keys());
}