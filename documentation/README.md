# Documentation for Dragoon #

## Architecture ##

We are using:

* The [Dojo](http://dojotoolkit.org) framework.
* A [fork of jsPlumb](https://github.com/bhosaledipak/JsPlumb_Dojo_Integreate)
  that uses AMD and Dojo.
* A [fork of js-expression-eval](https://github.com/bvds/js-expression-eval) 
 that uses AMD and can accept variable names with spaces.

Here are the major components of the design:

* [Session behavior](sessions.md) which discusses saving, modifying,
  and sharing problems.  It also describes the database tables.
* [Major modes](major-modes.md) (STUDENT COACHED TEST AUTHOR)
* [Graph (nodes and connectors)](graph.md)
* [Node Editor](node-editor.md)
* [Module Dependencies](dependency_graph.html)
* [Model object (JSON format)](json-format.md)
* [Forum](forum.md)
* Kurt's design for the [Pedagogical Module](Pedagogical-Module.docx)
  as well as [Sachin's version](Pedagogical-Module-JavaScript-Version-2.docx)
* [Logging format](logs-structure.md)
* [Saving State](state.md)


## Code Review process ##

We use a "[Shared Repository Model](https://help.github.com/articles/using-pull-requests#shared-repository-model)."
The basic idea is that everyone works on their own branch.  When a developer
wants something merged onto the master branch, they push their branch onto
github and start a "pull request" (or send an email).

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

It is a good practice to merge `origin/master` onto your branch every
time you start working.  This will reduce conflicts when you 
try to merge your code back onto the master branch.


## Install this Documentation ##

Place a link to the `documentation` directory in your webserver root directory. 
For the sever to properly translate the markdown, download a 
[markdown handler](https://github.com/alue/markdown-handler), 
edit the path in the provided `.htaccess` file, and install the files your 
web-server root directory.
Also, modify the path to the style file in `markdown/handler.php`.
Finally, you may need to activate `AllowOverride` in your Apache configuration file.
