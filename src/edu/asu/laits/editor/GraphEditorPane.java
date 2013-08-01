/**
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State
 * University. This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * LAITS is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS. If not, see <http://www.gnu.org/licenses/>.
 */

package edu.asu.laits.editor;

import java.awt.Color;
import java.awt.event.ActionEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.util.Hashtable;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.swing.AbstractAction;
import javax.swing.Action;

import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.editor.listeners.GraphPropertiesChangeListener;
import edu.asu.laits.editor.listeners.InsertModeChangeListener;
import edu.asu.laits.editor.listeners.UndoAndRedoAbleListener;
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.gui.menus.FileMenu;
import edu.asu.laits.logger.HttpAppender;
import edu.asu.laits.model.GraphLoader;
import edu.asu.laits.properties.GlobalProperties;
import edu.asu.laits.properties.GraphProperties;
import java.util.logging.Level;
import javax.swing.SwingConstants;
import org.apache.log4j.Logger;
import org.jgraph.JGraph;
import org.jgraph.event.GraphModelEvent;
import org.jgraph.event.GraphModelListener;
import org.jgraph.event.GraphSelectionEvent;
import org.jgraph.event.GraphSelectionListener;
import org.jgraph.graph.AttributeMap;
import org.jgraph.graph.DefaultEdge;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.DefaultPort;
import org.jgraph.graph.GraphConstants;
import org.jgraph.graph.GraphLayoutCache;
import org.jgraph.graph.Port;
import org.jgrapht.ext.JGraphModelAdapter;

/**
 * This class represents a graph editor pane used to edit and view graphs. It
 * extends JGraph which is the main component in the JGraph library. It
 * customizes the default JGraph behavior to suite for LAITS Graph Modeling.
 *
 * To do that it adds event listeners for keyboard events and marquee events. It
 * also changes the way vertices look by changing the CellViewFactory. It has
 * methods to make it easy to perform cut, copy and paste actions to make them
 * easy to perform. It adds several methods to make the handling of graph theory
 * easier. For example it has methods like addDefaultVertexAt(double, double) to
 * add a vertex at a custom position.
 *
 * It also provides a number of operation that can be performed on the graph.
 * The code for these operations is in the class GraphOperationHelper to make
 * this class simpler and more readable.
 *
 * The class replaces JGraph default graph model for JGraphT JGraphModelAdapter
 * Use the method getJGraphTGraph to get the JGraphT version of the current
 * graph in the editor.
 *
 * To make it possible for the GraphEditorPane to produce messages for the user
 * the constructor takes an object with the InformationPane interface to put
 * messages to. This is used by some operations.
 */
public class GraphEditorPane extends JGraph {

    private static final long serialVersionUID = 7610898466035692785L;
    private JGraphModelAdapter modelAdapter;
    /**
     * Insert mode is a mode where you can put out vertices just by clicking in
     * the graph area
     */
    private boolean insertMode = false;
    private GraphEditorUndoManager undoManager;
    private GraphProperties graphProperties = new GraphProperties();
    private List<GraphPropertiesChangeListener> graphPropertiesChangeListeners = new LinkedList<GraphPropertiesChangeListener>();
    private List<InsertModeChangeListener> insertModeListeners = new LinkedList<InsertModeChangeListener>();
    private Graph<Vertex, Edge> graph;
    private MouseAndMotionListener mouseListener;
    private MainWindow mainFrame;
    private InformationPane informationPane;
    private MessageProvider currentStatusMessageProvider =
            new MessageProvider("");
    private GraphOperationHelper graphOperationHelper;
    private GraphLayoutCache layoutCache;
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    /**
     * Returns the underlying JGraphT graph
     */
    public Graph getModelGraph() {
        return graph;
    }

    /**
     * Constructs a graph editor pane with an empty graph.
     *
     * @param mainFrame is the parent frame that contains this graph
     * @param informationPane is an information pane that is used by the graph
     * editor
     */
    public GraphEditorPane(MainWindow mainFrame, InformationPane informationPane) {
        super();

        logs.debug("Initializing GraphEditor Pane");
        this.informationPane = informationPane;
        informationPane.putMessage(currentStatusMessageProvider);
        graphOperationHelper = new GraphOperationHelper(this, informationPane);
        this.mainFrame = mainFrame;
        MouseListener ml = getMouseListeners()[0];
        MouseMotionListener mml = getMouseMotionListeners()[0];
        mouseListener = new MouseAndMotionListener(this, ml, mml);
        this.removeMouseListener(ml);
        this.removeMouseMotionListener(mml);
        this.addMouseListener(mouseListener);
        this.addMouseMotionListener(mouseListener);
        this.setDisconnectable(false);
        this.setPortsVisible(false);
        
        init();
        
        setGridProps();
        Color background = this.getBackground();
        Color marqueeColor = new Color(255 - background.getRed(), 255 - background.getGreen(), 255 - background.getBlue());
        this.setMarqueeColor(marqueeColor);            
    }

