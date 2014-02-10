
package edu.asu.laits.editor;

import java.awt.Color;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;


import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.model.Vertex.VertexReaderException;
import edu.asu.laits.gui.CancelAbleProcess;
import edu.asu.laits.gui.CancelAbleProcessDialog;
import edu.asu.laits.gui.StatusNotifier;
import org.jgraph.graph.DefaultEdge;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.DefaultPort;
import org.jgraph.graph.Port;

/**
 * A class that is only visible in this package. It is used by the
 * GraphEditorPane to perorm operations on itself. It contains methods to perorm
 * various operations on the graph.
 */
class GraphOperationHelper {

	private GraphEditorPane graphPane;

	private boolean readyForOperation = true;

	private InformationPane informationPane;

	private SelectVertexKeyAdapter vertexSelectKeyAdapter;

	public GraphOperationHelper(GraphEditorPane graphPane,
			InformationPane informationPane) {
		this.graphPane = graphPane;
		this.informationPane = informationPane;
		vertexSelectKeyAdapter = new SelectVertexKeyAdapter();
		graphPane.addKeyListener(vertexSelectKeyAdapter);
	}

	synchronized public boolean isReadyForOperation() {
		return readyForOperation;
	}

	/**
	 * @param readyForOperation
	 *            the readyForOperation to set
	 */
	synchronized private void setReadyForOperation(boolean readyForOperation) {

		this.readyForOperation = readyForOperation;

	}

	
	private class CancelException extends Exception {
	};

	private enum KeyType {
		NO_OPTION_KEY, CANCEL_KEY, APROVE_KEY
	}

	private List<DefaultGraphCell> selectVertexSet(
			Set<Object> notAbleToSelectSet) throws CancelException {
		// Sets the not able to select sets so it is not posible to selects
		// cells
		// in it

		Hashtable<Object, Object> nestedMap = new Hashtable<Object, Object>();
		for (Object o : notAbleToSelectSet) {
			Hashtable<Object, Object> map = new Hashtable<Object, Object>();
			if (o instanceof DefaultGraphCell) {
				DefaultGraphCell cell = (DefaultGraphCell) o;
				GraphEditorConstants.setSelectable(map, false);
			}
			nestedMap.put(o, map);
		}
		graphPane.getGraphLayoutCache().edit(nestedMap);

		KeyType keyPressed = vertexSelectKeyAdapter.getKeyAlternative();

		if (keyPressed == KeyType.CANCEL_KEY)
			throw new CancelException();

		// Vertex set is selected and approve key is typed
		Object[] selectedVertices = graphPane.getSelectionCells(graphPane
				.getGraphLayoutCache().getCells(false, true, false, false));
		List<DefaultGraphCell> selectedVertexList = null;

		if (selectedVertices == null || selectedVertices.length == 0)
			selectedVertexList = new LinkedList<DefaultGraphCell>();
		else {
			selectedVertexList = new LinkedList();
			for (Object o : selectedVertices) {
				if (o instanceof DefaultGraphCell) {
					DefaultGraphCell cell = (DefaultGraphCell) o;
					selectedVertexList.add(cell);
				}

			}

		}
		// Make it possible to select cells in it again
		nestedMap = new Hashtable<Object, Object>();
		for (Object o : notAbleToSelectSet) {
			Hashtable<Object, Object> map = new Hashtable<Object, Object>();
			if (o instanceof DefaultGraphCell) {
				DefaultGraphCell cell = (DefaultGraphCell) o;
				GraphEditorConstants.setSelectable(map, true);
			}
			nestedMap.put(o, map);
		}
		graphPane.getGraphLayoutCache().edit(nestedMap);

		return selectedVertexList;
	}

	private List<DefaultGraphCell> selectVertexSet() throws CancelException {
		return selectVertexSet(new HashSet<Object>());
	}

	class SelectVertexKeyAdapter extends KeyAdapter {
		private KeyType keyIsTyped = KeyType.NO_OPTION_KEY;

		boolean keyAlternativeRequested = false;

		public void keyReleased(KeyEvent e) {
			if (!keyAlternativeRequested)
				return;
			if ((e.getKeyCode() == KeyEvent.VK_ESCAPE)) {
				
				keyIsTyped = KeyType.CANCEL_KEY;
			} else if (e.getKeyCode() == KeyEvent.VK_ENTER)
				keyIsTyped = KeyType.APROVE_KEY;
		}

		synchronized KeyType getTypedKey() {
			return keyIsTyped;
		}

		synchronized void setTypedKey(KeyType k) {
			keyIsTyped = k;
		}

		synchronized public KeyType getKeyAlternative() {
			keyAlternativeRequested = true;
			while (getTypedKey() == KeyType.NO_OPTION_KEY)
				Thread.yield();
			KeyType type = getTypedKey();
			setTypedKey(KeyType.NO_OPTION_KEY);
			keyAlternativeRequested = false;
			return type;
		}
	}

	

