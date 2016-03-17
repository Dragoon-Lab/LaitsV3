/** SuperGLU (Generalized Learning Utilities) Standard API
    This manages all versioning within the core libraries.
    
    Package: SuperGLU (Generalized Learning Utilities)
    Author: Benjamin Nye
    License: APL 2.0
    
    Requires:
        - Util\uuid.js 
        - Util\zet.js 
        - Util\serializable.js
        - Core\messaging.js
        - Core\messaging-gateways.js
**/

if (typeof window === "undefined") {
    var window = this;
}

(function(namespace, undefined) {
namespace.version = "0.1.9";

// Core API Modules
if ((namespace.Zet == null) && typeof Zet !== 'undefined'){ 
    namespace.Zet = Zet; 
}
if ((namespace.Serialization == null) && typeof Serialization !== 'undefined'){ 
    namespace.Serialization = Serialization; 
}
if ((namespace.Messaging == null) && typeof Messaging !== 'undefined'){ 
    namespace.Messaging = Messaging; 
}
if ((namespace.Messaging_Gateway == null) && typeof Messaging_Gateway !== 'undefined'){ 
    namespace.Messaging_Gateway = Messaging_Gateway; 
}

// Sets to monitor registered verbs and context keys in this context
if (namespace.VERBS == null){ namespace.VERBS = {}; }
if (namespace.CONTEXT_KEYS == null){ namespace.CONTEXT_KEYS = {}; }

})(window.SuperGLU = window.SuperGLU || {});