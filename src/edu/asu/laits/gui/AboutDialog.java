package edu.asu.laits.gui;

import java.awt.Component;
import java.awt.Frame;

import javax.swing.Box;
import javax.swing.JDialog;
import javax.swing.JPanel;
import java.awt.GridBagLayout;
import java.awt.BorderLayout;
import java.awt.Dimension;
import javax.swing.JButton;
import java.awt.GridBagConstraints;
import javax.swing.BoxLayout;
import javax.swing.BorderFactory;
import javax.swing.border.BevelBorder;
import javax.swing.event.HyperlinkEvent;
import javax.swing.event.HyperlinkListener;
import javax.swing.text.html.HTMLDocument;
import javax.swing.text.html.HTMLEditorKit;

import edu.asu.laits.properties.GlobalProperties;

import edu.stanford.ejalbert.BrowserLauncher;
import edu.stanford.ejalbert.exception.BrowserLaunchingInitializingException;
import edu.stanford.ejalbert.exception.UnsupportedOperatingSystemException;

import javax.swing.JLabel;
import java.awt.Font;
import java.io.IOException;
import java.io.InputStream;

import javax.swing.JScrollPane;
import javax.swing.JTextPane;

/**
 * This class represents an about dialog that gives some basic information about
 * the program.
 *
 * @author kjellw
 */
public class AboutDialog extends JDialog {

    private JPanel rootPanel = null;
    private JPanel okPanel = null;
    private JPanel titlePanel = null;
    private JPanel informationPanel = null;
    private JButton okejButton = null;
    private JLabel jLabel = null;
    private JScrollPane jScrollPane = null;
    private JTextPane informationTextPane = null;

    private AboutDialog(Frame rootComponent) {
        super(rootComponent);
        initialize();
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.setSize(new Dimension(400, 400));
        this.setTitle("About " + GlobalProperties.PROGRAM_NAME);
        this.setContentPane(getRootPanel());

    }

    public static void showAboutDialog(Frame rootComponent) {
        new AboutDialog(rootComponent).setVisible(true);
    }

    /**
     * This method initializes rootPanel
     *
     * @return javax.swing.JPanel
     */
    private JPanel getRootPanel() {
        if (rootPanel == null) {
            rootPanel = new JPanel();
            rootPanel.setLayout(new BorderLayout());
            rootPanel.add(getOkPanel(), BorderLayout.SOUTH);
            rootPanel.add(getTitlePanel(), BorderLayout.NORTH);
            rootPanel.add(getInformationPanel(), BorderLayout.CENTER);
        }
        return rootPanel;
    }

    /**
     * This method initializes okPanel
     *
     * @return javax.swing.JPanel
     */
    private JPanel getOkPanel() {
        if (okPanel == null) {
            okPanel = new JPanel();
            okPanel.setLayout(new BoxLayout(getOkPanel(), BoxLayout.X_AXIS));
            okPanel.setBorder(BorderFactory
                    .createBevelBorder(BevelBorder.RAISED));
            okPanel.add(Box.createGlue());
            okPanel.add(getOkejButton());

        }
        return okPanel;
    }

    /**
     * This method initializes titlePanel
     *
     * @return javax.swing.JPanel
     */
    private JPanel getTitlePanel() {
        if (titlePanel == null) {
            jLabel = new JLabel();
            jLabel.setText("About " + GlobalProperties.PROGRAM_NAME);
            jLabel.setFont(new Font("Dialog", Font.BOLD, 24));
            titlePanel = new JPanel();
            titlePanel.setLayout(new GridBagLayout());
            titlePanel.setBorder(BorderFactory
                    .createBevelBorder(BevelBorder.RAISED));
            titlePanel.add(jLabel, new GridBagConstraints());
        }
        return titlePanel;
    }

    /**
     * This method initializes informationPanel
     *
     * @return javax.swing.JPanel
     */
    private JPanel getInformationPanel() {
        if (informationPanel == null) {
            GridBagConstraints gridBagConstraints = new GridBagConstraints();
            gridBagConstraints.fill = GridBagConstraints.BOTH;
            gridBagConstraints.gridy = 0;
            gridBagConstraints.weightx = 1.0;
            gridBagConstraints.weighty = 1.0;
            gridBagConstraints.gridx = 0;
            informationPanel = new JPanel();
            informationPanel.setLayout(new GridBagLayout());
            informationPanel.add(getJScrollPane(), gridBagConstraints);
        }
        return informationPanel;
    }

    /**
     * This method initializes okejButton
     *
     * @return javax.swing.JButton
     */
    private JButton getOkejButton() {
        if (okejButton == null) {
            okejButton = new JButton();
            okejButton.setText("OK");
            okejButton.addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    setVisible(false);
                }
            });
        }
        return okejButton;
    }

    /**
     * This method initializes jScrollPane
     *
     * @return javax.swing.JScrollPane
     */
    private JScrollPane getJScrollPane() {
        if (jScrollPane == null) {
            jScrollPane = new JScrollPane();
            jScrollPane.setViewportView(getInformationTextPane());
        }
        return jScrollPane;
    }

    /**
     * This method initializes informationTextPane
     *
     * @return javax.swing.JTextPane
     */
    private JTextPane getInformationTextPane() {
        if (informationTextPane == null) {
            informationTextPane = new JTextPane();
            HTMLDocument htmlDocument = new HTMLDocument();
            informationTextPane.setEditable(false);
            informationTextPane.setEditorKit(new HTMLEditorKit());
            InputStream is = getClass().getResourceAsStream(
                    "/edu/asu/laits/gui/about.html");
           
            try {
                informationTextPane.read(is, htmlDocument);
                is.close();
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            informationTextPane.addHyperlinkListener(new HyperlinkListener() {
                public void hyperlinkUpdate(HyperlinkEvent e) {
                    if (e.getEventType() == HyperlinkEvent.EventType.ACTIVATED) {
                        try {
                            BrowserLauncher luncher = new BrowserLauncher();
                            luncher.openURLinBrowser(e.getURL().toString());
                        } catch (BrowserLaunchingInitializingException e1) {
                            // TODO Auto-generated catch block
                            e1.printStackTrace();
                        } catch (UnsupportedOperatingSystemException e1) {
                            // TODO Auto-generated catch block
                            e1.printStackTrace();
                        }

                    }
                }
            });

        }
        return informationTextPane;
    }
}
