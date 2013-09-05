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
import edu.asu.laits.logger.HttpAppender;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.gui.menus.ModelMenu;
import edu.asu.laits.model.LaitsSolutionExporter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
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

    public static void saveSession() {
        PersistenceManager persistanceManager = new PersistenceManager(new GraphSaver(ApplicationContext.getGraphEditorPane()));
        Thread t = new Thread(persistanceManager);
        t.start();
    }

    public void run() {
        int statusCode = 0;

        HttpAppender sessionSaver = new HttpAppender();

        try {
            ModelMenu.updateGraph();
            //if user is in AUTHOR mode save solution in server
            if (ApplicationContext.getAppMode().equalsIgnoreCase("AUTHOR")) {
                String sendSession = sessionSaver.saveGetSession("author_save", ApplicationContext.getRootURL().concat("/save_solution.php"),
                        ApplicationContext.getUserID(), ApplicationContext.getSection(), ApplicationContext.getCurrentTaskID(),
                        ModelMenu.graph, "");
                statusCode = Integer.parseInt(sendSession);
                if (statusCode == 200) {
                    logs.info("Successfully saved author's solution to server using " + ApplicationContext.getRootURL().concat("/save_solution.php"));
                } else {
                    logs.error("Error: URL " + ApplicationContext.getRootURL().concat("/save_solution.php")
                            + " returned status code " + statusCode);
                }
            }
            //save current session in server (all modes, including author, so that user can restart session.
            String sendSession = sessionSaver.saveGetSession("save", ApplicationContext.getRootURL().concat("/postvar.php"),
                    ApplicationContext.getUserID(), ApplicationContext.getSection(), ApplicationContext.getCurrentTaskID(),
                    URLEncoder.encode(graphSaver.getSerializedGraphInXML(), "UTF-8"), "");
            statusCode = Integer.parseInt(sendSession);

            if (statusCode == 200) {
                logs.info("Successfully wrote session to server using " + ApplicationContext.getRootURL().concat("/postvar.php"));
            } else {
                logs.error("Error: URL " + ApplicationContext.getRootURL().concat("/postvar.php")
                        + " returned status code " + statusCode);
            }
        } catch (Exception ex) {
            java.util.logging.Logger.getLogger(PersistenceManager.class.getName()).log(Level.SEVERE, null, ex);
            logs.error("Exception caught while attempting to write to server. File: PersistenceManager.java.");
            logs.error("Error in sending request to server: returned: " + statusCode);
        }
    }
}
