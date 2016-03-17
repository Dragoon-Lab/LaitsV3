/** Serialization Package for recursively serializing objects in a canonical format
    intended for class factory instantiation across different languages and systems.
    Package: SuperGLU
    Authors: Benjamin Nye and Daqi Dong
    License: APL 2.0
    Requires:
        - uuid.js
        - zet.js

    Description: 
    -----------------------------------
    This package is intended to allow serializing and unserializing
    between JavaScript objects and various serial/string representations (e.g., JSON, XML).
    The following objects are included:
        * Serializable: Base class for serializable objects, needed for custom serialization
        * StorageToken: Intermediate representation of a serializable object
        * TokenRWFormats: Serializes and recovers storage tokens and primatives to specific formats (e.g., JSON)
**/

if (typeof SuperGLU === "undefined"){
    var SuperGLU = {};
    if (typeof window === "undefined") {
        var window = this;
    }
    window.SuperGLU = SuperGLU;
}

// Module Declaration
(function (namespace, undefined) {

    var MAP_STRING = "map",
        LIST_STRING = 'list';
    
    var NAME_KEY = 'name';

	// Format Constants
	var JSON_FORMAT = 'json',
		XML_FORMAT = 'xml',
		VALID_SERIAL_FORMATS = [JSON_FORMAT, XML_FORMAT];
	
    /** Utility function to merge two mappings 
        @param targetObj: Object to have key-value pairs added
        @param sourceObj: Object to take keys from
        @return: Modified version of the targetObj
    **/
	var updateObjProps = function(targetObj, sourceObj){
        var key;
		for (key in sourceObj){
			targetObj[key] = sourceObj[key];
		}
        return targetObj;
	};
    
    // Base classes for serializable objects
    //---------------------------------------------

    /** Class Serializable
        A serializable object, that can be saved to token and opened from token
    **/
    Zet.declare('Serializable', {
        superclass : null,
        defineBody : function(self){
			// Constructor Function
            
            /** Constructor for serializable
            *   @param id (optional): GUID for this object.  If none given, a V4 random GUID is used.
            **/
            self.construct = function construct(id){
                if (id == null) {
                    self._id = UUID.genV4().toString();
                } else {
                    self._id = id;
                }
            };
            
            // Public Functions 
            /** Equality operator **/
            self.eq = function eq(other){
				return ((self.getClassId() == other.getClassId()) && (self.getId() == other.getId()));
            };

            /** Not-equal operator **/
            self.ne = function ne(other){
                return !(self.eq(other));
            };

            /** Get the ID for the serializable. Ideally unique. **/
            self.getId = function getId(){
                return self._id;
            };
            
            /** Update the id, either by setting a new one or generating a new random UUID 
                @param id: The new id for the serializable.  If null/undefined, generates new random UUID
            **/
            self.updateId = function updateId(id){
                if (id === undefined) {
                    self._id = UUID.genV4().toString();
                } else {
                    self._id = id;
                }
            };

            /** Get the class name for this serializable **/
            self.getClassId = function getClassId(){
                return self.className;
            };

            /** Initialize serializable from token.
                @param token: The token form of the object.
                @param context (optional): Mutable context for the loading process. Defaults to null. 
            */
            self.initializeFromToken = function initializeFromToken(token, context){
				self._id = token.getId();
            };

            /** Create and return a token form of the object that is valid to serialize **/
            self.saveToToken = function saveToToken(){
				var token = StorageToken(self.getId(), self.getClassId());
                return token;
            };
            
            /** Create a serialized version of this object **/
            self.saveToSerialized = function saveToSerialized(){
                return makeSerialized(self.saveToToken());
            };

            /** Create a clone of the object 
                @param newId: Unless false or 0, give the new clone a different UUID
                @return: A new serializable object of the right class type.
            **/
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

    /** A Serializable with a given name that will be stored with it **/
    Zet.declare('NamedSerializable' , {
        superclass : Serializable,
        defineBody : function(self){
			// Constructor Function
            self.NAME_KEY = NAME_KEY;
            
            /** Constructor for named serializable
            *   @param id (optional): GUID for this object.  If none given, a V4 random GUID is used.
            *   @param name: The name for the object
            **/
            self.construct = function construct(id, name){
                if (name == null) { name=null;}
                self.inherited(construct, [id]);
                self._name = name;
            };
            
            /** Get the name for the object **/
            self.getName = function getName(){
                return self._name;
            };
            
            /** Set the name for the object **/
            self.setName = function setName(name){
                if (name == null){
                    name = null; 
                } else if (name instanceof String || typeof name === 'string'){
                    self._name = name;
                } else {
                    throw new Error("Set name failed, was not a string.");
                }
            };
            
            /** Equality operator **/
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
    
    /** Class StorageToken
        An object that stores data in a form that can be serialized
    **/
    Zet.declare('StorageToken', {
        superclass : null,
        defineBody : function(self){
            // -- Class fields
            self.ID_KEY = 'id';
            self.CLASS_ID_KEY = 'classId';
            
            /** Constructor for storage token
                @param id (optional): GUID for this object.  If none given, a V4 random GUID is used.
                @param classId: The name of the class, as known by the class factory
                @param data: Object of key-value pairs to store for this token
            **/
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
            
            /** Get the ID for the storage token **/
            self.getId = function getId(){
                return self._data[self.ID_KEY];
            };

            /** Set the ID for the storage token **/
            self.setId = function setId(value){
                self._data[self.ID_KEY] = value;
            };

            /** Get the class name for the storage token **/
            self.getClassId = function getClassId(){
                return self._data[self.CLASS_ID_KEY];
            };

            /** Set the class name for the storage token **/
            self.setClassId = function setClassId(value){
                self._data[self.CLASS_ID_KEY] = value;
            };
            
            // Convenience Accessor for Named Serializables
            
            /** Get the name for the storage token (might be null) **/
            self.getName = function getName(){
                if (NAME_KEY in self._data){
                    return self._data[NAME_KEY];
                } else {
                    return null;
                }
            };

            /** Set a name for the storage token **/
            self.setName = function setName(value){
                self._data[NAME_KEY] = value;
            };

            // -- ##Generic Accessors
            
            /** Get the number of data values in the storage token **/
            self.len = function len(){
                return self._data.length;
            };

            /** Check if a given key is contained in the storage token **/
            self.contains = function contains(key){
                return key in self._data;
            };

            /** Get an item from the data dictionary
                @param key: Key for the item
                @param hasDefault (optional): If True, give a default value.  Else, raise an error if key not found.
                @param defaults (optional): The optional value for this item.
            */
            self.getitem = function getitem(key, hasDefault, defaults){

                if (!(key in self._data) && (hasDefault)){
                    return defaults;
                }else {
                    return self._data[key];
                }
            };

            /** Set an item in the data dictionary **/
            self.setitem = function setitem(key, value){
                self._data[key] = value;
            };

            /** Delete an item in the data dictionary **/
            self.delitem = function delitem(key){
                delete self._data[key];
            };

            /** Return an iterator over the data keys **/
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

            /** Return the data keys **/
            self.keys = function keys(){
                var k, aKeys;
                aKeys = [];
                for (k in self._data){
                    aKeys.push(k);
                }
                return aKeys;
            };

            // -- ##Comparison
            /** Equality operator **/
            self.eq = function eq(other){
                return (typeof(self) == typeof(other)) && (self._data == other._data);
            };

            /** Not equal operator **/
            self.ne = function ne(other){
                return !(self.eq(other));
            };

            // -- ##Validation
            /** Check if a key would be a valid data key **/
            self.isValidKey = function isValidKey(key){
                return typeof(key) in self.VALID_KEY_TYPES;
            };

            /** Check if a value would be a valid data value **/
            self.isValidValue = function isValidValue(value){
                return typeof(value) in self.VALID_VALUE_TYPES;
            };

            /** Check that the ID, Class Name, and any Name are valid types **/
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
    /** Base class for serializing or unserializing a token to a string **/
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
            self.VALID_VALUE_TYPES = updateObjProps(self.VALID_VALUE_TYPES, self.VALID_ATOMIC_VALUE_TYPES);
            self.VALID_VALUE_TYPES = updateObjProps(self.VALID_VALUE_TYPES, self.VALID_SEQUENCE_VALUE_TYPES);
            self.VALID_VALUE_TYPES = updateObjProps(self.VALID_VALUE_TYPES, self.VALID_MAPPING_VALUE_TYPES);
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


    /** JSON Formatted String: Uses JSON.stringify/JSON.parse **/
    Zet.declare('JSONRWFormat', {
        superclass : TokenRWFormat,
        defineBody : function(self){
            
            // Constructor method
            self.construct = function construct(){};
            
            // Public methods
            
            /** Parse a JSON-formatted string into basic javascript objects 
                (e.g., strings, numeric, arrays, objects) 
            **/
            self.parse = function parse(String) {//Parse a JSON string into javascript objects
                var decoded = JSON.parse(String);
                return self.makeNative(decoded);
            };

            /** Turn basic javascript objects into a JSON string **/
            self.serialize = function serialize(data) {
                var serializable = self.makeSerializable(data);
                return JSON.stringify(serializable);
            };

            /** Recursively make all objects serializable into JSON, 
                turning any lists, dicts, or StorageTokens into canonical forms
            **/
            self.makeSerializable = function makeSerializable(x){
                var i, key, keys, rt, temp, xType;
                xType = typeof(x);
                rt = null;
                // Primitive variables
				if ((xType in self.VALID_ATOMIC_VALUE_TYPES) || (x === null)){
                    rt = x;
                // Array
                } else if (x instanceof Array){ 
                    rt = {};
                    temp = [];
                    for (i=0; i<x.length; i++) {
                        temp[i] = self.makeSerializable(x[i]);
                    }
                    rt[LIST_STRING] = temp;
                // Object
                } else if ((x instanceof Object) && 
                            !(StorageToken.isInstance(x))){ 
                    rt = {};
                    temp = {};
                    for (key in x){
						temp[key] = self.makeSerializable(x[key]);
                    }
                    rt[MAP_STRING] = temp;
                // StorageToken
                } else if (StorageToken.isInstance(x)){ 
                    rt = {};
                    temp = {};
                    keys = x.keys();
                    for (i=0; i<keys.length; i++) {
						temp[self.makeSerializable(keys[i])] = self.makeSerializable(x.getitem(keys[i]));
                    }
                    rt[x.getClassId()] = temp;
                //Error
                } else { 
                    throw new TypeError("Tried to serialize unserializable object of type (" + xType + "): " + x);
                }
                return rt;
            };

            /** Recursively turn raw javascript objects in a canonical format into
                primitives, arrays, mappings, and StorageTokens.
            **/
            self.makeNative = function makeNative(x){
                var i, key, rt, temp, xType, dataTypeName;
                xType = typeof(x);
                rt = null;
                // Primitive variables
                if ((self.VALID_ATOMIC_VALUE_TYPES[xType]) || (x == null)){
                  rt = x;
                  return rt;
                }
                for (dataTypeName in x){
                    break;
                }
                // Array
                if (dataTypeName in self.VALID_SEQUENCE_VALUE_TYPES){ 
                    rt = [];
                    for (i=0; i<x[dataTypeName].length; i++) {
                        rt[i] = self.makeNative(x[dataTypeName][i]);
                    }
                // Object
                } else if (dataTypeName in self.VALID_MAPPING_VALUE_TYPES) { 
                    rt = {};
                    for (key in x[dataTypeName]) {
                        rt[key] = self.makeNative(x[dataTypeName][key]);
                    }
                // StorageToken (by default)
                } else { 
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
	
	/** Create a serializable instance from an arbitrary storage token
		@param token: Storage token
		@param context (optional): Mutable context for the loading process. Defaults to null. 
        @param onMissingClass (optional): Function to transform/error on token if class missing
	*/
	var createFromToken = function(token, context, onMissingClass){
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
	
    /** What to do if a class is missing (error or console message) **/
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
    var serializeObject = function serializeObject(obj, sFormat){
        return makeSerialized(tokenizeObject(obj), sFormat);
    };
    
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
    var nativizeObject = function nativizeObject(obj, context, sFormat){
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
    
    /** Generic function to tokenize an object, recursively **/
    var tokenizeObject = function (obj) {
        var i, key, rt;
        rt = null;
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
    
    /** Generic function to create an object from a token 
        @param obj: Object to turn from tokens into object
        @param context (optional): Mutable context for the loading process. Defaults to null. 
    */
    var untokenizeObject = function(obj, context){
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
    /** Generic function to turn a tokenized object into serialized form
        @param obj: Tokenized object
        @param sFormat (optional): Serialization format.  Defaults to JSON_FORMAT
    */
    var makeSerialized = function makeSerialized(obj, sFormat){
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

    /** Generic function to turn a serialized string into a tokenized object
    *   @param String: Serialized object, as a string
    *   @param sFormat (optional): Serialization format.  Defaults to JSON_FORMAT
    */
    var makeNative = function makeNative(String, sFormat){
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
    namespace.JSON_FORMAT = JSON_FORMAT;
    namespace.XML_FORMAT = XML_FORMAT;
    namespace.VALID_SERIAL_FORMATS = VALID_SERIAL_FORMATS;
    
    // Expose Functions Publicly
	namespace.createFromToken = createFromToken;
    namespace.serializeObject = serializeObject;
    namespace.nativizeObject = nativizeObject;
    namespace.makeSerialized = makeSerialized;
    namespace.makeNative = makeNative;
    namespace.tokenizeObject = tokenizeObject;
    namespace.untokenizeObject = untokenizeObject;
    
    // Expose Classes Publicly
    namespace.Serializable = Serializable;
    namespace.NamedSerializable = NamedSerializable;
    namespace.StorageToken = StorageToken;
    namespace.TokenRWFormat = TokenRWFormat;
    namespace.JSONRWFormat = JSONRWFormat;
	//namespace.XMLRWFormat = XMLRWFormat;
	
	// Expose Instances Publicly
	namespace.JSONRWFormatter = JSONRWFormatter;
	//namespace.XMLRWFormatter = XMLRWFormatter;
    
    SuperGLU.Serialization = namespace;
})(window.Serialization = window.Serialization || {});
