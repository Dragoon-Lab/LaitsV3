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
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import javax.swing.JOptionPane;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
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
        String action = ApplicationContext.isAuthorMode() ? "author_load" : "load";
        String serviceURL = ApplicationContext.getRootURL().concat("/postvar.php");
        
        return sendHTTPRequest(action, serviceURL, "");
    }
    
    public void run() {
        int statusCode = 0;
        String action = ApplicationContext.isAuthorMode() ? "author_save" : "save";
        String serviceURL = ApplicationContext.getRootURL().concat("/postvar.php");
        
        try {
            String sessionData = URLEncoder.encode(graphSaver.getSerializedGraphInXML(), "UTF-8");
            String response = sendHTTPRequest(action, serviceURL, sessionData);
            statusCode = Integer.parseInt(response);
            if (statusCode == 200) {
                logs.info("Successfully wrote session to server using " + ApplicationContext.getRootURL().concat("/postvar.php"));
            } else {
                JOptionPane.showMessageDialog(MainWindow.getInstance(), 
                        "Save to server failed. Use File > Save As to save file locally.", "Save Failed...", JOptionPane.ERROR_MESSAGE);  
                
                logs.error("Error: URL " + ApplicationContext.getRootURL().concat("/postvar.php")
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
        logs.debug("Opening Connection . Action: "+action+" URL: "+address);
        URL url = new URL(address);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        //sets POST and adds POST data type as URLENCODED
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

        //sets mode as output and disables cache
        connection.setUseCaches(false);
        connection.setDoInput(true);
        connection.setDoOutput(true);

        //add variables to send
        List<NameValuePair> postVariable = new ArrayList<NameValuePair>();
        
        postVariable.add(new BasicNameValuePair("action", action));
        postVariable.add(new BasicNameValuePair("id", ApplicationContext.getUserID()));
        postVariable.add(new BasicNameValuePair("section", ApplicationContext.getSection()));
        if(ApplicationContext.getCurrentTask().getTaskName().equals("") || !ApplicationContext.isAuthorMode()){
            // Author mode save should also include boolean 'share' variable
            // which determines whether others in section can view solution.
            postVariable.add(new BasicNameValuePair("problem", ApplicationContext.getCurrentTaskID()));
        } else{
            postVariable.add(new BasicNameValuePair("problem", ApplicationContext.getCurrentTask().getTaskName()));
        }
            
        postVariable.add(new BasicNameValuePair("author", ApplicationContext.getAuthor()));
        
        logs.debug("Post Variables sending: "+postVariable);
        
        if (action.equals("save") || action.equals("author_save")) {
            postVariable.add(new BasicNameValuePair("saveData", data));
        }
        
        //sends request
        OutputStream stream = new DataOutputStream(connection.getOutputStream());
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(stream, "UTF-8"));
        writer.write(getQuery(postVariable));
        writer.close();
        stream.flush();
        stream.close();

        // If action = 'save' or 'author_save', gets and returns response code. 200 is ok.       
        if (action.equals("save") || action.equals("author_save")) {
            int response = connection.getResponseCode();
            connection.disconnect();
            return Integer.toString(response);
        } // If action = 'load' or 'author_load', returns string with loaded problem.
        else if (action.equals("load") || action.equals("author_load")) {
            StringBuilder returnString = new StringBuilder();
            BufferedReader in = new BufferedReader(new InputStreamReader(
                    connection.getInputStream()));
            String line = "";
            while ((line = in.readLine()) != null) {
                returnString.append(line);
                returnString.append("\n");
            }
            in.close();
            connection.disconnect();
            return returnString.toString();
        }
        connection.disconnect();
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

        return result.toString();
    }
}
