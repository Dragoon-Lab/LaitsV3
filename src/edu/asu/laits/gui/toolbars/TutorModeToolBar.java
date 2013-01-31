/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.gui.toolbars;

import edu.asu.laits.gui.MainWindow;
import java.awt.Font;
import javax.swing.Box;
import javax.swing.JButton;
import javax.swing.JToolBar;

/**
 *
 * @author ramayantiwari
 */
public class TutorModeToolBar extends JToolBar{
    private JButton situationButton = null;
    private JButton modelButton = null;
    private JButton spacerButton = null;
    private MainWindow mainWindow;
    

    /**
     * This method initializes The ToolBar buttons for Model
     *
     */
    public TutorModeToolBar(MainWindow mw) {
        super();
        mainWindow = mw;
        initialize();
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.setName("Model quickmenu");
        this.add(getSituationButton());
        this.add(Box.createHorizontalStrut(5)); 
        this.add(getModelButton());
    }

    /**
     * This method initializes Add Note button on the ToolBar
     */
    private JButton getSituationButton() {
        if (situationButton == null) {
            situationButton = new JButton();
            situationButton.setText("Situation");
            situationButton.setToolTipText("View Task Situation");
            situationButton.setFont(new Font(situationButton.getFont().getName(),
                                           Font.BOLD,
                                           situationButton.getFont().getSize() - 1));
            situationButton
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    //Implement Action here
                    mainWindow.switchTutorModelPanels(true);
                }
            });
        }
        return situationButton;
    }

    /**
     * This method initializes Run Model Button on ToolBar
     */
    private JButton getModelButton() {
        if (modelButton == null) {
            modelButton = new JButton();
            modelButton.setText("Model Design");  
            modelButton.setToolTipText("Model for the Task");
            modelButton.setFont(new Font(modelButton.getFont().getName(),
                                   Font.BOLD,
                                   modelButton.getFont().getSize() - 1)
                                  );
            modelButton
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    // Implement Action here
                    mainWindow.switchTutorModelPanels(false);
                }
            });
        }
        return modelButton;
    }
}