	private class VertexTuple {
		private Vertex v1;

		private Vertex v2;

		public VertexTuple(Vertex v1, Vertex v2) {
			try {
				v1.fetchInformationFromJGraph();
				v2.fetchInformationFromJGraph();
			} catch (VertexReaderException e) {

				e.printStackTrace();
			}
			this.v1 = v1;
			this.v2 = v2;
		}

		/*
		 * (non-Javadoc)
		 * 
		 * @see java.lang.Object#equals(java.lang.Object)
		 */
		@Override
		public boolean equals(Object obj) {
			if (obj instanceof VertexTuple) {
				VertexTuple o = (VertexTuple) obj;
				return (((o.getV1() == v1) && (o.getV2() == v2)) || ((o.getV1() == v2) && (o
						.getV2() == v1)));

			}
			return false;
		}

		@Override
		public int hashCode() {

			return v1.hashCode() + v2.hashCode();
		}

		/**
		 * @return the v1
		 */
		public Vertex getV1() {
			return v1;
		}

		/**
		 * @return the v2
		 */
		public Vertex getV2() {
			return v2;
		}

	}

	
	public void placeSelectedVerticesInCircle() {
		Object[] selectedVertices = graphPane.getSelectionCells(graphPane
				.getGraphLayoutCache().getCells(false, true, false, false));
		if (selectedVertices == null || selectedVertices.length == 0)
			return;
		// Place the circle within the bounds of the cellse
		Rectangle2D bounds = graphPane.getCellBounds(selectedVertices);
		double centerX = bounds.getCenterX();
		double centerY = bounds.getCenterY();
		double radius = (bounds.getWidth() > bounds.getHeight() ? bounds
				.getWidth() / 2 : bounds.getHeight() / 2);

		double piT2 = Math.PI * 2;
		double distanceBetweenVertices = piT2 / selectedVertices.length;
		double place = 0;
		Map<Object, Object> nestadMap = new HashMap<Object, Object>();

		for (Object selectedVertex : selectedVertices) {
			if (selectedVertex instanceof DefaultGraphCell) {
				DefaultGraphCell cell = (DefaultGraphCell) selectedVertex;
				Rectangle2D prevBoundes = GraphEditorConstants.getBounds(cell
						.getAttributes());
				Map<Object, Object> attrMap = new HashMap<Object, Object>();
				GraphEditorConstants.setBounds(attrMap, new Rectangle2D.Double(
						Math.cos(place) * radius + centerX, Math.sin(place)
								* radius + centerY, prevBoundes.getWidth(),
						prevBoundes.getHeight()));
				nestadMap.put(cell, attrMap);
			}

			place = place + distanceBetweenVertices;
		}
		graphPane.getGraphLayoutCache().edit(nestadMap);
	}

	public void mirrorSelectedVerticesVertical() {

		Object[] selectedVertices = graphPane.getSelectionCells(graphPane
				.getGraphLayoutCache().getCells(false, true, false, false));
		if (selectedVertices == null || selectedVertices.length == 0)
			return;
		// Place the circle within the bounds of the cellse
		Rectangle2D bounds = graphPane.getCellBounds(selectedVertices);

		double zeroPointPlusMaxPoint = bounds.getMinX() + bounds.getMaxX();

		Map<Object, Object> nestadMap = new HashMap<Object, Object>();

		for (Object selectedVertex : selectedVertices) {
			if (selectedVertex instanceof DefaultGraphCell) {
				DefaultGraphCell cell = (DefaultGraphCell) selectedVertex;
				Rectangle2D prevBoundes = GraphEditorConstants.getBounds(cell
						.getAttributes());
				double prevX = prevBoundes.getX();
				double prevY = prevBoundes.getY();
				Map<Object, Object> attrMap = new HashMap<Object, Object>();
				GraphEditorConstants
						.setBounds(attrMap,
								new Rectangle2D.Double(zeroPointPlusMaxPoint
										- prevX - prevBoundes.getWidth(),
										prevY, prevBoundes.getWidth(),
										prevBoundes.getHeight()));
				nestadMap.put(cell, attrMap);
			}
		}
		graphPane.getGraphLayoutCache().edit(nestadMap);

	}

