/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.editor;

import edu.asu.laits.gui.nodeeditor.AuthorModeNodeEditorController;
import edu.asu.laits.gui.nodeeditor.CoachedModeNodeEditorController;
import edu.asu.laits.gui.nodeeditor.NodeEditorController;
import edu.asu.laits.gui.nodeeditor.NodeEditorView;
import edu.asu.laits.gui.nodeeditor.StudentModeNodeEditorController;
import edu.asu.laits.gui.nodeeditor.TestModeNodeEditorController;
import edu.asu.laits.model.Vertex;

/**
 *
 * @author ramayantiwari
 */
public class ControllerFactory {
    // Create NodeEditor Controller Instance based on Application
    public static NodeEditorController getNodeEditorController(NodeEditorView view, Vertex v){
        if (ApplicationContext.isStudentMode()){
            return new StudentModeNodeEditorController(view, v);
        }
        else if (ApplicationContext.isAuthorMode()) {
            return new AuthorModeNodeEditorController(view, v);            
        }
        else if (ApplicationContext.isCoachedMode()) {
            return new CoachedModeNodeEditorController(view, v);
        }
        else if (ApplicationContext.isTestMode()) {
            return new TestModeNodeEditorController(view, v);
        }
        else {
            throw new IllegalArgumentException();
        }
    }
}
