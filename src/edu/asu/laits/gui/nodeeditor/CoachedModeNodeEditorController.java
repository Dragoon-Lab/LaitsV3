/**
 * LAITS Project Arizona State University
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.BlockingToolTip;
import edu.asu.laits.model.HelpBubble;
import edu.asu.laits.model.Vertex;
import java.util.List;
import org.apache.log4j.Logger;

/**
 * Implements functionalities of NodeEditor for Coached Mode
 *
 * @author ramayantiwari
 */
public class CoachedModeNodeEditorController extends NodeEditorController {

    private NodeEditorView view;
    private Vertex openVertex;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    public CoachedModeNodeEditorController(NodeEditorView view, Vertex openVertex) {
        super(view, openVertex);
        this.view = view;
        this.openVertex = openVertex;
    }

    public void initActionButtons() {
        initOkButton();
        initCloseButton();
        initCheckButton();
        initDemoButton();
        super.resetActionButtonAfterDemoUsed();
    }

    public void initCheckButton() {
    }

    public void initDemoButton() {
        super.initDemoButton();
    }

    public void initOkButton() {
        view.getOKButton().setVisible(false);
    }

    public void initCloseButton() {
    }

    public void processCheckAction() {
    }

    public void processDemoAction() {
    }

    public void processCancelAction() {
        view.getCancelButton().setEnabled(false);
    }

    public void initOnLoadBalloonTip() {
        if (openVertex.getName().equals("")) {
            addHelpBalloon(ApplicationContext.getFirstNextNode(), "onLoad", 
                    view.getTabName(view.getTabbedPane().getSelectedIndex()));
        } else {
            addHelpBalloon(openVertex.getName(), "onLoad", 
                    view.getTabName(view.getTabbedPane().getSelectedIndex()));

        }

    }

    private void addHelpBalloon(String name, String timing, String panel) {
        logs.debug("Adding Help Bubble for " + panel);
        if (ApplicationContext.isCoachedMode()) {
            System.out.println("addhelpballoon passing in " + name);
            List<HelpBubble> bubbles = ApplicationContext.getHelp(name, panel, timing);

            if (!bubbles.isEmpty()) {
                for (HelpBubble bubble : bubbles) {
                    try {
                        if (panel.equalsIgnoreCase("description")) {
                            new BlockingToolTip(view, bubble, view.getLabel("dPanel", bubble.getAttachedTo()));
                        } else if (panel.equalsIgnoreCase("plan")) {
                            logs.info("Trying to add help in Plan. Msg: " + bubble.getMessage() + "  " + bubble.getAttachedTo());
                            logs.info("comp: " + view.getPlanPanel().getLabel(bubble.getAttachedTo()));
                            new BlockingToolTip(view, bubble, view.getLabel("pPanel", bubble.getAttachedTo()));
                        } else if (panel.equalsIgnoreCase("inputs")) {
                            new BlockingToolTip(view, bubble, view.getLabel("iPanel", bubble.getAttachedTo()));
                        } else if (panel.equalsIgnoreCase("calculations")) {
                            new BlockingToolTip(view, bubble, view.getLabel("cPanel", bubble.getAttachedTo()));
                        }
                    } catch (IllegalArgumentException e) {
                        logs.fatal("Error creating bubble: " + e.getMessage());
                    }
                }
            }
        }
    }
}
