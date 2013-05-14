/*
 * LAITS Project
 * Arizona State University
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.Vector;
import javax.swing.AbstractCellEditor;
import javax.swing.BorderFactory;

import javax.swing.ButtonGroup;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.AbstractTableModel;
import javax.swing.table.TableCellEditor;
import javax.swing.table.TableCellRenderer;

public class NewPlanPanel extends JPanel {

    private static final String[] COLUMN_NAMES = {
        "<html><h3>The Node's value is...", "<html><h3>Node Type", "<html><h3>Calculations"};
    private MyTableModel tableModel;
    private JTable table;
    private String selectedPlan;
    private static PlanPanelView planView;
    private boolean isViewEnabled = false;
    private NodeEditor nodeEditor;
    private static String[] firstOption = {"a fixed, given number", "fixed value", "the number"};
    private static String[] secondOption = {"<html>proportional to the value of the <BR/> accumulator that it is input to", "function", "accumulator * proportion"};
    private static String[] thirdOption = {"said to increase", "accumulator", "increase"};
    private static String[] fourthOption = {"said to decrease", "accumulator", "- decrease"};
    private static String[] fifthOption = {"said to both increase and decrease", "accumulator", "increase - decrease"};
    private static String[] sixedOption = {"the difference of two quantities", "function", "quantity1 - quantity2"};
    private static String[] seventhOption = {"the ratio of two quantities", "function", "quantity1 / quantity2"};

    
    public NewPlanPanel(NodeEditor ne) {
        super(new BorderLayout(0, 5));

        nodeEditor = ne;
        initPanel();
    }
    
    public void initPanel() {
        setBorder(BorderFactory.createEmptyBorder(5, 5, 5, 5));
        tableModel = new MyTableModel();
        table = new JTable(tableModel);

        table.setDefaultEditor(String.class, new StatusEditor());
        table.setDefaultRenderer(String.class, new StatusRenderer());

        table.setRowHeight(36);
        table.getColumnModel().getColumn(0).setPreferredWidth(260);
        table.getColumnModel().getColumn(1).setPreferredWidth(150);
        table.getColumnModel().getColumn(2).setPreferredWidth(170);

        table.getColumnModel().getColumn(0).setResizable(false);
        table.getColumnModel().getColumn(1).setResizable(false);
        table.getColumnModel().getColumn(2).setResizable(false);
        table.addMouseListener(new MouseAdapter() {
             @Override
                public void mousePressed(MouseEvent e)
                {
                    table.setSelectionBackground(new Color(201, 197, 199));
                }
                
        });

        JScrollPane scroll = new JScrollPane(table);
        scroll.setPreferredSize(new Dimension(577, 335));
        scroll.setMinimumSize(new Dimension(577, 335));

        add(scroll, BorderLayout.CENTER);
        tableModel.add(new TableEntry(firstOption[0], firstOption[1], firstOption[2]));
        tableModel.add(new TableEntry(secondOption[0], secondOption[1], secondOption[2]));
        tableModel.add(new TableEntry(thirdOption[0], thirdOption[1], thirdOption[2]));
        tableModel.add(new TableEntry(fourthOption[0], fourthOption[1], fourthOption[2]));
        tableModel.add(new TableEntry(fifthOption[0], fifthOption[1], fifthOption[2]));
        tableModel.add(new TableEntry(sixedOption[0], sixedOption[1], sixedOption[2]));
        tableModel.add(new TableEntry(seventhOption[0], seventhOption[1], seventhOption[2]));
        
        setSelectedPlan(nodeEditor.getCurrentVertex().getPlan());
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
            nodeEditor.getCurrentVertex().setPlan(getSelectedPlan());
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
        if (plan.equals(Vertex.Plan.FIXED)) {
            table.setRowSelectionInterval(0, 0);
        } else if (plan.equals(Vertex.Plan.DECREASE)) {
            table.setRowSelectionInterval(0, 0);
        } else if (plan.equals(Vertex.Plan.INCREASE)) {
            table.setRowSelectionInterval(0, 0);
        } else if (plan.equals(Vertex.Plan.INCREASE_AND_DECREASE)) {
            table.setRowSelectionInterval(0, 0);
        } else if (plan.equals(Vertex.Plan.PROPORTIONAL)) {
            table.setRowSelectionInterval(0, 0);
        } else if (plan.equals(Vertex.Plan.RATIO)) {
            table.setRowSelectionInterval(0, 0);
        } else if (plan.equals(Vertex.Plan.DIFFERENCE)) {
            table.setRowSelectionInterval(0, 0);
        } else {
            table.clearSelection();
        }
    }

    public Vertex.Plan getSelectedPlan() {
        if(table.getSelectedRow() == 0 && table.getSelectedColumn() == 0){
            return Vertex.Plan.FIXED;
        }else if(table.getSelectedRow() == 1 && table.getSelectedColumn() == 0){
            return Vertex.Plan.DECREASE;
        }else if(table.getSelectedRow() == 2 && table.getSelectedColumn() == 0){
            return Vertex.Plan.DIFFERENCE;
        }else if(table.getSelectedRow() == 3 && table.getSelectedColumn() == 0){
            return Vertex.Plan.INCREASE;
        }else if(table.getSelectedRow() == 4 && table.getSelectedColumn() == 0){
            return Vertex.Plan.INCREASE_AND_DECREASE;
        }else if(table.getSelectedRow() == 5 && table.getSelectedColumn() == 0){
            return Vertex.Plan.RATIO;
        }else if(table.getSelectedRow() == 6 && table.getSelectedColumn() == 0){
            return Vertex.Plan.PROPORTIONAL;
        }else{
            return Vertex.Plan.UNDEFINED;
        }
    }

    public boolean isViewEnabled() {
        if(nodeEditor.getCurrentVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.CORRECT) ||
                nodeEditor.getCurrentVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.GAVEUP))
            return true;
        else 
            return false;
    }

    public void setSelectedPlanBackground(Color c) {
        table.setSelectionBackground(c);
        StatusEditor s = (StatusEditor)table.getCellEditor(table.getSelectedRow(), 0);
        
        s.setStatusPanelBackgound(c);
    }

    public void resetBackGroundColor() {
        table.setSelectionBackground(Color.WHITE);
    }

    public void giveUpPlanPanel() {
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        Vertex.Plan correctPlan = solution.getNodeByName(
                nodeEditor.getCurrentVertex().getName()).getNodePlan();

        setSelectedPlan(correctPlan);
        setSelectedPlanBackground(Color.YELLOW);
    }

    public String printPlanPanel() {
        StringBuilder sb = new StringBuilder();
        sb.append("Selected Plan : '");
        sb.append(planToString(getSelectedPlan()) + "'");
        return sb.toString();
    }

    private String planToString(Vertex.Plan p) {
        if (p.equals(Vertex.Plan.DECREASE)) {
            return "Decrease";
        } else if (p.equals(Vertex.Plan.INCREASE)) {
            return "Increase";
        } else if (p.equals(Vertex.Plan.DIFFERENCE)) {
            return "Difference";
        } else if (p.equals(Vertex.Plan.FIXED)) {
            return "Fixed";
        } else if (p.equals(Vertex.Plan.INCREASE_AND_DECREASE)) {
            return "Increase and Decrease";
        } else if (p.equals(Vertex.Plan.PROPORTIONAL)) {
            return "Proportional";
        } else if (p.equals(Vertex.Plan.RATIO)) {
            return "Ratio";
        } else {
            return "Undefined";
        }
    }

    public void setEditableRadio(Boolean b) {
        table.setEnabled(b);
    }

    private class TableEntry {

        private String valueType;
        private String nodeType;
        private String nodeEquation;

        TableEntry(String vt, String nt, String ne) {
            valueType = vt;
            nodeType = nt;
            nodeEquation = ne;
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

        public String getNodeEquation() {
            return nodeEquation;
        }

        public void setNodeEquation(String s) {
            nodeEquation = s;
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
            return 3;
        }

        @Override
        public Object getValueAt(int rowIndex, int columnIndex) {
            TableEntry entry = (TableEntry) theEntries.elementAt(rowIndex);
            switch (columnIndex) {
                case 0:
                    return entry.getValueType();
                case 1:
                    return entry.getNodeType();
                case 2:
                    return entry.getNodeEquation();
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
        
        public void setStatusPanelBackgound(Color c){
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
