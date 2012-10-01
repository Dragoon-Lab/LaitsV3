
package edu.asu.laits.editor;

/**
 * An interface that represents an information pane that has a message stack.
 * The first message is displayed ant it is possible to put and pop message
 * providers which is a holder for messages that can change
 * 
 * @author kjellw
 * 
 */
public interface InformationPane {

	public void putMessage(MessageProvider message);

	public void popMessage();

}
