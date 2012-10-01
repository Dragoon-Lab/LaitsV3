package edu.asu.laits.editor.listeners;

/**
 * This listener listens for changes of the status of the redo and undo manager.
 * It can be added to a GraphEditorPane.
 */
public interface UndoAndRedoAbleListener {

	/**
	 * This is set by the undo redo manger when its not posible to undo anymore
	 */
	void canNotUndo();

	/**
	 * This is set by the undo redo manger when its possible to undo again
	 */
	void canUndo();

	void canNotRedo();

	void canRedo();

}
