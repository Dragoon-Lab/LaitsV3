package edu.asu.laits.editor;

import edu.asu.laits.gui.MainWindow;
import java.awt.Frame;

import javax.swing.Box;
import javax.swing.JDialog;
import javax.swing.JPanel;
import javax.swing.SpinnerModel;
import javax.swing.SpinnerNumberModel;

import java.awt.GridBagLayout;
import javax.swing.BorderFactory;
import javax.swing.border.TitledBorder;
import javax.swing.JSpinner;
import java.awt.GridBagConstraints;
import java.awt.BorderLayout;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import java.awt.Dimension;
import javax.swing.border.BevelBorder;

/**
 * A dialog that is used to deside how many vertices is going to be placed
 * between vertices when the operation split edges has been called.
 */
public class SplitSelectedEdgesDialog extends JDialog {

    private GraphEditorPane graphPane;
    private JPanel jPanel = null;
    private JSpinner jSpinner = null;
    private JPanel jPanel1 = null;
    private JPanel jPanel2 = null;
    private JButton jButton = null;
    private JButton jButton1 = null;

    private SplitSelectedEdgesDialog(GraphEditorPane graphPane) {
        super(MainWindow.getInstance());
        initialize();
        this.graphPane = graphPane;
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.setTitle("Split edge(s)");
        this.setSize(new Dimension(320, 170));
        this.setContentPane(getJPanel1());

    }

    public static void show(GraphEditorPane graphPane) {
        new SplitSelectedEdgesDialog(graphPane).setVisible(true);

    }

    /**
     * This method initializes jPanel
     *
     * @return javax.swing.JPanel
     */
    private JPanel getJPanel() {
        if (jPanel == null) {
            GridBagConstraints gridBagConstraints = new GridBagConstraints();
            gridBagConstraints.gridx = 0;
            gridBagConstraints.gridy = 0;
            jPanel = new JPanel();
            jPanel.setLayout(new GridBagLayout());
            jPanel.setBorder(BorderFactory.createTitledBorder(null,
                    "Select number of vertices to put in:",
                    TitledBorder.DEFAULT_JUSTIFICATION,
                    TitledBorder.DEFAULT_POSITION, null, null));
            jPanel.add(getJSpinner(), gridBagConstraints);
        }
        return jPanel;
    }

    /**
     * This method initializes jSpinner
     *
     * @return javax.swing.JSpinner
     */
    private JSpinner getJSpinner() {
        if (jSpinner == null) {
            SpinnerModel model = new SpinnerNumberModel(1, // initial value
                    1, // min
                    100, // max
                    1); // step
            jSpinner = new JSpinner(model);

        }
        return jSpinner;
    }

    /**
     * This method initializes jPanel1
     *
     * @return javax.swing.JPanel
     */
    private JPanel getJPanel1() {
        if (jPanel1 == null) {
            jPanel1 = new JPanel();
            jPanel1.setLayout(new BorderLayout());
            jPanel1.add(getJPanel(), BorderLayout.NORTH);
            jPanel1.add(getJPanel2(), BorderLayout.SOUTH);
        }
        return jPanel1;
    }

    /**
     * This method initializes jPanel2
     *
     * @return javax.swing.JPanel
     */
    private JPanel getJPanel2() {
        if (jPanel2 == null) {
            jPanel2 = new JPanel();
            jPanel2.setLayout(new BoxLayout(getJPanel2(), BoxLayout.X_AXIS));
            jPanel2.setBorder(BorderFactory
                    .createBevelBorder(BevelBorder.RAISED));
            jPanel2.add(Box.createGlue());
            jPanel2.add(getJButton1(), null);
            jPanel2.add(getJButton(), null);
        }
        return jPanel2;
    }

    /**
     * This method initializes jButton
     *
     * @return javax.swing.JButton
     */
    private JButton getJButton() {
        if (jButton == null) {
            jButton = new JButton();
            jButton.setText("OK");
            jButton.addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    // Shall split all selected edges
                    graphPane.splitSelectedEdges((Integer) jSpinner.getValue());
                    setVisible(false);
                    dispose();
                }
            });
        }
        return jButton;
    }

    /**
     * This method initializes jButton1
     *
     * @return javax.swing.JButton
     */
    private JButton getJButton1() {
        if (jButton1 == null) {
            jButton1 = new JButton();
            jButton1.setText("Cancel");
        }
        return jButton1;
    }
}
