package edu.asu.laits.gui;

import edu.asu.laits.editor.ApplicationContext;
import javax.swing.JOptionPane;
import javax.swing.LookAndFeel;
import javax.swing.UIManager;

import edu.asu.laits.properties.GlobalProperties;
import java.awt.Graphics;
import java.util.Arrays;
import javax.swing.JApplet;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

/**
 *
 * This is a class that only contain an static main method to start the
 * application. It simply starts the application.
 */
public class Application extends JApplet{

    
    
    /**
     * @param args
     */
    public static void main(String[] args) {
        //UserRegistration reg = new UserRegistration(null, true);
        if(args.length < 3){
            System.err.println("Invalid initialization parameters");
            System.err.println("Usage: USER_ID MODE PROBLEM_ID");
            System.exit(1);
        }
        
        
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
                        "Could not load theme "+uiClassName, JOptionPane.ERROR_MESSAGE);
                    }
                }

                // Main application window of LAITS
                MainWindow window = new MainWindow();
                window.setVisible(true);

            } catch (Exception e) {
                JOptionPane.showMessageDialog(null, e.getMessage(),
                        "An error has occured. Contact Support.", JOptionPane.ERROR_MESSAGE);

                e.printStackTrace();
            }
        }
    }
    
    private static void initializeApplication(String[] args){
        String username = args[0];        
        String mode = args[1];
        String problem_id = args[2];
//        String username = "ramayan";
//        String mode = "STUDENT";
//        String problem_id = "105";
        
        ApplicationContext.setUserID(username);
        ApplicationContext.setUserValid(true);
        
        ApplicationContext.setCurrentTaskID(problem_id);
        ApplicationContext.setAppMode(mode);
    }
    
}
