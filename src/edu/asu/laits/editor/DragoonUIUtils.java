/**
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State
 * University. This file is part of LAITS.
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

package edu.asu.laits.editor;

import java.awt.Color;
import javax.swing.ButtonGroup;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JSeparator;
import javax.swing.JTextField;
import javax.swing.SwingConstants;

/**
 *
 * @author ramayantiwari
 */
public class DragoonUIUtils {
    public static void addSeparator(JPanel panel, String text) {
        JLabel l = createLabel(text);
        l.setForeground(LABEL_COLOR);

        panel.add(l, "gapbottom 1, span, split 2, aligny center");
        panel.add(new JSeparator(), "gapleft rel, growx");
    }
    
    public static JLabel createLabel(String text) {
        return createLabel(text, SwingConstants.LEADING);
    }

    public static JLabel createLabel(String text, int align) {
        final JLabel b = new JLabel(text, align);
        return b;
    }
    
    public static JTextField createTextField(int cols) {
        return createTextField("", cols);
    }

    public static JTextField createTextField(String text) {
        return createTextField(text, 0);
    }

    public static JTextField createTextField(String text, int cols) {
        final JTextField b = new JTextField(text, cols);
        return b;
    }
    
    public static JRadioButton createRadioButton(String text){
        final JRadioButton radioButton = new JRadioButton(text);
        return radioButton;
    }
    
    public static JRadioButton createRadioButton(String text, ButtonGroup group){
        final JRadioButton radioButton = new JRadioButton(text);
        group.add(radioButton);
        return radioButton;
    }
    
    public static final Color LABEL_COLOR = new Color(0, 70, 213);
}
