package edu.asu.laits.gui;

import java.awt.BorderLayout;
import java.awt.Frame;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.SwingUtilities;
import javax.swing.border.BevelBorder;

/**
 * A cancelable process dialog whitch can show information from a running cancel
 * able process and has a button which tries to terminate the process if you
 * click on it.
 * 
 * @author kjellw
 */
public class CancelAbleProcessDialog extends JDialog implements StatusNotifier {

	private static final long serialVersionUID = 1L;

	private JPanel jContentPane = null;

	private JScrollPane jScrollPane = null;

	private JTextArea jTextArea = null;

	private JPanel jPanel = null;

	private JLabel jLabel = null;

	private JButton jButton = null;

	private JPanel jPanel1 = null;

	private Thread runningProcess;

	private Frame parent;

	/**
	 * @param owner
	 */
	public CancelAbleProcessDialog(Frame owner,
			CancelAbleProcess cancelAbleProcess, String informationText) {
		super(owner);
		this.parent = owner;
		parent.setEnabled(false);
		initialize();
		owner.setEnabled(false);
		runningProcess = new Thread(cancelAbleProcess);
		cancelAbleProcess.setStatusNotifier(this);
		runningProcess.start();
		setVisible(true);
		setDefaultCloseOperation(DO_NOTHING_ON_CLOSE);
		getJTextArea().setText(informationText);
		// A thread to check if the running process has terminated
		new Thread(new Runnable() {
			public void run() {
				while (runningProcess.isAlive()) {
					Thread.yield();
				}
				if (!runningProcess.isAlive()) {
					SwingUtilities.invokeLater(new Runnable() {
						public void run() {
							parent.setEnabled(true);
							setVisible(false);
							dispose();
						}
					});
				}
			}
		}).start();

	}

	/**
	 * This method initializes this
	 * 
	 * @return void
	 */
	private void initialize() {
		this.setSize(300, 200);
		this.setContentPane(getJContentPane());
	}

	/**
	 * This method initializes jContentPane
	 * 
	 * @return javax.swing.JPanel
	 */
	private JPanel getJContentPane() {
		if (jContentPane == null) {
			jContentPane = new JPanel();
			jContentPane.setLayout(new BorderLayout());
			jContentPane.add(getJScrollPane(), BorderLayout.CENTER);
			jContentPane.add(getJPanel(), BorderLayout.SOUTH);
		}
		return jContentPane;
	}

	/**
	 * This method initializes jScrollPane
	 * 
	 * @return javax.swing.JScrollPane
	 */
	private JScrollPane getJScrollPane() {
		if (jScrollPane == null) {
			jScrollPane = new JScrollPane();
			jScrollPane.setViewportView(getJTextArea());
		}
		return jScrollPane;
	}

	/**
	 * This method initializes jTextArea
	 * 
	 * @return javax.swing.JTextArea
	 */
	private JTextArea getJTextArea() {
		if (jTextArea == null) {
			jTextArea = new JTextArea();
			jTextArea.setEditable(false);
			jTextArea.setWrapStyleWord(true);
			jTextArea.setLineWrap(true);
		}
		return jTextArea;
	}

	/**
	 * This method initializes jPanel
	 * 
	 * @return javax.swing.JPanel
	 */
	private JPanel getJPanel() {
		if (jPanel == null) {
			jLabel = new JLabel();
			jLabel.setText("");
			jPanel = new JPanel();
			jPanel.setLayout(new BorderLayout());
			jPanel.setBorder(BorderFactory
					.createBevelBorder(BevelBorder.LOWERED));
			jPanel.add(jLabel, BorderLayout.CENTER);
			jPanel.add(getJPanel1(), BorderLayout.SOUTH);
		}
		return jPanel;
	}

	/**
	 * This method initializes jButton
	 * 
	 * @return javax.swing.JButton
	 */
	private JButton getJButton() {
		if (jButton == null) {
			jButton = new JButton();
			jButton.setText("Cancel process");
			jButton.addActionListener(new java.awt.event.ActionListener() {
				public void actionPerformed(java.awt.event.ActionEvent e) {
					runningProcess.interrupt();
					setVisible(false);
					parent.setEnabled(true);
					dispose();

				}
			});
		}
		return jButton;
	}

	/**
	 * This method initializes jPanel1
	 * 
	 * @return javax.swing.JPanel
	 */
	private JPanel getJPanel1() {
		if (jPanel1 == null) {
			jPanel1 = new JPanel();
			jPanel1.setLayout(new BoxLayout(getJPanel1(), BoxLayout.X_AXIS));
			jPanel1.add(Box.createGlue());
			jPanel1.add(getJButton(), null);
		}
		return jPanel1;
	}

	public synchronized void setStatusMessage(final String message) {
		SwingUtilities.invokeLater(new Runnable() {
			public void run() {
				jLabel.setText(message);
			}
		});

	}

}
