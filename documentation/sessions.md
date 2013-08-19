# Sessions #

First, some definitions.  We distinguish between two usage modes:

* __student__ which includes [major modes](major-modes.md) COACHED, STUDENT, and TEST.
In this usage mode, a user modifies only the student graph.
* __author__ which corresponds to the AUTHOR major mode.  In this mode,
a user modifies only the solution graph.

Along with this, we distinguish between the LMS and the tutor:

* __tutor__ is the Java code for Dragoon/Laits.  It is invoked
via JNLP or a java command if it is being run locally.  On startup, 
the tutor is given the user name, section, problem
name, and major mode.
*  __LMS__ or Learning Management System refers to the "outer loop" that
invokes the tutor system for a particular user, group, and problem. 
It could be a full LMS like Moodle, or a simple web page like 
[More problems](http://dragoon.asu.edu/demo/public-login.html).
If the tutor is being run locally, then this would be a script to invoke
the tutor (aside from Netbeans, this doesn't exist yet).

Also, there are two classes of problem solution graphs:

* __published__ or __static__ problems provided by the tutoring system.  
These are stored as files in `www/problems/`  They are available to all users
(no section restrictions), and one can assume that the LMS has a list of
these problems.  Students select published problems only via the LMS. 
If the tutor is being run locally, these problems are 
stored along side the java code (this doesn't exist yet).

* __custom__ or __dynamic__ problems are authored
by users.  On the server, the solutions are stored in the `solutions` table.  
Problems are marked by author name, section, problem name, and a "share" bit.   
If the tutor is run locally, these would be stored
in a location on the file system, tagged only by the problem name (doesn't
exist yet).

    The share bit determines whether a custom problem can be viewed,
in either author or student mode, by other members of a section. 
If `false`, then only the author may view the problem.  If `true`, then
all students in a section may view that problem.  Custom problems cannot
be viewed by users outside of a section.

## Solution graph Storage for custom problems ##

Currently, in author mode, the user can explicitly save a problem solution graph
on the local machine via a menu selection.  Any sharing with other students
is done outside the system.  There is no autosave.

Custom problem solution graphs are stored in the `solutions` table.
To retrieve custom problems, the script `task_fetcher.php`
looks for a matching problem in the solutions table, then attempts
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

Neither the LMS nor the tutor has any way to determine which custom problems
are available to a given student.  We need to write a server script which, 
given the student's user name and
section, provides a list (in xml or json format) of the custom problems
that may be read by that student.  The script returns a list of 
user name, problem name pairs.

Either the LMS or the tutor itself can request this list.
Note that the response includes a list of all problems that the
user has previously worked on, either as a student or as an author.

There are two possible mechanisms for students to select a custom
problem:  (I am not sure which we should implement.)

* __In the LMS__  In this case, the LMS presents the student with a list
of available problems, the student selects one or more problems.
A list of author name, problem name pairs is sent to the tutor.

* __In the tutor__ If the tutor is not supplied with a problem name
(or an empty problem name) when it is invoked, then the tutor retrieves
a list of available problems from the server and the list of
problems is shown to the user.

In either case, the student 

## Student Mode ##

In this mode the user only modifies the student model. The student may:

* Select a single published problem in the LMS.  If a problem with the same
  name exists in the custom problems, that is opened instead.   Any work they 
 do is saved as a custom problem with the same name. (This is 
  the current behavior).

* Select a single custom problem in the LMS.  If they are not the author,
  the any work the student does is saved as a custom problem with the same
  problem name.  We would have to modify our script slightly to do this.)

## Author Mode ##

[Some notes from Kurt](Dragoon_model_storage_use_cases_13_08_12.docx) on 
session storage, especially for local disk.



