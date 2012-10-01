package edu.asu.laits.properties;

import java.awt.Component;

/**
 * A module that contains functionality to modify settings for something. It
 * has a method to save the changes and a method to get an editor component for
 * the properties etc.
 */
public interface PropertiesModule {
	/**
	 * Saves the settings to the properties
	 */
	public void save();

	public Component getPropertiesEditor();

	public String getPropertiesName();

	public String getPropertiesDescription();

}