    /*
     * Check for saved state on server.
    */
    
    
    
    public void setGridProps() {
        GlobalProperties prop = GlobalProperties.getInstance();
        setGridEnabled(prop.isGridEnabled());
        setGridVisible((prop.isGridEnabled() ? prop.isGridVisable() : false));
        setGridMode(prop.getGridMode());
        setGridSize(prop.getGridSize());

    }

    /**
     * Initialize an empty graph. Sets necessary listeners etc for the graph to
     * behave accurate.
     *
     */
    private void init() {
        // create a JGraphT graph
        
        graph = new Graph<Vertex, Edge>(Edge.class);

        // create a visualization using JGraph, via an adapter
        modelAdapter = new JGraphModelAdapter<Vertex, Edge>(graph);

        layoutCache = new GraphLayoutCache(modelAdapter,
                new GraphEditorCellViewFactory());


        setGraphLayoutCache(layoutCache);

        this.setModel(modelAdapter);

        undoManager = new GraphEditorUndoManager(this);

        getModel().addUndoableEditListener(undoManager);
        this.setMarqueeHandler(new MarqueeHandler(this));
        this.removeKeyListener(this.getKeyListeners()[0]);
        this.addKeyListener(new KeyHandler(this));

        final Action statusUpdateAction = new AbstractAction() {
            public void actionPerformed(ActionEvent e) {
                // Show new graph information...

                if (!isReadyForOperation()) {
                    return;
                }

                Object[] vertexObjects = null;
                Object[] edgeObjects = null;
                try {
                    vertexObjects = getGraphLayoutCache().getCells(false, true,
                            false, false);
                    edgeObjects = getGraphLayoutCache().getCells(false, false,
                            false, true);
                } catch (NullPointerException ex) {
                    ex.printStackTrace();
                    return;
                }
                Object[] selectedVertexObjects = getSelectionCells(vertexObjects);
                Object[] selectedEdgeObjects = getSelectionCells(edgeObjects);
                int vertices = vertexObjects.length;
                int edges = edgeObjects.length;
                int selectedVertices = selectedVertexObjects.length;
                int selectedEdges = selectedEdgeObjects.length;

                /*
                 * Code changed by: Deepak Bhosale
                 *  Code removed to fix bug 1983
                 * Description: Removing message on status bar
                 */
                /*
                 currentStatusMessageProvider.setMessage("Nodes: " + vertices + ", Edges: " + edges
                 + ", Selected Nodes:  " + selectedVertices + ", Selected Edges: "
                 + selectedEdges);*/

            }
        };

        getModel().addGraphModelListener(new GraphModelListener() {
            public void graphChanged(GraphModelEvent e) {
                statusUpdateAction.actionPerformed(new ActionEvent(
                        "model changed", 0, "modelChange"));
            }
        });

        getSelectionModel().addGraphSelectionListener(
                new GraphSelectionListener() {
            public void valueChanged(GraphSelectionEvent e) {
                statusUpdateAction.actionPerformed(new ActionEvent(
                        "model changed", 0, "modelChange"));

            }
        });

    }

