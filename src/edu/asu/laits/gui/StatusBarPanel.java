package edu.asu.laits.gui;

import javax.swing.JPanel;
import javax.swing.BoxLayout;
import javax.swing.BorderFactory;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import javax.swing.border.BevelBorder;
import javax.swing.JLabel;

import java.awt.Component;
import java.awt.Dimension;
import javax.swing.Box;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.InformationPane;
import edu.asu.laits.editor.MessageListener;
import edu.asu.laits.editor.MessageProvider;
import edu.asu.laits.editor.listeners.InsertModeChangeListener;

import java.awt.Color;
import java.awt.GridBagLayout;
import java.awt.GridBagConstraints;
import java.awt.BorderLayout;
import java.util.EmptyStackException;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Stack;

/**
 * This panel implements information pane so it can get information from a
 * GraphEditoPane. It has one status field that shows information from the
 * associated GraphEditorPane.
 */
public class StatusBarPanel extends JPanel implements InformationPane {

    private JLabel insertModeStatusLabel = null;
    private Component box = null;
    private JLabel jLabel1 = null;
    private GraphEditorPane graphPane;
    private JPanel jPanel = null;
    private JPanel jPanel1 = null;
    private Stack<MessageProvider> messageQueue = new Stack<MessageProvider>(); 

    public StatusBarPanel() {
        super();
        initialize();
        this.graphPane = null;
    }

    private void initialize() {
        jLabel1 = new JLabel();
        jLabel1.setText("");
        this.setLayout(new BoxLayout(this, BoxLayout.X_AXIS));
        this.setBorder(BorderFactory.createBevelBorder(BevelBorder.LOWERED));
        this.add(getJPanel(), null);
        this.add(getBox(), null);
        this.add(getJPanel1(), null);

    }

    private JLabel getInsertModeStatusLabel() {
        if (insertModeStatusLabel == null) {
            insertModeStatusLabel = new JLabel();
            insertModeStatusLabel.setText("JLabel");
            
        }
        return insertModeStatusLabel;
    }

    private Component getBox() {
        if (box == null) {
            box = Box.createGlue();
        }
        return box;
    }

    private JPanel getJPanel() {
        if (jPanel == null) {
            jPanel = new JPanel();
            jPanel.setLayout(new BorderLayout());
            jPanel.setBorder(BorderFactory
                    .createBevelBorder(BevelBorder.LOWERED));
            jPanel.add(jLabel1, BorderLayout.CENTER);
        }
        return jPanel;
    }

    private JPanel getJPanel1() {
        if (jPanel1 == null) {
            jPanel1 = new JPanel();
            jPanel1.setLayout(new BoxLayout(getJPanel1(), BoxLayout.X_AXIS));
            jPanel1.setBorder(BorderFactory
                    .createBevelBorder(BevelBorder.LOWERED));
            jPanel1.add(getInsertModeStatusLabel(), null);
        }
        return jPanel1;
    }

    public void popMessage() {
        try {
            messageQueue.pop();
        } catch (EmptyStackException e) {
            SwingUtilities.invokeLater(new Runnable() {
                public void run() {
                    jLabel1.setText("");
                    Color color = UIManager.getColor("Panel.background");
                    if (color == null) {
                        color = Color.LIGHT_GRAY;
                    }
                    jPanel.setBackground(color);
                }
            });
            return;
        }
        if (messageQueue.size() == 0) {
            SwingUtilities.invokeLater(new Runnable() {
                public void run() {
                    jLabel1.setText("");
                    Color color = UIManager.getColor("Panel.background");
                    if (color == null) {
                        color = Color.LIGHT_GRAY;
                    }
                    jPanel.setBackground(color);
                }
            });
            return;
        }

        final MessageProvider message = messageQueue.peek();
        message.addMessageListener(messageListener);
        SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                jLabel1.setText(message.getMessage());

                if (!message.isUseSpecialColor()) {
                    Color color = UIManager.getColor("Panel.background");
                    if (color == null) {
                        color = Color.LIGHT_GRAY;
                    }
                    jPanel.setBackground(color);
                } else {

                    jPanel.setBackground(message.getSpecialColor());

                }
            }
        });

    }

    private class StatusBarMessageListener implements MessageListener {

        public void messageChanged(final String message) {
            SwingUtilities.invokeLater(new Runnable() {
                public void run() {
                    jLabel1.setText(message);
                }
            });

        }

        public void colorChanged(Color specialColor) {

            jPanel.setBackground(specialColor);

        }
    }
    StatusBarMessageListener messageListener = new StatusBarMessageListener(); // @jve:decl-index=0:

    public void putMessage(MessageProvider messageProvider) {
        try {
            messageQueue.peek().removeMessageListener(messageListener);
        } catch (EmptyStackException e) {
        }
        messageQueue.push(messageProvider);
        messageProvider.addMessageListener(messageListener);
        if (!messageProvider.isUseSpecialColor()) {
            Color color = UIManager.getColor("Panel.background");
            if (color == null) {
                color = Color.LIGHT_GRAY;
            }
            jPanel.setBackground(color);
        } else {

            jPanel.setBackground(messageProvider.getSpecialColor());

        }
    }

//    public void setGraphPane(GraphEditorPane graphPane) {
//        this.graphPane = graphPane;
//        InsertModeChangeListener l = new InsertModeChangeListener() {
//            public void newInsertModeEvent(boolean insertMode) {
//                if (insertMode) {
//                    insertModeStatusLabel.setText("Insert mode: ON ");
//                } else {
//                    insertModeStatusLabel.setText("Insert mode: OFF");
//                }
//
//            }
//        };
//        graphPane.addInsertModeChangeListener(l);
//        l.newInsertModeEvent(graphPane.isInsertMode());
//    }
    
    public void setStatusMessage(String message, boolean errType){
        if(errType){
            insertModeStatusLabel.setForeground(Color.BLUE);
        }else{
            insertModeStatusLabel.setForeground(Color.RED);
        }
        insertModeStatusLabel.setText(message+"                   ");
    }
}
