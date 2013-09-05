package edu.asu.laits.editor;

import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.sql.Time;
import java.util.Timer;
import java.util.TimerTask;

/**
 * This class is a key handler that is added to the graph component
 * GraphEditorPane to add some key operations.
 *
 * These key operations are: * All selected nodes are deleted when backspace or
 * delete is pressed. * The insert mode off/on is toggled when you press the
 * space key. * The insert mode off/on is changed as long the a button is
 * pressed.
 */
public class KeyHandler extends KeyAdapter {

    private GraphEditorPane graphPane;
    private Timer switchModeTimer = new Timer();

    /**
     * @param graphPane
     */
    public KeyHandler(GraphEditorPane graphPane) {
        super();
        this.graphPane = graphPane;
    }
    // Information if the user has started to press the fast switch mode key
    private static boolean startPress = false;

    /**
     * Is called when a key is pressed in the asociated graph pane
     *
     * @see java.awt.event.KeyAdapter#keyReleased(java.awt.event.KeyEvent)
     */
    @Override
    public void keyReleased(KeyEvent e) {

        if ((e.getKeyCode() == KeyEvent.VK_DELETE
                || e.getKeyCode() == KeyEvent.VK_BACK_SPACE) && !ApplicationContext.isCoachedMode()) {
            /*
             * If it is the delete key the selected objects in the graph shall
             * be removed.
             */
            graphPane.removeSelected();
        } else if (e.getKeyCode() == KeyEvent.VK_A) {

            if (startPress) {
                // Starts a timer that will change mode if not key is pressed
                // again. This is to determine if the key is down.
                switchModeTimer.schedule(new TimerTask() {
                    @Override
                    public void run() {
                        //graphPane.setInsertMode(!graphPane.isInsertMode());
                        // The user has stoped to press
                        startPress = false;
                    }
                }, 200);

            }

        } 
    }

    @Override
    public void keyPressed(KeyEvent e) {

        if (e.getKeyCode() == KeyEvent.VK_A) {
            switchModeTimer.cancel();
            switchModeTimer = new Timer();
            if (!startPress) {
                startPress = true;
            }

        }

    }

    @Override
    public void keyTyped(KeyEvent e) {
    }
}
