package edu.asu.laits.gui.menus;

import java.awt.Frame;

import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuItem;

import edu.asu.laits.gui.AboutDialog;
import edu.asu.laits.properties.GlobalProperties;

/**
 * A menu where you can choose to open the about menu and the help menu.
 */
public class HelpAboutMenu extends JMenu {

    private JMenuItem helpHelpMenuItem = null;
    private JMenuItem aboutHelpMenuItem = null;
    private Frame mainFrame;

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
                    AboutDialog.showAboutDialog(mainFrame);
                }
            });
        }
        return aboutHelpMenuItem;
    }
}
