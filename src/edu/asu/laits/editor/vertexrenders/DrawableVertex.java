package edu.asu.laits.editor.vertexrenders;

import java.awt.Graphics;

/**
 * 
 * This interface is implemented by the vertex render components to show that
 * they have a method to simple draw themselves. This method is used by the
 * EPS-file exporter due to the fact that the EPSGraphics class that is used by
 * it does not work with the default draw operation becouse it does not support
 * some drawing operations.
 * 
 */
public interface DrawableVertex {

	public void drawVertex(Graphics g);
}
