/**
 * LAITS Project Arizona State University (c) 2013, Arizona Board of Regents for
 * and on behalf of Arizona State University. This file is part of LAITS.
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
package edu.asu.laits.gui;

import com.google.gson.Gson;
import edu.asu.laits.editor.ApplicationContext;
import javax.swing.JOptionPane;
import javax.swing.LookAndFeel;
import javax.swing.UIManager;

import edu.asu.laits.properties.GlobalProperties;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;

/**
 *
 * This is a class that only contain an static main method to start the
 * application. It simply starts the application.
 */
public class Application {

    public static void main(String[] args) {

        try {
            initializeApplication(args);
            String uiClassName = GlobalProperties.getInstance().getUITheme();
            if (null != uiClassName) {
                try {
                    UIManager.setLookAndFeel((LookAndFeel) Class.forName(
                            uiClassName).newInstance());
                } catch (Exception e) {
                    JOptionPane.showMessageDialog(null, e.getMessage(),
                            "Could not load theme " + uiClassName, JOptionPane.ERROR_MESSAGE);
                }
            }

            // Main application window of LAITS
            MainWindow.launch();

        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage(),
                    "An error has occured. Contact Support.", JOptionPane.ERROR_MESSAGE);

            e.printStackTrace();
        }

    }

    private static void initializeApplication(String[] args) throws Exception {
        // Check if application was launched using command line args. 
        // Currently DEV mode will not perform session handling.
        if (args.length > 0) {
            System.out.println("Application was launched from Command Line");
            ApplicationContext.APP_HOST = "http://dragoon.asu.edu/devel/";
            ApplicationContext.forumURL = "http://dragoon.asu.edu/devel/";
            ApplicationContext.setApplicationEnvironment(ApplicationContext.ApplicationEnvironment.PROD);
            ApplicationContext.setSessionID("testsession4");
            ApplicationContext.setUserID("ramayantiwari");
            ApplicationContext.setAppMode("student");
            ApplicationContext.setCurrentTaskID("isle1");
            
        } else {
            // Try to Launch application using JNLP for PROD
            String sessionID = System.getProperty("jnlp.session_id");
            String hostURL = System.getProperty("jnlp.host_url");
            String forumURL = System.getProperty("jnlp.forum_url");

            if (sessionID != null && hostURL != null && forumURL != null) {
                ApplicationContext.setSessionID(sessionID);
                ApplicationContext.APP_HOST = hostURL;
                ApplicationContext.forumURL = forumURL;
                System.out.println("HOST: " + hostURL + " FORUM: " + forumURL);
                Gson gson = new Gson();
                String json = readUrl(ApplicationContext.APP_HOST + "session_manager.php?action=get_session_info&session_id=" + sessionID);

                UserSession userSession = gson.fromJson(json, UserSession.class);

                ApplicationContext.setApplicationEnvironment(ApplicationContext.ApplicationEnvironment.PROD);
                ApplicationContext.setUserID(userSession.username);
                ApplicationContext.setAppMode(userSession.mode);
                ApplicationContext.setCurrentTaskID(userSession.problem_name);
                ApplicationContext.setSessionID(userSession.session_id);
                
            } else {
                JOptionPane.showMessageDialog(null, "Incorrect Initialization Parameters",
                        "An error has occured. Contact Support.", JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }
        }

        System.out.println("Application is Running in : " + ApplicationContext.getApplicationEnvironment()
                + " Environment and " + ApplicationContext.getAppMode().toString() + " Mode");
    }

    private static String readUrl(String urlString) throws Exception {
        BufferedReader reader = null;

        URL url = new URL(urlString);
        reader = new BufferedReader(new InputStreamReader(url.openStream()));
        StringBuffer buffer = new StringBuffer();
        int read;
        char[] chars = new char[1024];
        while ((read = reader.read(chars)) != -1) {
            buffer.append(chars, 0, read);
        }

        return buffer.toString();
    }

    /**
     * Class to encapsulate user session. Used with JSON reader.
     */
    private static class UserSession {
        String session_id;
        String username;
        String problem_name;
        String mode;
        String section;
    }
}
