## Author History View ##
The author history view will allow users to view a list of previous sessions for a given problem and either view the model or continue authoring from the session of their choice.

This window will solve the problem of editing sessions out of order, resulting in previous work being buried.  Here is an example of the problem.

1) Professor Alice begins authoring a problem at her office.  She leaves the problem open while she goes to consult a content expert.  At the meeting, the expert says they can give her the correct values for some of the nodes in her model, so she opens the problem a second time on her laptop.  The problem appears just as she left it at her office.  She edits the existing nodes and then closes the tab.  So far so good.

2) As she returns to her office, she decides she'd like to add more nodes to that model.  She resumes working from the original window, still open in her office.  She adds the new nodes.  However, the version on her desktop still had the old incorrect values!

3) She tries opening the problem again, but it still looks the same--new nodes and old values.  She has to call the Dragoon lab to have them extract her old values from the database for her (or pester the content expert again).

Here is the new version of part 3 with the history feature:

3) She tries opening the problem again, but it still looks the same--new nodes and old values.  She realizes the numbers she wanted aren't there, so she opens the author history view.  A window appears listing her previous sessions, sorted by last active time.  She finds the one from her meeting with the content expert and chooses the "view only" option.  She opens the nodes to find the values given to her by the content expert, and then copies them into her new model.

## Specifications ##

### Version 1 ###
For version 1 the author will be able to:

1. View a table of sessions for a given problem in a given group, including:
  -Sessions's Username
  -Last edited/closed time
2. Select a session and open it for non-desctructive viewing
  -They might be able to make changes, but they won't be saved
3. Select a session and opening it for editin (effectively making it the current latest version).
  -This should probably close the current session (i.e. open in the same tab)?
  -The user name should be the same as the current author, not the old one (if different)

### Wishlist for future versions ###
* Add columns which show some descriptive information, e.g. number of nodes or last edited node name.
* Add the ability to import nodes from a revision
* Add the ability to export a revision to json (this might not need to be part of this window actually)

