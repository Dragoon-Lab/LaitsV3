
package edu.asu.laits.properties;

import java.awt.Color;
import java.io.File;
import java.util.LinkedList;
import java.util.List;

import edu.asu.laits.model.Vertex.Shape;
import edu.asu.laits.editor.listeners.GraphChangeListener;
import edu.asu.laits.editor.listeners.GraphSaveListener;

/**
 * This class represents properties for a graph. All fields that are not marked
 * as transient are saved with the graph in the graph file format. It is
 * possible to add listeners to the objects of this class to listen for graph
 * changes etc. Objects of GraphEditorPane has a GraphProperties object.
 * 
 * @author kjellw
 * 
 */
public class GraphProperties {

	// True if and only if the graph has benn changed since last saved or opened
	private transient boolean changed = false;

	// True if and only if the file exists on the file system
	private transient boolean existsOnFileSystem = false;

	// Contains the file path if it exists on file system
	private transient File savedAs;

	// The graphChange listeners that listens for changes in the graph
	private transient List<GraphChangeListener> graphChangeListeners = new LinkedList<GraphChangeListener>();

	private transient List<GraphSaveListener> graphSaveListeners = new LinkedList<GraphSaveListener>();

	// The current zoom Level
	private double zoomLevel = 1.0;

	private Shape defaultShape = Shape.FLOW;

	private Shape defaultInsertShape = Shape.DEFAULT;

	private Color backgroundColor = new Color(255, 255, 255);

	private boolean defaultUseGraphBackground = true;

	private Color defaultVertexBackgroundColor = new Color(255, 255, 255);

	private Color defaultVertexForegroundColor = new Color(0, 0, 0);

	/**
	 * @return the graphChangeListeners
	 */
	public List<GraphChangeListener> getGraphChangeListeners() {
		return graphChangeListeners;
	}

	public void addGraphChangeListener(GraphChangeListener l) {
		graphChangeListeners.add(l);
	}

	public void addSaveListener(GraphSaveListener l) {
		graphSaveListeners.add(l);
	}

	/**
	 * @param savedAs
	 *            the savedAs to set
	 */
	public void setSavedAs(File savedAs) {
		changed = false;
		existsOnFileSystem = true;
		this.savedAs = savedAs;
		for (GraphSaveListener l : graphSaveListeners) {
			l.graphSaved();
		}
		changed = false;
	}

	/**
	 * This method shall be called if something in the graph that is not
	 * directly related to its properties is changed. Such as adding an edge or
	 * vertex. So all GraphChangeListener that is registed for this
	 * graphProperties can be notified.
	 */
	public void fireChangedEvent() {

		changed = true;
		for (GraphChangeListener l : graphChangeListeners) {
			l.graphChanged();
		}
	}

	/**
	 * @return the zoomLevel
	 */
	public double getZoomLevel() {
		return zoomLevel;
	}

	/**
	 * @param zoomLevel
	 *            the zoomLevel to set
	 */
	public void setZoomLevel(double zoomLevel) {
		changed = true;
		this.zoomLevel = zoomLevel;
	}

	/**
	 * @return the existsOnFileSystem
	 */
	public boolean isExistsOnFileSystem() {
		return existsOnFileSystem;
	}

	/**
	 * @param existsOnFileSystem
	 *            the existsOnFileSystem to set
	 */
	public void setExistsOnFileSystem(boolean existsOnFileSystem) {
		this.existsOnFileSystem = existsOnFileSystem;
	}

	/**
	 * @return the savedAs
	 */
	public File getSavedAs() {
		return savedAs;
	}

	public void initializeNotSerializeFeelds() {
		changed = false;
		existsOnFileSystem = false;
		graphChangeListeners = new LinkedList<GraphChangeListener>();
		graphSaveListeners = new LinkedList<GraphSaveListener>();

	}

	/**
	 * @return the changed
	 */
	public boolean isChanged() {
		return changed;
	}

	/**
	 * @return the backgroundColor
	 */
	public Color getBackgroundColor() {
		return backgroundColor;
	}

	/**
	 * @param backgroundColor
	 *            the backgroundColor to set
	 */
	public void setBackgroundColor(Color backgroundColor) {
		this.backgroundColor = backgroundColor;
		changed = true;
		fireChangedEvent();
	}

	/**
	 * @return the defaultShape
	 */
	public Shape getDefaultShape() {
		return defaultShape;
	}

	/**
	 * @param defaultShape
	 *            the defaultShape to set
	 */
	public void setDefaultShape(Shape defaultShape) {
		this.defaultShape = defaultShape;
		changed = true;
		fireChangedEvent();
	}

	/**
	 * @return the defaultInsertShape
	 */
	public Shape getDefaultInsertShape() {
		return defaultInsertShape;
	}

	/**
	 * @param defaultInsertShape
	 *            the defaultInsertShape to set
	 */
	public void setDefaultInsertShape(Shape defaultInsertShape) {
		this.defaultInsertShape = defaultInsertShape;
		changed = true;
		fireChangedEvent();
	}

	/**
	 * @return the defaultUseGraphBackground
	 */
	public boolean isDefaultUseGraphBackground() {
		return defaultUseGraphBackground;
	}

	/**
	 * @param defaultUseGraphBackground
	 *            the defaultUseGraphBackground to set
	 */
	public void setDefaultUseGraphBackground(boolean defaultUseGraphBackground) {
		this.defaultUseGraphBackground = defaultUseGraphBackground;
		changed = true;
		fireChangedEvent();
	}

	/**
	 * @return the defaultVertexBackgroundColor
	 */
	public Color getDefaultVertexBackgroundColor() {
		return defaultVertexBackgroundColor;
	}

	/**
	 * @param defaultVertexBackgroundColor
	 *            the defaultVertexBackgroundColor to set
	 */
	public void setDefaultVertexBackgroundColor(
			Color defaultVertexBackgroundColor) {
		this.defaultVertexBackgroundColor = defaultVertexBackgroundColor;
		changed = true;
		fireChangedEvent();
	}

	/**
	 * @return the defaultVertexForegroundColor
	 */
	public Color getDefaultVertexForegroundColor() {
		return defaultVertexForegroundColor;
	}

	/**
	 * @param defaultVertexForegroundColor
	 *            the defaultVertexForegroundColor to set
	 */
	public void setDefaultVertexForegroundColor(
			Color defaultVertexForegroundColor) {
		this.defaultVertexForegroundColor = defaultVertexForegroundColor;
		changed = true;
		fireChangedEvent();
	}
}
