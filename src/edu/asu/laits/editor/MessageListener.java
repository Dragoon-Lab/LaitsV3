package edu.asu.laits.editor;

import java.awt.Color;

/**
 * This listener interface can be added to a MessageProvider to listen for
 * messages that is set for the provider.
 */
public interface MessageListener {

    public void messageChanged(String message);

    public void colorChanged(Color specialColor);
}
