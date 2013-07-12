/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.gui;

import java.awt.Color;
import java.awt.Component;
import java.awt.event.ActionEvent;
import javax.swing.AbstractAction;
import javax.swing.Icon;
import javax.swing.JButton;
import javax.swing.JComponent;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JPanel;
import net.java.balloontip.BalloonTip;


/**
 *
 * @author ramayantiwari
 */
public class BlockingToolTip extends JDialog{
    int paddingX, paddingY;
    
    public BlockingToolTip(java.awt.Frame parent, String text, JComponent c, int x, int y){
        
        super(parent,true);
        paddingX = x;
        paddingY = y;
        initBalloon(text, c);
    }
    
    public BlockingToolTip(javax.swing.JDialog parent, String text, JComponent c, int x, int y){
        
        super(parent,true);
        paddingX = x;
        paddingY = y;
        initBalloon(text, c);
    }
    
    private void init(String text, JComponent c){
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
        setBounds(c.getLocationOnScreen().x + 30 + paddingX, c.getLocationOnScreen().y + 30 + paddingY, message.getSize().width+140, message.getSize().height+30);
        pack();
        
        setVisible(true);    
    }
    
    private void initBalloon(String text, JComponent c){
        setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
//        setUndecorated(true);
//        getRootPane().setOpaque(true);
//        getContentPane ().setBackground (new Color (0, 0, 0, 0));
//        setBackground (new Color(0, 0, 0, 0));
        
        BalloonTip bTip = createBalloonTip(c, text);
        
        JPanel panel = new JPanel();
        panel.add(bTip);
        add(panel);
        
        setBounds(c.getLocationOnScreen().x + paddingX, c.getLocationOnScreen().y + paddingY, bTip.getSize().width, bTip.getSize().height);
        pack();
        
        setVisible(true);    
    }
    
    private BalloonTip createBalloonTip(JComponent compToAttach, String message){
        BalloonTip bTip = new BalloonTip(compToAttach, message);
        compToAttach.remove(bTip);
        
        JButton closeButton = BalloonTip.getDefaultCloseButton();
        final Icon buttonIcon = closeButton.getIcon();
        
        closeButton.setAction(new AbstractAction("", buttonIcon) {
            @Override
            public void actionPerformed(ActionEvent ae) {
                dispose();
            }
        });
        
        bTip.setCloseButton(closeButton);
        
        
        return bTip;
    }
}
