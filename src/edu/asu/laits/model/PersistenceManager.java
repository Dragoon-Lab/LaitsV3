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
import edu.asu.laits.gui.MainWindow;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;
import javax.swing.JOptionPane;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;

/**
 * Class responsible for writing student's working solution at the server
 * Student will be able to restore half finished models using same userid
 *
 * @author ramayantiwari, brandonstrong
 */
public class PersistenceManager implements Runnable {

    private GraphSaver graphSaver;
    private static Logger logs = Logger.getLogger("DevLogs");

    private PersistenceManager(GraphSaver gs) {
        graphSaver = gs;
    }

    public static synchronized void saveSession() {
        PersistenceManager persistanceManager = new PersistenceManager(new GraphSaver());
        Thread t = new Thread(persistanceManager);
        t.start();
    }

    public static synchronized String loadSession() throws IOException{
        String action = "load";
        String serviceURL = ApplicationContext.APP_HOST.concat("session_manager.php");
        
        return sendHTTPRequest(action, serviceURL, "");
    }
    
    public void run() {
        int statusCode = 0;
        String action = "save";
        String serviceURL = ApplicationContext.APP_HOST.concat("session_manager.php");
        
        try {
            String sessionData = graphSaver.getSerializedGraphInXML();
            String response = sendHTTPRequest(action, serviceURL, sessionData);
            statusCode = Integer.parseInt(response);
            if (statusCode == 200) {
                logs.info("Successfully wrote session to server using " + ApplicationContext.APP_HOST.concat("session_manager.php"));
            } else {
                JOptionPane.showMessageDialog(MainWindow.getInstance(), 
                        "Save to server failed. Use File > Save As to save file locally.", "Save Failed...", JOptionPane.ERROR_MESSAGE);  
                
                logs.error("Error: URL " + ApplicationContext.APP_HOST.concat("session_manager.php")
                        + " returned status code " + statusCode);
            }            
        } catch (IOException ex) {
            ex.printStackTrace();
            logs.error("Exception caught while attempting to write to server. File: PersistenceManager.java.");
            logs.error("Error in sending request to server: returned: " + statusCode);
        }
    }
    
    public static String sendHTTPRequest(String action, String address, String data) throws IOException {
        //open connection
        logs.debug("Opening Connection . Action: " + action + " URL: " + address);

        HttpClient httpClient = new DefaultHttpClient();         
        HttpPost httpPost = new HttpPost(address);
        httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");
        
        try {
            //add variables to send
            List<NameValuePair> postVariable = new ArrayList<NameValuePair>();

            postVariable.add(new BasicNameValuePair("action", action));
            postVariable.add(new BasicNameValuePair("session_id", ApplicationContext.getSessionID()));
            
            
            if (action.equals("save")) {                
                data = URLEncoder.encode(data, "UTF-8");
                postVariable.add(new BasicNameValuePair("save_data", data));
            }

            httpPost.setEntity(new UrlEncodedFormEntity(postVariable, "UTF-8"));            
            HttpResponse response = httpClient.execute(httpPost);
            
            if(action.equals("save")) {
                String responseCode = String.valueOf(response.getStatusLine().getStatusCode());
                return responseCode;
            }
            
            HttpEntity respEntity = response.getEntity();

            if (respEntity != null) {
                String content = EntityUtils.toString(respEntity);                                
                return content;
            }

        }catch (UnknownHostException e) {
            logs.error("UnknownHostException in sending HTTP Post " + e.getMessage());
            JOptionPane.showMessageDialog(null, "Unable to connect to Internet.\nPlease check your connection and try again.", "Network Error", JOptionPane.ERROR_MESSAGE);  
            System.exit(0);
        }
        catch (UnsupportedEncodingException e) {
            logs.error("UnsupportedEncodingException in sending HTTP Post " + e.getMessage());
            e.printStackTrace();
        } catch (ClientProtocolException e) {
            logs.error("Client Protocol Exception in sending HTTP Post " + e.getMessage());
            e.printStackTrace();
        } catch (IOException e) {
            logs.error("IOException in sending HTTP Post " + e.getMessage());
            e.printStackTrace();
        }

        return null;        
    }    
    
    public static String getQuery(List<NameValuePair> params) throws UnsupportedEncodingException {
        StringBuilder result = new StringBuilder();
        boolean first = true;

        for (NameValuePair pair : params) {
            if (first) {
                first = false;
            } else {
                result.append("&");
            }

            result.append(pair.getName());
            result.append("=");
            result.append(pair.getValue());
        }

        return result.toString().replace(" ", "%20");
    }
}
