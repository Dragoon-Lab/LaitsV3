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

import edu.asu.laits.editor.ApplicationContext;
import javax.swing.JOptionPane;
import javax.swing.LookAndFeel;
import javax.swing.UIManager;

import edu.asu.laits.properties.GlobalProperties;
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

        if (ApplicationContext.isUserValid()) {
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
    }

    private static void initializeApplication(String[] args) {
        // Check if application was launched using command line args
        if(args.length > 0 && args.length <= 3){
            System.out.println("Application was launched from Command Line");
            ApplicationContext.setApplicationEnvironment(ApplicationContext.ApplicationEnvironment.DEV);
            
            ApplicationContext.setUserID(args[0]);
            ApplicationContext.setAppMode(args[1]);
            ApplicationContext.setCurrentTaskID(args[2]);
            
        }else {
            // Try to Launch application using JNLP for PROD
            String userName = System.getProperty("jnlp.username");
            if(userName != null){
                ApplicationContext.setApplicationEnvironment(ApplicationContext.ApplicationEnvironment.PROD);
                ApplicationContext.setUserID(userName);
                ApplicationContext.setAppMode(System.getProperty("jnlp.mode"));
                ApplicationContext.setCurrentTaskID(System.getProperty("jnlp.problem"));                            
            }else{
                JOptionPane.showMessageDialog(null, "Incorrect Initialization Parameters",
                        "An error has occured. Contact Support.", JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }
        }
        ApplicationContext.setLoaderURL(System.getProperty("jnlp.server","http://dragoon.asu.edu/devel"));
        ApplicationContext.setRootURL(System.getProperty("jnlp.server","http://dragoon.asu.edu/devel"));
        ApplicationContext.setSection(System.getProperty("jnlp.section","testing"));
        
        System.out.println("Application is Running in : "+ApplicationContext.getApplicationEnvironment()
                +" Environment and "+ApplicationContext.getAppMode().toString()+" Mode");
        ApplicationContext.setUserValid(true);
    }
}
