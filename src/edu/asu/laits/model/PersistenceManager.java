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

/**
 * Class responsible for writing student's working solution at the server
 * Student will be able to restore half finished models using same userid
 *
 * @author ramayantiwari
 */
public class PersistenceManager implements Runnable {

    
    private static String URL = "http://dragoon.asu.edu/demo/save_session.php?";
    private GraphSaver graphSaver = null;
    private Map<String, String> parameters = null;
    
    public PersistenceManager(GraphSaver gs) {
        graphSaver = gs;
    }

    public void run() {
        int statusCode = 0;

        try {
            while (true) {
                DefaultHttpClient httpClient = new DefaultHttpClient();
                
                HttpGet httpMethod = new HttpGet(prepareHttpGetRequest());
                HttpResponse response = httpClient.execute(httpMethod);
                statusCode = response.getStatusLine().getStatusCode();
                
                if (statusCode != HttpStatus.SC_OK) {
                    System.out.println("Error Server URL " + httpMethod.getURI() + " return status code " + statusCode);
                }
                
                Thread.sleep(30 * 1000);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException ex) {
            ex.printStackTrace();
        } catch (IOException e) {
            System.out.println("Io error in sending request to server: returned: " + statusCode);
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
            parameters.put("groupNum", "login.html");
            parameters.put("problemNum", ApplicationContext.getCurrentTaskID());
        }
        parameters.put("saveData", URLEncoder.encode(graphSaver.getSerializedGraphInXML(), "UTF-8"));
        
        return parameters;
    }
}
