/**
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State
 * University. This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * LAITS is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS. If not, see <http://www.gnu.org/licenses/>.
 */

package edu.asu.laits.model;

import edu.asu.laits.editor.ApplicationContext;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.log4j.Logger;

/**
 * Class responsible for writing student's working solution at the server
 * Student will be able to restore half finished models using same userid
 *
 * @author ramayantiwari
 */
public class PersistenceManager implements Runnable {

    
    private static String URL = ApplicationContext.getRootURL().concat("/save_session.php?");
    
    private GraphSaver graphSaver;
    private Map<String, String> parameters = null;
    
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    private PersistenceManager(GraphSaver gs) {
        graphSaver = gs;
    }
    
    public static void saveSession(){
        PersistenceManager persistanceManager = new PersistenceManager(new GraphSaver(ApplicationContext.getGraphEditorPane()));
        
        Thread t = new Thread(persistanceManager);
        t.start();
    }
    
    public void run() {
        int statusCode = 0;

        try {
            DefaultHttpClient httpClient = new DefaultHttpClient();

            HttpGet httpMethod = new HttpGet(prepareHttpGetRequest());
            HttpResponse response = httpClient.execute(httpMethod);
            statusCode = response.getStatusLine().getStatusCode();

            if (statusCode != HttpStatus.SC_OK) {
                logs.error("Error Server URL " + httpMethod.getURI() + " return status code " + statusCode);
            }
               
            logs.info("Successfully Written Session to Server at "+httpMethod.getURI());
        } catch (UnsupportedEncodingException ex) {
            ex.printStackTrace();
        } catch (IOException e) {
            logs.error("Io error in sending request to server: returned: " + statusCode);
        } 
    }

    
    private String prepareHttpGetRequest() throws UnsupportedEncodingException {
        StringBuilder sb = new StringBuilder(URL);

        Map<String, String> map = prepareMessageMap();
        for (Map.Entry<String, String> entry : map.entrySet()) {
            sb.append(entry.getKey());
            sb.append("=");
            sb.append(entry.getValue());
            sb.append("&");
        }

        sb.deleteCharAt(sb.length() - 1);
        return sb.toString();
    }

    private Map<String, String> prepareMessageMap() throws UnsupportedEncodingException {
        if (parameters == null) {
            parameters = new HashMap<String, String>();
            parameters.put("id", ApplicationContext.getUserID());
            parameters.put("section", ApplicationContext.getSection());
            parameters.put("problemNum", ApplicationContext.getCurrentTaskID());
        }
        parameters.put("saveData", URLEncoder.encode(graphSaver.getSerializedGraphInXML(), "UTF-8"));
        
        return parameters;
    }
}
