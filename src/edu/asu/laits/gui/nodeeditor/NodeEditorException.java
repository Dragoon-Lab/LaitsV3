/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.asu.laits.gui.nodeeditor;


/**
 *
 * @author ramayant
 */
public class NodeEditorException extends Exception{

  public NodeEditorException(){
    super();
    errorMessage = "Unknown";
  }

  public NodeEditorException(String err){
    super(err);
    errorMessage = err;
  }

  public NodeEditorException(String err, Throwable cause){
    super(err, cause);
    errorMessage = err;
  }

  public String getMessage(){
    return errorMessage;
  }

  private String errorMessage;
}
