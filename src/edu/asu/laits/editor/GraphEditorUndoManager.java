/*
 * Copyright (C) 2007  Kjell Winblad (kjellwinblad@gmail.com)
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package edu.asu.laits.editor;

import java.util.LinkedList;
import java.util.List;

import javax.swing.undo.UndoableEdit;

import edu.asu.laits.editor.listeners.UndoAndRedoAbleListener;
import org.jgraph.graph.GraphUndoManager;

/**
 * This is an undo manager for the graph editor. It extends GraphUndoManager and
 * overides the addEdit, undo and redo methods and calls the fireChangedEvent()
 * in the owned GraphPanes GraphProperties object to indicate that the graph has
 * been changed.
 * 
 * It is allso possible to add undoRedoAble listeners that is called if the
 * status of if the graph has any undoable operation to undo or undoable
 * operations to redo.
 * 
 * @author kjellw
 * 
 */
public class GraphEditorUndoManager extends GraphUndoManager {
	private GraphEditorPane graphPane;

	private List<UndoAndRedoAbleListener> undoAndRedoAbleListeners = new LinkedList<UndoAndRedoAbleListener>();

	private boolean ignoreUndoableOnNextEdit = false;

	public GraphEditorUndoManager(GraphEditorPane graphPane) {
		super();
		this.graphPane = graphPane;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.jgraph.graph.GraphUndoManager#redo(java.lang.Object)
	 */
	@Override
	public void redo() {
		super.redo();

		graphPane.getGraphProperties().fireChangedEvent();

		for (UndoAndRedoAbleListener l : undoAndRedoAbleListeners) {

			if (canRedo())
				l.canRedo();
			else
				l.canNotRedo();

			if (canUndo())
				l.canUndo();
			else
				l.canNotUndo();

		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.jgraph.graph.GraphUndoManager#undo(java.lang.Object)
	 */
	@Override
	public void undo() {
		super.undo();

		graphPane.getGraphProperties().fireChangedEvent();

		for (UndoAndRedoAbleListener l : undoAndRedoAbleListeners) {

			if (canRedo())
				l.canRedo();
			else
				l.canNotRedo();

			if (canUndo())
				l.canUndo();
			else
				l.canNotUndo();
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see javax.swing.undo.UndoManager#addEdit(javax.swing.undo.UndoableEdit)
	 */
	@Override
	public synchronized boolean addEdit(UndoableEdit anEdit) {
		if (ignoreUndoableOnNextEdit) {
			ignoreUndoableOnNextEdit = false;
			return false;
		}
		graphPane.getGraphProperties().fireChangedEvent();
		boolean result = super.addEdit(anEdit);
		
		for (UndoAndRedoAbleListener l : undoAndRedoAbleListeners) {
			l.canUndo();

			if (canRedo())
				l.canRedo();
			else
				l.canNotRedo();
		}
		
		return result;

	}

	public void addUndoAndRedoAbleListener(UndoAndRedoAbleListener l) {
		undoAndRedoAbleListeners.add(l);
		if (canRedo())
			l.canRedo();
		else
			l.canNotRedo();

		if (canUndo())
			l.canUndo();
		else
			l.canNotUndo();
	}

	public void ignoreUndoableOnNextEdit() {
		this.ignoreUndoableOnNextEdit = true;

	}

}