    /**
     * Adds a vertex at the specified position (x, y). Uses the GraphProperties
     * object for the graph to associate the vertex with the default properties
     *
     * Creates a VertexInformation object and sets it as the user object of the
     * vertex cell.
     *
     * @param x-coordinate
     * @param y-coordinate
     * @return
     */
    public DefaultGraphCell addDefaultVertexAt(double x, double y) {
        Vertex newVertex = new Vertex();
        newVertex.setVertexIndex(graph.getNextAvailableIndex());
        
        DefaultGraphCell vertexCell = new DefaultGraphCell(newVertex);
        newVertex.setJGraphVertex(vertexCell);
        vertexCell.setUserObject(newVertex);
        Map attrs = vertexCell.getAttributes();
        GraphConstants.setOpaque(attrs, false);
        GraphConstants.setSizeable(attrs, false);
        GraphConstants.setBorderColor(attrs, Color.black);
        GraphEditorConstants.setShape(attrs, getGraphProperties()
                .getDefaultInsertShape());

        GraphEditorConstants.setUseGraphBackground(attrs, getGraphProperties()
                .isDefaultUseGraphBackground());
        GraphEditorConstants.setBackground(attrs, getGraphProperties()
                .getDefaultVertexBackgroundColor());
        GraphEditorConstants.setForeground(attrs, getGraphProperties()
                .getDefaultVertexForegroundColor());

        Rectangle2D newBounds = new Rectangle2D.Double((x - 9) / getScale(),
                (y - 9) / getScale(), 120, 75);
        GraphConstants.setBounds(attrs, newBounds);
        DefaultPort port = new DefaultPort();

        vertexCell.add(port);
        port.setParent(vertexCell);
        getGraphLayoutCache().insert(vertexCell);

        return vertexCell;
    }

    /**
     * Adds a vertex cell from the information given in the vertex parameter
     *
     * @param vertex
     */
    public void addVertex(Vertex vertex) {

        DefaultGraphCell vertexCell = new DefaultGraphCell(vertex);
        vertex.setJGraphVertex(vertexCell);
        vertexCell.setUserObject(vertex);

        Map attrs = vertexCell.getAttributes();
        GraphConstants.setOpaque(attrs, true);
        GraphConstants.setSizeable(attrs, false);
        GraphConstants.setBorderColor(attrs, Color.black);
        GraphEditorConstants.setShape(attrs, vertex.getVertexType());
        GraphEditorConstants.setUseGraphBackground(attrs, vertex
                .isUseGraphBackround());
        GraphEditorConstants.setBackground(attrs, vertex.getBackgroundColor());
        GraphEditorConstants.setForeground(attrs, vertex.getForegroundColor());
        Rectangle2D newBounds = new Rectangle2D.Double(vertex.getXPosition(),
                vertex.getYPosition(), 120, 75);

        GraphConstants.setBounds(attrs, newBounds);
        GraphConstants.setVerticalTextPosition(attrs, SwingConstants.BOTTOM);
        DefaultPort port = new DefaultPort();
        vertexCell.add(port);
        port.setParent(vertexCell);

        getGraphLayoutCache().insert(vertexCell);

    }

    /**
     * The method sets the position on a vertex. It is based on the
     * JGraphAdapterDemo class in the JGraphT library.
     */
    private void positionVertexAt(Vertex vertex, double x, double y) {
        DefaultGraphCell cell = modelAdapter.getVertexCell(vertex);
        AttributeMap attr = cell.getAttributes();
        Rectangle2D newBounds = new Rectangle2D.Double(x, y, 18, 18);

        GraphConstants.setBounds(attr, newBounds);

        AttributeMap cellAttr = new AttributeMap();
        cellAttr.put(cell, attr);
        modelAdapter.edit(cellAttr, null, null, null);
    }

    /**
     * This method adds l to the list of InsertModeChangeListeners that listens
     * for Input mode change.
     */
    public void addInsertModeChangeListener(InsertModeChangeListener l) {
        insertModeListeners.add(l);
    }

    /**
     * Method to add our custom NodeEditor
     */
    public void updateUI() {
        setUI(new CellEditor());
        invalidate();
    }

    /**
     * @return the insertMode
     */
    public boolean isInsertMode() {
        return insertMode;
    }

    public GraphLayoutCache getLayoutCache() {
        return layoutCache;
    }

