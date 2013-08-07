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

package edu.asu.laits.gui;

import edu.asu.laits.model.HelpBubble;
import java.awt.Color;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import javax.swing.JComponent;
import javax.swing.JLabel;
import javax.swing.RootPaneContainer;
import net.java.balloontip.BalloonTip;
import net.java.balloontip.styles.RoundedBalloonStyle;

/**
 *
 * @author ramayantiwari
 */
public class BlockingToolTip {

    BalloonTip bTip = null;
    RootPaneContainer parent;

    public BlockingToolTip(RootPaneContainer parent, String text, JComponent c, int x, int y) {
        this.parent = parent;
        initBalloon(text, c, x, y);        
        disableWindow();
    }
    
    public BlockingToolTip(RootPaneContainer parent, HelpBubble bubble, JComponent c){
        if(!bubble.isDisplayed()){
            this.parent = parent;
            bubble.setDisplayed(true);
            initBalloon(bubble, c);        
            disableWindow();
           
        }
    }
  
    /**
     * Initialize BalloonTip with text and the component to attach it
     * Pass Horizontal and Vertical Alignment Parameters to BalloonTip Constructor. 
     * 15,15 are the default values used to position to correct location. Adding 
     * X and Y values will shift the balloon by using x,y as padding. However, array will
     * still be started from the component attached.
     * @param text
     * @param c 
     */
    private void initBalloon(String text, JComponent c, int x, int y) {
        bTip = new BalloonTip(c, new JLabel(text),
                new RoundedBalloonStyle(5,5,Color.WHITE, Color.BLACK),
                BalloonTip.Orientation.LEFT_ABOVE, BalloonTip.AttachLocation.ALIGNED,
                15+x, 15+y, true);
    }
    private void initBalloon(HelpBubble bubble, JComponent c) {
        if(c.isVisible()){
        bTip = new BalloonTip(c, new JLabel(bubble.getMessage()),
                new RoundedBalloonStyle(5,5,Color.WHITE, Color.BLACK),
                bubble.getOrientation(), BalloonTip.AttachLocation.ALIGNED,
                15+bubble.getX(), 15+bubble.getY(), true);
        }
    }
    
    /**
     * Disable window by enabling GlassPane
     * Attaches listeners to all the mouse events, if click event is detected on
     * Close button of balloontip, we close balloon and disable glass pane, so that 
     * window becomes responsive.
     */
    private void disableWindow(){
        parent.getGlassPane().setVisible(true);
        
        parent.getGlassPane().addMouseListener(new MouseListener() {
            @Override
            public void mouseClicked(MouseEvent me) {
                processEvent(me);
            }

            @Override
            public void mousePressed(MouseEvent me) {
            }

            @Override
            public void mouseReleased(MouseEvent me) {
            }

            @Override
            public void mouseEntered(MouseEvent me) {
            }

            @Override
            public void mouseExited(MouseEvent me) {
            }
        });
        
    }
    /**
     * Method to Process Click Event
     * Check if click event was generated from close button of BalloonTip, if so,
     * remove BalloonTip and GlassPane
     */ 
    private void processEvent(MouseEvent e) {
        try{
            int startX = (int) bTip.getCloseButton().getLocationOnScreen().getX();
        int startY = (int) bTip.getCloseButton().getLocationOnScreen().getY();

        int endX = bTip.getCloseButton().getHeight() + startX;
        int endY = bTip.getCloseButton().getWidth() + startY;

        if (e.getXOnScreen() >= startX && e.getXOnScreen() <= endX
                && e.getYOnScreen() >= startY && e.getYOnScreen() <= endY) {
            bTip.setVisible(false);
            bTip.closeBalloon();
            
            for( MouseListener al : parent.getGlassPane().getMouseListeners() ) {
                parent.getGlassPane().removeMouseListener(al);
            }
            
            parent.getGlassPane().setVisible(false);
        }
        
        }catch(Exception ex){
            System.out.println("Error in Handling Balloon Close Button");
            ex.printStackTrace();
            bTip.setVisible(false);
            bTip.closeBalloon();
            
            for( MouseListener al : parent.getGlassPane().getMouseListeners() ) {
                parent.getGlassPane().removeMouseListener(al);
            }
            
            parent.getGlassPane().setVisible(false);
            
        }
        
    }

    
}