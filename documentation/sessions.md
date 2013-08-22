# Sessions #

First, some definitions.  We distinguish between two usage modes:

* __student__ which includes [major modes](major-modes.md) COACHED, STUDENT, and TEST.
In this usage mode, a user modifies only the student graph.
* __author__ which corresponds to the AUTHOR major mode.  In this mode,
a user modifies only the solution graph.

Along with this, we distinguish between the LMS and the tutor:

* __tutor__ is the Java code for Dragoon/Laits.  It is invoked
via JNLP or a java command if it is being run locally.  On startup, 
the tutor is given the major mode, user name, section, problem
name, and (optionally) the problem author. 
*  __LMS__ or Learning Management System refers to the "outer loop" that
invokes the tutor system for a particular user, group, and problem. 
It could be a full LMS like Moodle, or a simple web page like 
[More problems](http://dragoon.asu.edu/demo/public-login.html).
If the tutor is being run locally, then this would be a script to invoke
the tutor (aside from Netbeans, this doesn't exist yet).

Also, there are two classes of problem solution graphs:

* __published__ or __static__ problems provided by the tutoring system.  
These are stored as files in `www/problems/` and are uniquely identified by
their name.  They are available to all users
(no section restrictions), and one can assume that the LMS has a list of
these problems.  Students select published problems via the LMS. 
If the tutor is being run locally, these problems are 
stored along side the java code (this doesn't exist yet).

* __custom__ or __dynamic__ problems are authored
by users.  If the tutor is run locally, these would be stored
in a location on the file system, tagged only by the problem name (doesn't
exist yet).

## Open and Managed access modes ##

[Some notes from Kurt](Dragoon_model_storage_use_cases_13_08_12.docx) on 
session management.  In this design, all custom problem solutions
are stored on the student's computer. The only *functionality* missing
in the following specification is the case where a student needs to share their 
solution to a problem solved in student mode ("Open access mode," first use case).

## Database tables ##

* `autosave_table` stored student work on a problem.  This table
has columns for user name, section, problem name, time stamp, the graph xml
(text format), and the author name (default, empty string). 
For published problems, the author name is an empty string.  The primary key 
for the table should consist of:  section, user name, problem name, and author name.
It is important that section is listed first.

* `solutions` table stores solution graphs for custom problems.
This table has columns for author name, section, problem name, and a "share" bit
(default zero), a timestamp and the problem xml (text). The primary key for the table 
should consist of: 
 section, problem name, and author name.  It is important that section is
listed first.

    The share bit determines whether a custom problem can be viewed --
in either author or student mode -- by other members of a section. 
If `false`, then only the author may view the problem.  If `true`, then
all students in a section may view that problem.  Custom problems cannot
be viewed by users outside of a section.

## Access to the Solution graph custom problems ##

Currently, in author mode, the user can explicitly save a problem solution graph
on the local machine via a menu selection.  Any sharing with other students
is done outside the system.  There is no autosave.

To retrieve custom problems, the script `task_fetcher.php`
looks for a matching problem in the `solutions` table, then attempts
to find a matching published problem. 
Calls to `task_fetcher.php` use the GET method and must include a problem name, and may
include an author name and section name.  Author name and section are
mandatory for a match to a custom problem.

The script `save_solution.php` is invoked with POST and must include problem name,
author name, section name, and the solution graph xml (text).  It may also
set the "share" bit.  It *may* overwrite any existing entry with matching author,
section, and problem.

If the user is in author mode, `save_solution.php` is called at all instances
where the `autosave.php` is invoked in student mode.

## Custom Problem Selection ##

The server script `available_problems.php` retrieves all problems available
to the student in the form of author, problem name pairs (in xml or json format).  
It it called using the GET method with the user name and section supplied.

Either the LMS or the tutor itself can request this list.
Note that the response includes a list of all problems that the
user has previously worked on, either as a student or as an author.

In the LMS, the student may be supplied with a list of 
available custom problems via a call to `available_problems.php`.  
The student may choose one of
the existing problems, or, if they are in author mode, they
may choose a new problem name.

## Student Mode ##

In this mode the user only modifies the student model.   This mode
is pretty restrictive: the student may not rename a problem or merge other
solutions with their solution or share their solution with other students.

If the student wants to "start over" on a problem, they may erase
all their current work on that problem.  For convenience, we may provide
a button in the tutor for this purpose.  For instance, the tutor could prompt
the student when a problem is opened.

## Author Mode ##

In author mode, the tutor provides a menu where a student may
**merge** an existing solution with their solution.  The solutions
are provided by the `available_problems.php`.  Also, the tutor UI
has a switch that allows the user to change the share bit.

The mechanism for "forking" an existing problem is, in the LMS, for the student
to new problem name.  This opens a new empty problem.  They then use the **merge**
menu to load the existing problem of interest.  This creates a copy of
an existing problem with a new name.

Finally, the tutor needs a method for allowing the author to
create the "predefined" nodes for a problem.




