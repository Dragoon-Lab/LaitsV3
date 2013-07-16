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

            } catch (Exception e) {
                JOptionPane.showMessageDialog(null, e.getMessage(),
                        "An error has occured. Contact Support.", JOptionPane.ERROR_MESSAGE);

                e.printStackTrace();
            }
        }
    }
    
    private static void initializeApplication(String[] args){
        String username = System.getProperty("jnlp.username",args[0]);        
        String mode = System.getProperty("jnlp.mode",args[1]);
        String problem_id = System.getProperty("jnlp.problem",args[2]);
        
        ApplicationContext.setUserID(username);
        ApplicationContext.setUserValid(true);
        
        ApplicationContext.setCurrentTaskID(problem_id);
        ApplicationContext.setAppMode(mode);    
        ApplicationContext.setLoaderURL(
                System.getProperty("jnlp.server","http://dragoon.asu.edu/demo")
                );  
    }
}
