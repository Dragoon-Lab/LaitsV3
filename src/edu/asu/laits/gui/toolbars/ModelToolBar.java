package edu.asu.laits.gui.toolbars;

import edu.asu.laits.gui.menus.ModelMenu;
import javax.swing.JToolBar;
import javax.swing.JButton;
import javax.swing.ImageIcon;

import edu.asu.laits.gui.menus.ViewMenu;
import edu.asu.laits.model.Vertex;
import java.awt.Font;
import javax.swing.Box;

/**
 * ToolBar for Model functionalities Provides Add Node and Run Model buttons on
 * the ToolBar
 *
 * @author rptiwari
 *
 */
public class ModelToolBar extends JToolBar {

    private JButton addNodeButton = null;
    private JButton runModelButton = null;
    private JButton spacerButton = null;
    private ModelMenu modelMenu;

    /**
     * This method initializes The ToolBar buttons for Model
     *
     */
    public ModelToolBar(ModelMenu modelMenu) {
        super();
        this.modelMenu = modelMenu;
        initialize();
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.setName("Model quickmenu");
        this.add(getAddNodeButton());
        this.add(Box.createHorizontalStrut(5)); 
        this.add(getRunModelButton());
    }

    /**
     * This method initializes Add Note button on the ToolBar
     */
    private JButton getAddNodeButton() {
        if (addNodeButton == null) {
            addNodeButton = new JButton();
            addNodeButton.setText("Add Node");
            addNodeButton.setToolTipText("Create a New Node");
            addNodeButton.setFont(new Font(addNodeButton.getFont().getName(),
                                           Font.BOLD,
                                           addNodeButton.getFont().getSize() - 1));
            addNodeButton
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    modelMenu.newNodeAction();
                }
            });
        }
        return addNodeButton;
    }

    /**
     * This method initializes Run Model Button on ToolBar
     */
    private JButton getRunModelButton() {
        if (runModelButton == null) {
            runModelButton = new JButton();
            runModelButton.setText("Run Model");  
            runModelButton.setToolTipText("Run Current Model");
            runModelButton.setFont(new Font(runModelButton.getFont().getName(),
                                   Font.BOLD,
                                   runModelButton.getFont().getSize() - 1)
                                  );
            runModelButton
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    modelMenu.runModelAction();
                }
            });
        }
        return runModelButton;
    }
    
}
