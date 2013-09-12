# Documentation for Dragoon #

This contains mostly design documents.  

* [Node Editor](node-editor.md) with tabs:  Description, Plan, and Calculation
* [Session behavior](sessions.md) which discusses saving, modifying, and sharing problems.
* [Add sliders to parameters](sliders.md)
* [Major modes](major-modes.md) (STUDENT COACHED TEST AUTHOR)
* [Problem and node-specific forum](Forum_Feature_in_Dragoon.docx).  Document written by Ram
  with comments by BvdS.

Documentation can be in any convenient format (word, html, *et cetera*) with generic 
[markdown](http://en.wikipedia.org/wiki/Markdown) being the default choice.  Any
document should have an associated link in this file.  

## Code Review process ##

We use a "[Shared Repository Model](https://help.github.com/articles/using-pull-requests#shared-repository-model)."
The basic idea is that everyone works on their own branch.  When they
want something merged onto the master branch, they start a "pull
request."

Our policy is that code is merged onto the master branch once it has
been reviewed by at least one other person on the team. We will do any
further coordination via the daily stand-up meetings.  If you have
a code revision that is "minor," such as a bug fix in a specific problem
xml, or a change to the documentation, then you can make the change
directly on the master branch.

You are not stuck using "your" branch for this purpose. It might be
expedient to make topic-specific branches, such as "node-editor" to
hold your changes. So feel free to create additional branches, if you
feel the need.

## Install Documentation ##

Place a link to the `documentation` directory in your webserver root directory. 
For the sever to properly translate the markdown, download a 
[markdown handler](https://github.com/alue/markdown-handler), 
edit the path in the provided `.htaccess` file, and install the files your the web 
server root directory.
Also, modify the path to the style file in `markdown/handler.php`.
Finally, you may need to activate `AllowOverride` in your Apache configuration file.
