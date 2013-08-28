/*
 * LAITS Project
 * Arizona State University
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.BlockingToolTip;
import edu.asu.laits.model.HelpBubble;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;
import javax.swing.AbstractCellEditor;
import javax.swing.BorderFactory;

import javax.swing.ButtonGroup;
import javax.swing.CellRendererPane;
import javax.swing.JComponent;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.AbstractTableModel;
import javax.swing.table.TableCellEditor;
import javax.swing.table.TableCellRenderer;
import javax.swing.table.TableModel;
import org.apache.log4j.Logger;
import edu.asu.laits.model.Vertex.VertexType;

public class PlanPanelViewOld extends JPanel {

    private static final String[] COLUMN_NAMES = {
        "<html><h3>The Node's value is...", "<html><h3>Node Type"};
    private MyTableModel tableModel;
    private JTable table;
    private String selectedPlan;
    private boolean isViewEnabled = false;
    private NodeEditor nodeEditor;
    private static String[] firstOption = {"<html>a constant whose value is <br />defined in the problem</html>", "parameter"};
    private static String[] secondOption = {"<html>a quantity whose new value depends <br />on its old value and its inputs</html>", "accumulator"};
    private static String[] thirdOption = {"a quantity that depends on its inputs alone", "function"};

    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    private JScrollPane scroll;
    
    public PlanPanelViewOld(NodeEditor ne) {
        super(new BorderLayout(0, 5));

        nodeEditor = ne;
        initPanel();
    }

    public void initPanel() {
        logs.debug("Initializing Plan Panel");
        setBorder(BorderFactory.createEmptyBorder(5, 5, 5, 5));
        tableModel = new MyTableModel();
        table = new JTable(tableModel);

        table.setDefaultEditor(String.class, new StatusEditor());
        table.setDefaultRenderer(String.class, new StatusRenderer());

        table.setRowHeight(36);
        table.getColumnModel().getColumn(0).setPreferredWidth(360);
        table.getColumnModel().getColumn(1).setPreferredWidth(220);

        table.getColumnModel().getColumn(0).setResizable(false);
        table.getColumnModel().getColumn(1).setResizable(false);
        table.addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                table.setSelectionBackground(new Color(201, 197, 199));
                if(!nodeEditor.getCurrentVertex().getPlanStatus().equals(Vertex.PlanStatus.CORRECT) && !nodeEditor.getCurrentVertex().getPlanStatus().equals(Vertex.PlanStatus.GAVEUP)) {
                    nodeEditor.checkPlanPanel(ApplicationContext.getCorrectSolution());
                }
                
            }
        });

        scroll = new JScrollPane(table);
        scroll.setPreferredSize(new Dimension(577, 335));
        scroll.setMinimumSize(new Dimension(577, 335));

        add(scroll, BorderLayout.CENTER);
        tableModel.add(new TableEntry(firstOption[0], firstOption[1]));
        tableModel.add(new TableEntry(secondOption[0], secondOption[1]));
        tableModel.add(new TableEntry(thirdOption[0], thirdOption[1]));

        //(nodeEditor.getCurrentVertex().getPlan());
        if((nodeEditor.getCurrentVertex().getPlanStatus().equals(Vertex.PlanStatus.CORRECT) || nodeEditor.getCurrentVertex().getPlanStatus().equals(Vertex.PlanStatus.GAVEUP)) && !ApplicationContext.getAppMode().equalsIgnoreCase("AUTHOR")){
            setEditableRadio(false);
        }
    }

    public void initPanelForNewNode() {

        resetPlanPanel();
    }

    private void resetPlanPanel() {
        isViewEnabled = false;
    }

    public boolean processPlanPanel() {
        int rowIndex = table.getSelectedRow();

        if (rowIndex >= 0) {
            nodeEditor.getCurrentVertex().setVertexType(getSelectedPlan());
            //setPlanType(getSelectedPlan());
        } else {
            nodeEditor.setEditorMessage("Please select a plan for this node.", true);
            return false;
        }
        return true;
    }

    /**
     * Method to set the initialize the selected plan radio button
     */
    private void setSelectedPlan(Vertex.Plan plan) {
        logs.debug("Setting Selected plan to : " + plan);

        if (plan.equals(Vertex.Plan.FIXED)) {
            table.getSelectionModel().setSelectionInterval(0, 0);
        } else if (plan.equals(Vertex.Plan.DECREASE) || plan.equals(Vertex.Plan.INCREASE) || plan.equals(Vertex.Plan.INCREASE_AND_DECREASE)) {
            table.getSelectionModel().setSelectionInterval(1, 1);
        } else if (plan.equals(Vertex.Plan.PROPORTIONAL) || plan.equals(Vertex.Plan.RATIO) || plan.equals(Vertex.Plan.DIFFERENCE)) {
            table.getSelectionModel().setSelectionInterval(2, 2);
        } else {
            table.getSelectionModel().clearSelection();
        }
    }

    public Vertex.VertexType getSelectedPlan() {
        if (table.getSelectedRow() == 0) {
            return Vertex.VertexType.CONSTANT;
        } else if (table.getSelectedRow() == 1) {
            return Vertex.VertexType.STOCK;
        } else if (table.getSelectedRow() == 2) {
            return Vertex.VertexType.FLOW;
        } else {
            return VertexType.DEFAULT;
        }
    }

    public void setPlanType(Vertex.Plan plan){
        System.out.println("setting plan type");
        if(plan.compareTo(Vertex.Plan.FIXED) == 0){
            nodeEditor.getCurrentVertex().setVertexType(VertexType.CONSTANT);
        System.out.println("setting plan type constant");
        } else if(plan.compareTo(Vertex.Plan.DECREASE) == 0 || plan.compareTo(Vertex.Plan.INCREASE) == 0 || plan.compareTo(Vertex.Plan.INCREASE_AND_DECREASE) == 0){
            nodeEditor.getCurrentVertex().setVertexType(VertexType.STOCK);
        System.out.println("setting plan type stock");  
        } else if(plan.compareTo(Vertex.Plan.DIFFERENCE) == 0 || plan.compareTo(Vertex.Plan.RATIO) == 0 || plan.compareTo(Vertex.Plan.PROPORTIONAL) == 0) {
             nodeEditor.getCurrentVertex().setVertexType(VertexType.FLOW);
        System.out.println("setting plan type flow"); 
        }
    }
    
    public boolean isViewEnabled() {
        if (nodeEditor.getCurrentVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.CORRECT)
                || nodeEditor.getCurrentVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.GAVEUP)) {
            return true;
        } else {
            return false;
        }
    }

    public void setSelectedPlanBackground(Color c) {
        table.setSelectionBackground(c);
        StatusEditor s = (StatusEditor) table.getCellEditor(table.getSelectedRow(), 0);

        s.setStatusPanelBackgound(c);
    }

    public void resetBackGroundColor() {
        table.setSelectionBackground(Color.WHITE);
    }

    public void giveUpPlanPanel() {
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        String correctPlan = solution.getNodeByName(
                nodeEditor.getCurrentVertex().getName()).getNodePlan();
        System.out.println("Found Correct Plan as : " + correctPlan);
  //      setSelectedPlan(correctPlan);
        if(nodeEditor.getCurrentVertex().getPlanStatus().equals(Vertex.PlanStatus.MISSEDFIRST)){
//            setSelectedPlanBackground(Color.RED);
        }
        else {
            setSelectedPlanBackground(Color.YELLOW);
        }
    }

    public String printPlanPanel() {
        StringBuilder sb = new StringBuilder();
        sb.append("Selected Plan : '");
        sb.append(planToString(getSelectedPlan()) + "'");
        return sb.toString();
    }
    
    private String planToString(Vertex.VertexType p) {
        if (p.equals(Vertex.VertexType.CONSTANT)) {
            return "Parameter";
        } else if (p.equals(Vertex.VertexType.STOCK)) {
            return "Accumulator";
        } else if (p.equals(Vertex.VertexType.FLOW)) {
            return "Function";
        } else {
            return "Undefined";
        }
    }

    public void setEditableRadio(Boolean b) {
        table.setEnabled(b);
    }

    public JComponent getLabel(String label) {
          Map<String, JComponent> map = new HashMap<String, JComponent>();
        map.put("table", table.getTableHeader());
        if (map.containsKey(label)) {
            return map.get(label);
        } else {
            return null;
        }
        
    }

    private class TableEntry {

        private String valueType;
        private String nodeType;

        TableEntry(String vt, String nt) {
            valueType = vt;
            nodeType = nt;
        }

        public String getNodeType() {
            return nodeType;
        }

        public void setNodeType(String s) {
            nodeType = s;
        }

        public String getValueType() {
            return valueType;
        }

        public void setValueType(String s) {
            valueType = s;
        }

    }

    private class MyTableModel extends AbstractTableModel {

        private Vector<Object> theEntries;

        MyTableModel() {
            theEntries = new Vector<Object>();
        }

        @SuppressWarnings("unchecked")
        public void add(TableEntry anEntry) {
            int index = theEntries.size();
            theEntries.add(anEntry);
            fireTableRowsInserted(index, index);
        }

        public int getRowCount() {
            return theEntries.size();
        }

        @Override
        public String getColumnName(int column) {
            return COLUMN_NAMES[column];
        }

        @Override
        public Class<?> getColumnClass(int columnIndex) {
            if (columnIndex == 0) {
                return String.class;
            }

            return Object.class;
        }

        @Override
        public boolean isCellEditable(int rowIndex, int columnIndex) {
            if (columnIndex == 0) {
                return true;
            }
            return false;
        }

        @Override
        public int getColumnCount() {
            return 2;
        }

        @Override
        public Object getValueAt(int rowIndex, int columnIndex) {
            TableEntry entry = (TableEntry) theEntries.elementAt(rowIndex);
            switch (columnIndex) {
                case 0:
                    return entry.getValueType();
                case 1:
                    return entry.getNodeType();
            }
            return null;
        }
    }

    private class StatusPanel extends JPanel {

        private JRadioButton theSingleOption;
        private ButtonGroup buttonGroup = new ButtonGroup();

        StatusPanel() {
            super(new GridLayout(0, 1));
            setOpaque(true);
            theSingleOption = createRadio("");            
        }

        private JRadioButton createRadio(String status) {
            JRadioButton jrb = new JRadioButton(status);
            jrb.setOpaque(false);
            add(jrb);
            buttonGroup.add(jrb);
            return jrb;
        }

        public void setLabel(String s) {
            theSingleOption.setText(s);
        }

        public String getLabel() {
            return theSingleOption.getText();
        }
    }

    private class StatusEditor extends AbstractCellEditor implements TableCellEditor {

        private StatusPanel theStatusPanel;

        StatusEditor() {
            theStatusPanel = new StatusPanel();
        }

        @Override
        public Object getCellEditorValue() {
            return theStatusPanel.getLabel();
        }

        @Override
        public Component getTableCellEditorComponent(JTable table, Object value,
                boolean isSelected, int row, int column) {
            theStatusPanel.setLabel((String) value);
            if (isSelected) {
                theStatusPanel.setBackground(new Color(201, 197, 199));
            } else {
                theStatusPanel.setBackground(new Color(201, 197, 199));
            }
            return theStatusPanel;
        }

        public void setStatusPanelBackgound(Color c) {
            theStatusPanel.setBackground(c);
        }
    }

    private class StatusRenderer extends StatusPanel implements TableCellRenderer {

        @Override
        public Component getTableCellRendererComponent(JTable table, Object value,
                boolean isSelected, boolean hasFocus, int row, int column) {
            setLabel((String) value);

            if (isSelected) {
                setBackground(new Color(201, 197, 199));
            } else {
                setBackground(table.getBackground());
            }

            return this;
        }
    }
}
