package edu.asu.laits.gui.menus;

import java.awt.Frame;

import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuItem;

import edu.asu.laits.gui.AboutDialog;
import edu.asu.laits.properties.GlobalProperties;
import org.apache.log4j.Logger;

/**
 * A menu where you can choose to open the about menu and the help menu.
 */
public class HelpAboutMenu extends JMenu {

    private JMenuItem helpHelpMenuItem = null;
    private JMenuItem aboutHelpMenuItem = null;
    private Frame mainFrame;

    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    /**
     * This method initializes
     *
     */
    public HelpAboutMenu(Frame mainFrame) {
        super();
        this.mainFrame = mainFrame;
        initialize();
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.setText("Help");
        this.add(getHelpHelpMenuItem());
        this.add(getAboutHelpMenuItem());

    }

    /**
     * This method initializes helpHelpMenuItem
     */
    private JMenuItem getHelpHelpMenuItem() {
        if (helpHelpMenuItem == null) {
            helpHelpMenuItem = new JMenuItem();
            helpHelpMenuItem.setText("Help...");
            helpHelpMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    activityLogs.info("User Opened Help Menu.");
                    GlobalProperties.getInstance().getHelpBroker()
                            .setDisplayed(true);
                    GlobalProperties.getInstance().getHelpBroker()
                            .setCurrentID("introduction");
                }
            });
        }
        return helpHelpMenuItem;
    }

    /**
     * This method initializes aboutHelpMenuItem
     */
    private JMenuItem getAboutHelpMenuItem() {
        if (aboutHelpMenuItem == null) {
            aboutHelpMenuItem = new JMenuItem();
            aboutHelpMenuItem.setText("About...");
            aboutHelpMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    activityLogs.info("User selected About Menu.");
                    AboutDialog.showAboutDialog(mainFrame);
                }
            });
        }
        return aboutHelpMenuItem;
    }
}
