/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.gui;

import java.awt.event.ActionEvent;
import javax.swing.AbstractAction;
import javax.swing.JButton;
import javax.swing.JComponent;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JPanel;

/**
 *
 * @author ramayantiwari
 */
public class BalloonTip extends JDialog{
    public BalloonTip(java.awt.Frame parent, String text, JComponent c){
        
        super(parent,true);
        setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
        setUndecorated(true);
        
        JPanel panel = new JPanel();
        JLabel message = new JLabel(text);
        
        panel.add(message);
        panel.add(new JButton(new AbstractAction("Close"){
            @Override
            public void actionPerformed(ActionEvent e){
                dispose();
            }
        }));
        
        add(panel);
        setBounds(c.getLocationOnScreen().x + 30, c.getLocationOnScreen().y + 30, message.getSize().width+140, message.getSize().height+30);
        pack();
        
        setVisible(true);
    }
    
    public BalloonTip(javax.swing.JDialog parent, String text, JComponent c){
        
        super(parent,true);
        setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
        setUndecorated(true);
        
        JPanel panel = new JPanel();
        JLabel message = new JLabel(text);
        
        panel.add(message);
        panel.add(new JButton(new AbstractAction("Close"){
            @Override
            public void actionPerformed(ActionEvent e){
                dispose();
            }
        }));
        
        add(panel);
        setBounds(c.getLocationOnScreen().x + 30, c.getLocationOnScreen().y + 30, message.getSize().width+140, message.getSize().height+30);
        pack();
        
        setVisible(true);
    }
}