    /**
     * Insert an edge between the source and the target port.
     *
     * @param source
     * @param target
     */
    public DefaultEdge connect(Port source, Port target) {
        // Construct Edge with no label

        // TODO how to do support for multigraph
        if (source == target) {
            return null;
        }

        if (source instanceof DefaultPort) {
            DefaultPort defSourcePort = (DefaultPort) source;
            if (target instanceof DefaultPort) {
                DefaultPort defTargetPort = (DefaultPort) target;

                Set<Object> sourceEdges = defSourcePort.getEdges();
                for (Object edge : sourceEdges) {
                    if (edge instanceof DefaultEdge) {
                        DefaultEdge testEdge = (DefaultEdge) edge;
                        if (((testEdge.getSource() == source) && (testEdge
                                .getTarget() == target))
                                || ((testEdge.getSource() == target) && (testEdge
                                .getTarget() == source))) {

                            return null;
                        }

                    }
                }

            }
        }

        DefaultEdge edge = new DefaultEdge();

        if (getModel().acceptsSource(edge, source)
                && getModel().acceptsTarget(edge, target)) {
            /*
             * Creates edge attributes based on the edge information
             */
            edge.getAttributes().applyMap(createEdgeAttributes());
            // Insert the Edge and its Attributes
            getGraphLayoutCache().insertEdge(edge, source, target);
            // ((EdgeInformation)edge.getUserObject()).setJGraphEdge(edge);
            return edge;

        }
        return null;
    }

    public void insertEdge(Port source, Port target) {
        DefaultEdge edge = new DefaultEdge();
        edge.getAttributes().applyMap(createEdgeAttributes());
        getGraphLayoutCache().insertEdge(edge, source, target);
    }

    private Map createEdgeAttributes() {
        Map map = new Hashtable();
        // Add a Line End Attribute
        GraphConstants.setLabelAlongEdge(map, false);
        GraphConstants.setSelectable(map, false);
        // Add a label along edge attribute

        int arrow = GraphConstants.ARROW_CLASSIC;
        GraphConstants.setLineEnd(map, arrow);
        GraphConstants.setEndFill(map, true);

        return map;
    }

    /**
     * If vertices is selected then remove all selected verteces and edges and
     * all edges that is asociated with the selected edges. If only edges is
     * selected then remove all selected edges.
     *
     */
    public void removeSelected() {
        if (!isSelectionEmpty()) {
            Object[] cells = getSelectionCells();
            cells = getDescendants(cells);
            
            for(Object obj : cells){
                if(obj instanceof DefaultGraphCell){
                    
                    DefaultGraphCell cell = (DefaultGraphCell)obj;
                    Vertex v = (Vertex)cell.getUserObject();
                    if(v != null){
                        logs.debug("Removing  Vertex "+v.getName());
                        
                        for(Edge e : graph.outgoingEdgesOf(v)){
                            Vertex target = graph.getEdgeTarget(e);
                            logs.debug("Updating Target "+target.getName());
                            
                            target.setInputsStatus(Vertex.InputsStatus.UNDEFINED);
                            target.setCalculationsStatus(Vertex.CalculationsStatus.UNDEFINED);
                        }
                    }
                }
            }
            
            getGraphLayoutCache().remove(cells);
            
        }

    }

    /**
     * Undo the last registered undoable event on the graph
     */
    public void undo() {
        if (undoManager.canUndo()) {
            undoManager.undo();
        }
    }

    /**
     * Redo the last undid event on the graph
     */
    public void redo() {
        if (undoManager.canRedo()) {
            undoManager.redo();
        }

    }

    /**
     * Returns the JGraphModelAdapter used as model for this component
     */
    public JGraphModelAdapter<Vertex, Edge> getJGraphTModelAdapter() {
        return modelAdapter;
    }

    /**
     * Return true if the current graph has been changed
     *
     * @return the changed
     */
    public boolean isChanged() {
        /*
         * If its posible to undo then the graph is changed.
         */
        return undoManager.canUndo();
    }

    /**
     * Zoom in the graph the amunt that is specified in the
     * GlobalProperties.SCALE_INTERVALL constant.
     */
    public void zoomIn() {
        double scale = getScale() * (1.0 + GlobalProperties.SCALE_INTERVALL);
        this.setScale(scale);
        graphProperties.setZoomLevel(scale);
        graphProperties.fireChangedEvent();
    }

    /**
     * Zoom out the graph the amunt that is specified in the
     * GlobalProperties.SCALE_INTERVALL constant.
     *
     */
    public void zoomOut() {
        double scale = getScale() * (1.0 - GlobalProperties.SCALE_INTERVALL);
        this.setScale(scale);
        graphProperties.setZoomLevel(scale);
        graphProperties.fireChangedEvent();
    }

    /**
     * Sets to default zoom level. This means that the scale factor is set to
     * 1.0.
     */
    public void setDefaultZoomLevel() {
        if (getScale() != 1.0) {
            double scale = 1.0;
            this.setScale(scale);
            graphProperties.setZoomLevel(scale);
            graphProperties.fireChangedEvent();
        }

    }