	public void mirrorSelectedVerticesHorizontal() {
		Object[] selectedVertices = graphPane.getSelectionCells(graphPane
				.getGraphLayoutCache().getCells(false, true, false, false));
		if (selectedVertices == null || selectedVertices.length == 0)
			return;
		// Place the circle within the bounds of the cellse
		Rectangle2D bounds = graphPane.getCellBounds(selectedVertices);

		double zeroPointPlusMaxPoint = bounds.getMinY() + bounds.getMaxY();

		Map<Object, Object> nestadMap = new HashMap<Object, Object>();

		for (Object selectedVertex : selectedVertices) {
			if (selectedVertex instanceof DefaultGraphCell) {
				DefaultGraphCell cell = (DefaultGraphCell) selectedVertex;
				Rectangle2D prevBoundes = GraphEditorConstants.getBounds(cell
						.getAttributes());
				double prevX = prevBoundes.getX();
				double prevY = prevBoundes.getY();
				Map<Object, Object> attrMap = new HashMap<Object, Object>();
				GraphEditorConstants.setBounds(attrMap, new Rectangle2D.Double(
						prevX, zeroPointPlusMaxPoint - prevY
								- prevBoundes.getHeight(), prevBoundes
								.getWidth(), prevBoundes.getHeight()));
				nestadMap.put(cell, attrMap);
			}
		}
		graphPane.getGraphLayoutCache().edit(nestadMap);
		
	}

	

	public void splitSelectedEdges(int verticesBetween) {
		if (verticesBetween < 1)
			return;

		Object[] selectedEdges = graphPane.getSelectionCells(graphPane
				.getGraphLayoutCache().getCells(false, false, false, true));
		for (Object o : selectedEdges) {
			if (o instanceof DefaultEdge) {
				DefaultEdge edge = (DefaultEdge) o;
				splitEdge(edge, verticesBetween);
			}

		}

	}

	private void splitEdge(DefaultEdge edge, int verticesBetween) {

		List<Object> modifiedCells = new LinkedList<Object>();
		DefaultGraphCell source = graphPane.getSource(edge);
		modifiedCells.add(source);
		DefaultGraphCell dest = graphPane.getDest(edge);
		modifiedCells.add(dest);
		Object[] edgeCell = { edge };
		graphPane.getGraphLayoutCache().remove(edgeCell);
		Rectangle2D bounds = GraphEditorConstants.getBounds(source
				.getAttributes());
		Point2D sourcePos = new Point2D.Double(bounds.getCenterX(), bounds
				.getCenterY());
		bounds = GraphEditorConstants.getBounds(dest.getAttributes());
		Point2D destPos = new Point2D.Double(bounds.getCenterX(), bounds
				.getCenterY());

		double correctTermX = bounds.getWidth() / 2;
		double correctTermY = bounds.getHeight() / 2;

		double deltaX = destPos.getX() - sourcePos.getX();
		double deltaY = destPos.getY() - sourcePos.getY();

		double xStepSize = deltaX / (verticesBetween + 1);
		double yStepSize = deltaY / (verticesBetween + 1);

		double insertPosX = xStepSize + sourcePos.getX();
		double insertPosY = yStepSize + sourcePos.getY();
		DefaultGraphCell prevCell = source;
		DefaultGraphCell currentCell = null;
		for (int n = 0; n < verticesBetween; n++) {
			// Insert vertex
			currentCell = graphPane.addDefaultVertexAt(insertPosX
					- correctTermX + bounds.getCenterX() - bounds.getX(),
					insertPosY - correctTermY + bounds.getCenterY()
							- bounds.getY());
			modifiedCells.add(currentCell);
			// Connect
			modifiedCells.add(graphPane.connect((Port) prevCell.getChildAt(0),
					(Port) currentCell.getChildAt(0)));

			prevCell = currentCell;
			// Increase insert pos
			insertPosX = insertPosX + xStepSize;
			insertPosY = insertPosY + yStepSize;
		}
		modifiedCells.add(graphPane.connect((Port) currentCell.getChildAt(0),
				(Port) dest.getChildAt(0)));
		graphPane.setSelectionCells(modifiedCells.toArray());

	}

	
	
	 
		public void expandByFactor(double factor) {
			Object vertexCells[] = graphPane.getSelectionCells(graphPane
					.getGraphLayoutCache().getCells(false, true, false, false));

			Rectangle2D areaBounds = graphPane.getCellBounds(vertexCells);
			Hashtable<Object, Object> nestedMap = new Hashtable<Object, Object>();
			for (Object o : vertexCells) {
				Hashtable<Object, Object> map = new Hashtable<Object, Object>();
				if (o instanceof DefaultGraphCell) {
					DefaultGraphCell cell = (DefaultGraphCell) o;
					Rectangle2D bounds =
						GraphEditorConstants.getBounds(cell.getAttributes());
					Rectangle2D newBounds = new Rectangle2D.Double(
							areaBounds.getX() + (bounds.getX()-areaBounds.getX())*factor,
							areaBounds.getY() + (bounds.getY()-areaBounds.getY())*factor,
							bounds.getWidth(),
							bounds.getHeight());
					GraphEditorConstants.setBounds(map, newBounds);
					
				}
				nestedMap.put(o, map);
			}
			graphPane.getGraphLayoutCache().edit(nestedMap);
		}

}