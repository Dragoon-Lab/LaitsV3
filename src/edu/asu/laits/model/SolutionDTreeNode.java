/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.model;

import javax.swing.tree.DefaultMutableTreeNode;

/**
 *
 * @author ramayantiwari
 */
public class SolutionDTreeNode extends DefaultMutableTreeNode{
    String description;
    String nodeName;
    boolean isLeaf;
    
    public SolutionDTreeNode(String desc, String name, boolean leaf){
        super(desc);
        description = desc;
        nodeName = name;
        isLeaf = leaf;
    }
    
    public String getNodeName(){
        return nodeName;
    }
    
    public boolean isLeaf(){
        return isLeaf;
    }
    
    public String getNodeDescription(){
        return description;
    }
}