    /**
     * This method returns the GraphProperties object for this graph component.
     *
     * @return the graphProperties
     */
    public GraphProperties getGraphProperties() {
        return graphProperties;
    }

    /**
     * Sets the GraphProperties to another. This is used when a graph is loaded
     * from a file.
     *
     * @param graphProperties the graphProperties to set
     */
    public void setGraphProperties(GraphProperties graphProperties) {
        this.graphProperties = graphProperties;
        for (GraphPropertiesChangeListener l : graphPropertiesChangeListeners) {
            l.graphPropertiesChanged();
        }
    }

    public void addGraphPropertiesChangeListener(GraphPropertiesChangeListener l) {
        graphPropertiesChangeListeners.add(l);
    }

    public void addUndoAndRedoAbleListener(UndoAndRedoAbleListener l) {
        undoManager.addUndoAndRedoAbleListener(l);

    }

    /**
     * Returns the center of the graph. That is the center of the bounding
     * rectangle of the graph
     *
     * @return
     */
    public Point2D.Double getGraphCenterPoint() {
        Object[] vertices = getGraphLayoutCache().getCells(false, true, false,
                false);
        Rectangle2D rec = getCellBounds(vertices);

        return new Point2D.Double(rec.getCenterX(), rec.getCenterY());
    }

    /**
     * @return the mainFrame
     */
    public MainWindow getMainFrame() {
        return mainFrame;
    }

    /**
     * Returns the graph cell that is the destination of the edge specified as a
     * parameter
     *
     * @param edge
     * @return
     */
    protected DefaultGraphCell getDest(DefaultEdge edge) {
        Object port = edge.getSource();
        if (port instanceof DefaultPort) {
            DefaultPort portIns = (DefaultPort) port;

            if (portIns.getRoot() instanceof DefaultGraphCell) {
                DefaultGraphCell destVertex = (DefaultGraphCell) portIns
                        .getRoot();
                return destVertex;
            }

        }
        return null;
    }

    /**
     * Returns the graph cell that is the source of the edge specified as
     *
     * @param edge
     * @return
     */
    protected DefaultGraphCell getSource(DefaultEdge edge) {
        Object port = edge.getTarget();
        if (port instanceof DefaultPort) {
            DefaultPort portIns = (DefaultPort) port;

            if (portIns.getRoot() instanceof DefaultGraphCell) {
                DefaultGraphCell destVertex = (DefaultGraphCell) portIns
                        .getRoot();
                return destVertex;
            }

        }
        return null;
    }

    /**
     * This returns false if an operation is pending so it isn't posible to
     * start a new one.
     *
     * @return
     */
    synchronized public boolean isReadyForOperation() {
        return graphOperationHelper.isReadyForOperation();
    }

    /**
     * Removes the selected edges and inserts verticesBetween vertices between
     * the vertices that is connected by the edge.
     *
     * @param verticesBetween
     */
    public void splitSelectedEdges(int verticesBetween) {
        graphOperationHelper.splitSelectedEdges(verticesBetween);
    }

    /**
     * Places the selected vertices in a circle.
     *
     */
    public void placeSelectedVerticesInCircle() {
        graphOperationHelper.placeSelectedVerticesInCircle();

    }

    /**
     * Mirror the selected vertices on a vertical axis
     *
     */
    public void mirrorSelectedVerticesVertical() {
        graphOperationHelper.mirrorSelectedVerticesVertical();

    }

    /**
     * Mirror the selcted vertices on a horizental axis
     */
    public void mirrorSelectedVerticesHorizontal() {
        graphOperationHelper.mirrorSelectedVerticesHorizontal();

    }

    /**
     * This method is used to tell the undo manager to igonore next undoable
     * edit
     *
     */
    void ignoreUndoableOnNextEdit() {
        undoManager.ignoreUndoableOnNextEdit();

    }

    public void expandByFactor(double factor) {
        graphOperationHelper.expandByFactor(factor);

    }

    @Override
    public void setBackground(Color bg) {
        super.setBackground(bg);
        Color background = bg;
        Color marqueeColor = new Color(255 - background.getRed(), 255 - background.getGreen(), 255 - background.getBlue());
        this.setMarqueeColor(marqueeColor);
    }

    public void resetModelGraph() {
        init();
    }
    
}
