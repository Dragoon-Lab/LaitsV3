/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.logger;

import java.util.HashMap;
import java.util.Map;

public class LogMessage {

        private Map<String, String> parameters = new HashMap<String, String>();
        
        public void addParameter(String key, String value) {
                parameters.put(key, value);
        }
        
        public Map<String, String> getParametersMap() {
                return parameters;
        }
        
        @Override
        public String toString() {
                return parameters.toString();
        }
}
