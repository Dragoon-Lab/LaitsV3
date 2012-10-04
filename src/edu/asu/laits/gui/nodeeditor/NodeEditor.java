/*
 * LAITS Project
 * Arizona State University
 *
 * @author rptiwari
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.awt.Component;
import java.awt.Insets;
import java.awt.Point;
import java.awt.event.WindowEvent;
import java.awt.event.WindowListener;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.UIManager;
import javax.swing.WindowConstants;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultEdge;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.GraphConstants;
import org.jgraph.graph.Port;
import org.jgraph.graph.PortView;

public class NodeEditor extends JFrame implements WindowListener {

    private static NodeEditor nodeEditor;
    private DescriptionPanelView dPanel;
    private PlanPanelView pPanel;
    private InputsPanelView iPanel;
    private CalculationsPanelView cPanel;
    private GraphsPanelView gPanel;
    public boolean graphCanBeDisplayed = false;
   
    //Tab Pane Indexes
    public static final int DESCRIPTION = 0;
    public static final int PLAN = 1;
    public static final int INPUTS = 2;
    public static final int CALCULATIONS = 3;
    public static final int GRAPH = 4;
    private boolean extraTabEvent;
    private int selectedTab;
    
    private GraphEditorPane graphPane;
    private Vertex currentVertex;
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger(NodeEditor.class);

    public NodeEditor(GraphEditorPane editorPane) {
        graphPane = editorPane;
        DefaultGraphCell gc = (DefaultGraphCell)graphPane.getSelectionCell();
        currentVertex = (Vertex)gc.getUserObject();
        UIManager.getDefaults().put("TabbedPane.contentBorderInsets", new Insets(2, 0, -1, 0));
        initComponents();
        setTabListener();
        initNodeEditor();
    }

    /**
     * Initialize NodeEditor for a new Node
     */
    public void initNodeEditor() {
        logs.trace("Initializing NodeEditor");

        resetNodeEditor();
        initTabs(true);
        addWindowListener(this);
        setTitle(currentVertex.getName());
        prepareNodeEditorDisplay();
      
    }

    
    private void prepareNodeEditorDisplay() {
        pack();

        setVisible(true);
        setAlwaysOnTop(true);

        setResizable(false);
        setDefaultCloseOperation(WindowConstants.DO_NOTHING_ON_CLOSE);
        requestFocus(true);
        setFocusable(true);

        setBounds(getToolkit().getScreenSize().width - 662,
                100,
                getPreferredSize().width, getPreferredSize().height);
    }

    /**
     * Method to reset NodeEditor to its default state
     */
    private void resetNodeEditor() {
        logs.trace("Resetting Node Editor - Starts");

        editorMsgLabel.setText("");
        selectedTab = DESCRIPTION;
        extraTabEvent = true;
        tabPane.setSelectedIndex(DESCRIPTION);

        logs.trace("Resetting Node Editor - Ends");
    }

    /**
     * Method to Initialize all the Tabs of NodeEditor for this vertex
     *
     * @param newNode : if the tabs are for new node or for an existing node
     */
    public void initTabs(boolean newNode) {
        logs.trace("Initializing NodeEditor Tabs - Start");

        dPanel = new DescriptionPanelView(this);
        pPanel = new PlanPanelView(this);
        iPanel = new InputsPanelView(this);
        cPanel = new CalculationsPanelView(this);
        gPanel = new GraphsPanelView(this);

        descriptionPanel.setLayout(new java.awt.GridLayout(1, 1));
        descriptionPanel.add(dPanel);

        planPanel.setLayout(new java.awt.GridLayout(1, 1));
        planPanel.add(pPanel);

        inputsPanel.setLayout(new java.awt.GridLayout(1, 1));
        inputsPanel.add(iPanel);

        calculationPanel.setLayout(new java.awt.GridLayout(1, 1));
        calculationPanel.add(cPanel);

        graphsPanel.setLayout(new java.awt.GridLayout(1, 1));
        graphsPanel.add(gPanel);

        logs.trace("Initializing NodeEditor Tabs - End");
    }

    private void setSelectedPanel() {
        extraTabEvent = false;
        tabPane.setEnabledAt(GRAPH, false);
        tabPane.setForegroundAt(GRAPH, Color.GRAY);
    }

    private void setTabListener() {
        logs.trace("Setting Tab Listener");
        final JFrame f = this;

        tabPane.addChangeListener(new ChangeListener() {
            // Set the Tab of Node Editor according to the finished Tabs
            public void stateChanged(ChangeEvent e) {

                logs.error("Current Tab " + tabPane.getSelectedIndex() + "  " + selectedTab);

            }
        });
    }

    public Vertex getCurrentVertex(){
        return currentVertex;
    }
    
    public GraphEditorPane getGraphPane(){
        return graphPane;
    }
    
    public CalculationsPanelView getCalculationsPanel() {
        return cPanel;
    }

    public DescriptionPanelView getDescriptionPanel() {
        return dPanel;
    }

    public InputsPanelView getInputsPanel() {
        return iPanel;
    }

    public GraphsPanelView getGraphsPanel() {
        return gPanel;
    }

    /**
     * Set Editor Error/Warning Messages
     *
     * @param msg : message to be displayed
     */
    public void setEditorMessage(String msg) {
        editorMsgLabel.setText(msg);
        editorMsgLabel.setVisible(true);
    }

    
    /**
     * Method to handle closing of Editor
     *
     * @param e
     */
    public void windowClosing(WindowEvent e) {
        logs.trace("Closing Node Editor");
    }

    public void windowOpened(WindowEvent e) {
    }

    public void windowClosed(WindowEvent e) {
        this.dispose();
    }

    public void windowIconified(WindowEvent e) {
    }

    public void windowDeiconified(WindowEvent e) {
    }

    public void windowActivated(WindowEvent e) {
    }

    public void windowDeactivated(WindowEvent e) {
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        tabPane = new javax.swing.JTabbedPane();
        descriptionPanel = new javax.swing.JPanel();
        planPanel = new javax.swing.JPanel();
        inputsPanel = new javax.swing.JPanel();
        calculationPanel = new javax.swing.JPanel();
        graphsPanel = new javax.swing.JPanel();
        checkButton = new javax.swing.JButton();
        giveUpButton = new javax.swing.JButton();
        buttonCancel = new javax.swing.JButton();
        buttonOK = new javax.swing.JButton();
        editorMsgLabel = new javax.swing.JLabel();
        bottomSpacer = new javax.swing.JLabel();

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);
        setTitle("Node Editor");
        setAlwaysOnTop(true);
        setResizable(false);
        addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                formMouseClicked(evt);
            }
        });
        addWindowFocusListener(new java.awt.event.WindowFocusListener() {
            public void windowGainedFocus(java.awt.event.WindowEvent evt) {
                formWindowGainedFocus(evt);
            }
            public void windowLostFocus(java.awt.event.WindowEvent evt) {
            }
        });
        addMouseMotionListener(new java.awt.event.MouseMotionAdapter() {
            public void mouseDragged(java.awt.event.MouseEvent evt) {
                formMouseDragged(evt);
            }
        });
        getContentPane().setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        tabPane.setCursor(new java.awt.Cursor(java.awt.Cursor.DEFAULT_CURSOR));
        tabPane.setMinimumSize(new java.awt.Dimension(500, 500));
        tabPane.setOpaque(true);
        tabPane.setPreferredSize(new java.awt.Dimension(500, 400));
        tabPane.setRequestFocusEnabled(false);
        tabPane.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                tabPaneMouseClicked(evt);
            }
        });
        tabPane.addMouseMotionListener(new java.awt.event.MouseMotionAdapter() {
            public void mouseDragged(java.awt.event.MouseEvent evt) {
                tabPaneMouseDragged(evt);
            }
        });

        descriptionPanel.setCursor(new java.awt.Cursor(java.awt.Cursor.DEFAULT_CURSOR));
        descriptionPanel.setFocusable(false);

        javax.swing.GroupLayout descriptionPanelLayout = new javax.swing.GroupLayout(descriptionPanel);
        descriptionPanel.setLayout(descriptionPanelLayout);
        descriptionPanelLayout.setHorizontalGroup(
            descriptionPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 601, Short.MAX_VALUE)
        );
        descriptionPanelLayout.setVerticalGroup(
            descriptionPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Description", descriptionPanel);

        javax.swing.GroupLayout planPanelLayout = new javax.swing.GroupLayout(planPanel);
        planPanel.setLayout(planPanelLayout);
        planPanelLayout.setHorizontalGroup(
            planPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 601, Short.MAX_VALUE)
        );
        planPanelLayout.setVerticalGroup(
            planPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Plan", planPanel);

        javax.swing.GroupLayout inputsPanelLayout = new javax.swing.GroupLayout(inputsPanel);
        inputsPanel.setLayout(inputsPanelLayout);
        inputsPanelLayout.setHorizontalGroup(
            inputsPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 601, Short.MAX_VALUE)
        );
        inputsPanelLayout.setVerticalGroup(
            inputsPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Inputs", inputsPanel);

        javax.swing.GroupLayout calculationPanelLayout = new javax.swing.GroupLayout(calculationPanel);
        calculationPanel.setLayout(calculationPanelLayout);
        calculationPanelLayout.setHorizontalGroup(
            calculationPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 601, Short.MAX_VALUE)
        );
        calculationPanelLayout.setVerticalGroup(
            calculationPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Calculations", calculationPanel);

        javax.swing.GroupLayout graphsPanelLayout = new javax.swing.GroupLayout(graphsPanel);
        graphsPanel.setLayout(graphsPanelLayout);
        graphsPanelLayout.setHorizontalGroup(
            graphsPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 601, Short.MAX_VALUE)
        );
        graphsPanelLayout.setVerticalGroup(
            graphsPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Graphs", graphsPanel);

        getContentPane().add(tabPane, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 0, 622, 552));

        checkButton.setText("Check");
        checkButton.setEnabled(false);
        checkButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                checkButtonActionPerformed(evt);
            }
        });
        getContentPane().add(checkButton, new org.netbeans.lib.awtextra.AbsoluteConstraints(20, 570, 82, 41));

        giveUpButton.setText("Give Up");
        giveUpButton.setEnabled(false);
        giveUpButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                giveUpButtonActionPerformed(evt);
            }
        });
        getContentPane().add(giveUpButton, new org.netbeans.lib.awtextra.AbsoluteConstraints(120, 570, 78, 41));

        buttonCancel.setText("Cancel");
        buttonCancel.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonCancelActionPerformed(evt);
            }
        });
        getContentPane().add(buttonCancel, new org.netbeans.lib.awtextra.AbsoluteConstraints(420, 570, -1, 41));

        buttonOK.setText("Ok");
        buttonOK.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonOKActionPerformed(evt);
            }
        });
        getContentPane().add(buttonOK, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 570, 91, 41));

        editorMsgLabel.setFont(new java.awt.Font("Lucida Grande", 0, 12)); // NOI18N
        editorMsgLabel.setForeground(new java.awt.Color(255, 0, 0));
        editorMsgLabel.setText("jLabel1");
        getContentPane().add(editorMsgLabel, new org.netbeans.lib.awtextra.AbsoluteConstraints(10, 550, 601, -1));
        getContentPane().add(bottomSpacer, new org.netbeans.lib.awtextra.AbsoluteConstraints(10, 616, 30, 10));

        pack();
    }// </editor-fold>//GEN-END:initComponents

  private void formWindowGainedFocus(java.awt.event.WindowEvent evt) {//GEN-FIRST:event_formWindowGainedFocus
  }//GEN-LAST:event_formWindowGainedFocus

  private void tabPaneMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_tabPaneMouseClicked
      
  }//GEN-LAST:event_tabPaneMouseClicked

  private void formMouseDragged(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_formMouseDragged
  }//GEN-LAST:event_formMouseDragged

  private void formMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_formMouseClicked
  }//GEN-LAST:event_formMouseClicked

  private void tabPaneMouseDragged(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_tabPaneMouseDragged
  }//GEN-LAST:event_tabPaneMouseDragged

  private void checkButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_checkButtonActionPerformed
 }//GEN-LAST:event_checkButtonActionPerformed

  private void giveUpButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_giveUpButtonActionPerformed
 }//GEN-LAST:event_giveUpButtonActionPerformed

  private void buttonCancelActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCancelActionPerformed
      // Process Cancel Action for all the Tabs
      this.dispose();
  }//GEN-LAST:event_buttonCancelActionPerformed

   private boolean duplicatedNode(String nodeName) {
      Iterator<Vertex> it = graphPane.getModelGraph().vertexSet().iterator();
      
      while(it.hasNext()){
          if(it.next().getName().equals(nodeName))
              return true;
      }
        return false;
  }
    /**
     * Method to process the Node after filling all the details in NodeEditor
     *
     * @param evt
     */
  private void buttonOKActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonOKActionPerformed
      //set up based on the description tab
      if(!duplicatedNode(dPanel.getNodeName()) || currentVertex.getName().equals(dPanel.getNodeName()))  //this node name is not duplicated or this is the node that has the name before
        currentVertex.setName(dPanel.getNodeName());
      else{
          JOptionPane.showMessageDialog(this, "The node name is already used by another node. Please have a new name for this node.");
          return;
      }
      currentVertex.setCorrectDescription(dPanel.getNodeDesc());
      graphPane.repaint();
      
      
      
      /*
      List<Vertex> v  = new ArrayList<Vertex> ();
      Iterator<Vertex> it = graphPane.getModelGraph().vertexSet().iterator();
      
      while(it.hasNext()){
          v.add(it.next());
      }
      
      
      PortView  p = graphPane.getPortViewAt(v.get(0).getXPosition(), v.get(0).getYPosition());
      PortView p2 = graphPane.getPortViewAt(v.get(1).getXPosition(), v.get(1).getYPosition());
      
      
      graphPane.insertEdge((Port)p.getCell(), (Port)p2.getCell());
      graphPane.insertEdge((Port)p2.getCell(), (Port)p.getCell());
      */
      
      this.dispose();      
  }//GEN-LAST:event_buttonOKActionPerformed
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JLabel bottomSpacer;
    private javax.swing.JButton buttonCancel;
    private javax.swing.JButton buttonOK;
    private javax.swing.JPanel calculationPanel;
    private javax.swing.JButton checkButton;
    private javax.swing.JPanel descriptionPanel;
    private javax.swing.JLabel editorMsgLabel;
    private javax.swing.JButton giveUpButton;
    private javax.swing.JPanel graphsPanel;
    private javax.swing.JPanel inputsPanel;
    private javax.swing.JPanel planPanel;
    private javax.swing.JTabbedPane tabPane;
    // End of variables declaration//GEN-END:variables
}
