/**
 * LAITS Project
 * Arizona State University
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State University.
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
        this.setName("Tutor Menu");
//        this.add(getIntroductionButton());
//        this.add(Box.createHorizontalStrut(5));
        if (!ApplicationContext.getSituationMerge()) {
            this.add(getSituationButton());
        }
//        this.add(Box.createHorizontalStrut(5)); 
 //       this.add(getModelButton());
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
