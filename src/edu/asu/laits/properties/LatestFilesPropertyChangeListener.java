package edu.asu.laits.properties;

import java.io.File;

/**
 * A listener that can be added to GlobalProperties to listen for opening of new
 * files. This is to update the latest file menu in the file menu.
 */
public interface LatestFilesPropertyChangeListener {

	void newFileOpened(File file);
}
