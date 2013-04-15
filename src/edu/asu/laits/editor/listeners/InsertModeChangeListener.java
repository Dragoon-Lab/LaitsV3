package edu.asu.laits.editor.listeners;

/**
 * An interface for a listener that can listen to changes of the insert mode.
 * Can be added to a GraphEditorPane
 */
public interface InsertModeChangeListener {

	public void newInsertModeEvent(boolean insertMode);
}
