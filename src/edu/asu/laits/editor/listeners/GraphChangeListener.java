package edu.asu.laits.editor.listeners;

/**
 * This interface represent a class that can listen for graph changes
 */
public interface GraphChangeListener {

    /**
     * This is called when the graph is changed if it exists in the list of
     * graphChangeListeners in the GraphProperties object for this class.
     */
    public void graphChanged();
}
