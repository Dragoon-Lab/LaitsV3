/** (c) 2013, Arizona Board of Regents for and on behalf of Arizona State University.
 * This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * LAITS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS.  If not, see <http://www.gnu.org/licenses/>.
 */

package edu.asu.laits.gui.toolbars;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.menus.ModelMenu;
import javax.swing.JToolBar;
import javax.swing.JButton;
import java.awt.Font;
import javax.swing.Box;
import net.java.balloontip.BalloonTip;
 

/**
 * ToolBar for Model functionalities Provides Add Node and Run Model buttons on
 * the ToolBar
 *
 * @author rptiwari
 *
 */
public class ModelToolBar extends JToolBar {

    private JButton addNodeButton = null;
    private JButton deleteNodeButton = null;
    private JButton runModelButton = null;
    private JButton doneButton = null;
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
        this.add(getDeleteNodeButton());
        this.add(Box.createHorizontalStrut(5));  
        if(ApplicationContext.getAppMode().equalsIgnoreCase("COACHED")){
            this.disableDeleteNodeButton();
        }
        this.add(getRunModelButton());
        if(ApplicationContext.getAppMode().equals("STUDENT") || ApplicationContext.getAppMode().equals("COACHED")){
            this.add(Box.createHorizontalStrut(5));
            this.add(getDoneButton());
        }
        
    }

    /**
     * This method initializes Add Note button on the ToolBar
     */
    private JButton getAddNodeButton() {
        if (addNodeButton == null) {
            addNodeButton = new JButton();
            addNodeButton.setText("Create Node");
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
        
        BalloonTip myBalloonTip = new BalloonTip(addNodeButton, "Click the Create Node button to begin");
        return addNodeButton;
    }
    
    private JButton getDeleteNodeButton() {
        if (deleteNodeButton == null) {
            deleteNodeButton = new JButton();
            deleteNodeButton.setText("Delete Node");
            deleteNodeButton.setToolTipText("Delete selected Node");
            deleteNodeButton.setFont(new Font(deleteNodeButton.getFont().getName(),
                                           Font.BOLD,
                                           deleteNodeButton.getFont().getSize() - 1));
            deleteNodeButton
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    modelMenu.deleteNodeAction();
                }
            });
        }
        return deleteNodeButton;
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
    
    /**
     * This method initializes Done Button on ToolBar
     */
    private JButton getDoneButton() {
        if (doneButton == null) {
            doneButton = new JButton();
            doneButton.setText("Done");  
            doneButton.setToolTipText("Done with the Task");
            doneButton.setFont(new Font(doneButton.getFont().getName(),
                                   Font.BOLD,
                                   doneButton.getFont().getSize() - 1)
                                  );
            doneButton
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    if (ApplicationContext.getAppMode().equals("AUTHOR")) {
                        return;
                    }
                    modelMenu.doneButtonAction();
                }
            });
            disableDoneButton();
        }
        return doneButton;
    }
    
    
    public void enableDoneButton(){
        doneButton.setEnabled(true);
    }
    
    public void disableDoneButton(){    
        doneButton.setEnabled(false);
    }
    
    public void enableDeleteNodeButton()
    {
        deleteNodeButton.setEnabled(true);
    }
    
    public void disableDeleteNodeButton()
    {
        deleteNodeButton.setEnabled(false);
    }
}
