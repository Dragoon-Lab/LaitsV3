/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.gui;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.nodeeditor.PlotPanel;
import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.Task;
import edu.asu.laits.model.Vertex;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.TextArea;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSeparator;
import javax.swing.JTextArea;
import javax.swing.SwingConstants;
import org.jdesktop.swingx.JXTaskPane;
import org.jdesktop.swingx.JXTaskPaneContainer;

/**
 *
 * @author ramayantiwari
 */
public class ForumViewPanel {
    JXTaskPaneContainer commentsContainer;
    JDialog parent;
    
    public ForumViewPanel(JDialog parent){
        this.parent = parent;
        initializeComponents();
        addComments();
        addPostCommentPanel();
        
        JScrollPane panelScroll = new JScrollPane(commentsContainer);
        parent.add(panelScroll);
    }
    
    private void initializeComponents(){
        commentsContainer = new JXTaskPaneContainer();        
    }
    
    private void addComments(){
        
            JPanel topPanel = new JPanel(new BorderLayout(0, 0));
            JButton previousCommentButton = new JButton("View Previous Comments");
            topPanel.add(previousCommentButton,BorderLayout.WEST);
            commentsContainer.add(topPanel);
        
        
        for(int i=1; i<4; i++){
            commentsContainer.add(addChart(i));
        }        
    }
    
    
    private void addPostCommentPanel(){
        JXTaskPane postCommentPanel = new JXTaskPane();
        postCommentPanel.setTitle("Your username");
        
        JTextArea commentArea = new JTextArea(5, 100);
        commentArea.setBorder(BorderFactory.createLineBorder(Color.BLACK));
        postCommentPanel.add(commentArea);
        
        JPanel bottom = new JPanel(new BorderLayout(0, 0));
        JButton postCommentButton = new JButton("Post Comment");
       
        bottom.add(postCommentButton,BorderLayout.EAST);
        
        postCommentPanel.add(bottom);
        commentsContainer.add(postCommentPanel);
    }
    
    private JXTaskPane addChart(int num){
        JXTaskPane pane = new JXTaskPane();
        pane.setTitle("Comment Title "+num);
        pane.setSize(575, 40);
        
        JLabel label = new JLabel("Test Comment "+num);
        
        Date dNow = new Date( );
        SimpleDateFormat ft = new SimpleDateFormat ("E yyyy.MM.dd 'at' hh:mm:ss a");
      
        JLabel dateLabel = new JLabel("Posted on : "+ft.format(dNow),SwingConstants.RIGHT);
        dateLabel.setFont(new Font("lucida grande", Font.PLAIN, 12));
        dateLabel.setEnabled(false);
        pane.add(label);
        pane.add(dateLabel);
        
        
        return pane;
    }
}
