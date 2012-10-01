
package edu.asu.laits.gui.toolbars;

import javax.swing.JToolBar;
import javax.swing.JButton;
import javax.swing.ImageIcon;

import edu.asu.laits.gui.menus.ViewMenu;
import javax.swing.Box;

/**
 * Tool bar with some quick buttons to do some view changes.
 */
public class ViewToolBar extends JToolBar {

	private JButton zoomInButton = null;
	private JButton zoomOutButton = null;
	private JButton standardZoomLevelButton = null;

	private ViewMenu viewMenu;

	/**
	 * This method initializes
	 * 
	 */
	public ViewToolBar(ViewMenu viewMenu) {
		super();
		this.viewMenu = viewMenu;
		initialize();
	}

	/**
	 * This method initializes this
	 * 
	 */
	private void initialize() {
		this.setName("View quickmenu");
		this.add(getZoomInButton());
                this.add(Box.createHorizontalStrut(3)); 
		this.add(getZoomOutButton());
                this.add(Box.createHorizontalStrut(3)); 
		this.add(getStandardZoomLevelButton());

	}

	/**
	 * This method initializes zoomInButton
	 * 
	 */
	private JButton getZoomInButton() {
		if (zoomInButton == null) {
			zoomInButton = new JButton();
			zoomInButton.addActionListener(viewMenu.getZoomInAction());
			zoomInButton.setIcon(new ImageIcon(getClass().getResource(
					"/resources/icons/16x16/viewmag+.png")));
                        zoomInButton.setToolTipText("Zoom In");
		}
		return zoomInButton;
	}

	/**
	 * This method initializes zoomOutButton
	 */
	private JButton getZoomOutButton() {
		if (zoomOutButton == null) {
			zoomOutButton = new JButton();
			zoomOutButton.setIcon(new ImageIcon(getClass().getResource(
					"/resources/icons/16x16/viewmag-.png")));
                        zoomOutButton.setToolTipText("Zoom Out");
			zoomOutButton.addActionListener(viewMenu.getZoomOutAction());
		}
		return zoomOutButton;
	}

	/**
	 * This method initializes standardZoomLevelButton
	 */
	private JButton getStandardZoomLevelButton() {
		if (standardZoomLevelButton == null) {
			standardZoomLevelButton = new JButton();
			standardZoomLevelButton.setIcon(new ImageIcon(getClass()
					.getResource(
							"/resources/icons/16x16/viewmag1.png")));
                        standardZoomLevelButton.setToolTipText("Set Standard Zoom");
			standardZoomLevelButton.addActionListener(viewMenu
					.getDefaultZommLevelAction());
		}
		return standardZoomLevelButton;
	}

}
