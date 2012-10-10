package edu.asu.laits.gui;

import edu.asu.laits.editor.ApplicationUser;
import javax.swing.JOptionPane;
import javax.swing.LookAndFeel;
import javax.swing.UIManager;

import edu.asu.laits.properties.GlobalProperties;
import org.apache.log4j.Logger;

/**
 *
 * This is a class that only contain an static main method to start the
 * application. It simply starts the application.
 */
public class Application {

    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger(Application.class);

    /**
     * @param args
     */
    public static void main(String[] args) {
        UserRegistration reg = new UserRegistration(null, true);
        
        /*try {
            String uiClassName = GlobalProperties.getInstance().getUITheme();
            if (null != uiClassName) {
                try {
                    UIManager.setLookAndFeel((LookAndFeel) Class.forName(
                            uiClassName).newInstance());
                } catch (Exception e) {
                    System.err.println("Could not load theme: " + uiClassName);
                }
            }
            
            // Main application window of LAITS
            MainWindow window = new MainWindow();

            window.setVisible(true);

        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage(),
                    "An error has occured", JOptionPane.ERROR_MESSAGE);

            e.printStackTrace();
        }*/
    }
}
