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
import javax.swing.JApplet;

/**
 *
 * This is a class that only contain an static main method to start the
 * application. It simply starts the application.
 */
public class Application extends JApplet {

    /**
     * @param args
     */
    public static void main(String[] args) {

        initializeApplication(args);

        try {
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

    private static void initializeApplication(String[] args) {
        // Check if application was launched using command line args. 
        // Currently DEV mode will not perform session handling.
        if (args.length > 0 && args.length <= 3) {
            System.out.println("Application was launched from Command Line");
            ApplicationContext.setApplicationEnvironment(ApplicationContext.ApplicationEnvironment.DEV);

            ApplicationContext.setUserID(args[0]);
            ApplicationContext.setAppMode(args[1]);
            ApplicationContext.setCurrentTaskID(args[2].replace('_', ' '));
        } else {
            // Try to Launch application using JNLP for PROD
            String sessionID = System.getProperty("jnlp.session_id");

            if (sessionID != null) {
                Gson gson = new Gson();
                String json = readUrl("http://dragoon.asu.edu/ram/postvar.php?action=get_session_info&session_id=" + sessionID);

                UserSession userSession = gson.fromJson(json, UserSession.class);

                ApplicationContext.setApplicationEnvironment(ApplicationContext.ApplicationEnvironment.PROD);
                ApplicationContext.setUserID(userSession.username);
                ApplicationContext.setAppMode(userSession.mode);
                ApplicationContext.setCurrentTaskID(userSession.problem_name);

            } else {
                JOptionPane.showMessageDialog(null, "Incorrect Initialization Parameters",
                        "An error has occured. Contact Support.", JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }
        }

        System.out.println("Application is Running in : " + ApplicationContext.getApplicationEnvironment()
                + " Environment and " + ApplicationContext.getAppMode().toString() + " Mode");
    }

    private static String readUrl(String urlString) {
        BufferedReader reader = null;

        try {
            URL url = new URL(urlString);
            reader = new BufferedReader(new InputStreamReader(url.openStream()));
            StringBuffer buffer = new StringBuffer();
            int read;
            char[] chars = new char[1024];
            while ((read = reader.read(chars)) != -1) {
                buffer.append(chars, 0, read);
            }

            return buffer.toString();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }

    private static class UserSession {
        String session_id;
        String username;
        String problem_name;
        String mode;
        String section;
    }
}
