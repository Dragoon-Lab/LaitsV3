LaitsV3
=======

Database Setup:

Create the database using the script create-database.sql.
In the project root directory, create a file db_user_passsword
containing three lines containing the username, password, and 
database name.

Version 3 of LAITS Project with jGraph

Requires command line arguments in to run locally.  To set up command
line arguments in NetBeans, right-click the project, select
"Configuration" > "Customize", select the "Run" category, and enter
into the Arguments line in this format:

username mode problemid

Currently accepted modes are STUDENT, COACHED and AUTHOR.  Problemid
is the problem number you wish to run.  Example command line argument:

developer1 STUDENT 105

Currently valid problem ids for STUDENT: 74, 79, 80, 92 - 102, 105
-115, 201 - 205

Current problem ids for COACHED: 1005, 1006, 1007, 1008

Also in the "Run" category the "VM Options" line can be used to specify
the server and the section.

The server currently defaults to "http://dragoon.asu.edu/demo". This can be 
changed by entering the following into the "VM Options" line:

-Djnlp.server=http://dragoon.asu.edu/devel

The section (group) currently defaults to "login.html". This can be 
changed by entering the following into the "VM Options" line (replace
"SectionName" with your section):

-Djnlp.section=SectionName

Note that the "VM Options" line can receive multiple instructions.



Ivy Installation Instructions

-----------------------------------

1. Go to https://code.google.com/p/ivybeans/downloads/list

2. Download ivybeans zip file for your netbeans version.  (e.g. for
netbeans 7.1 you will download ivybeans-1.2-nb71.zip)

3. Unzip it. You will get 2 files : com-googlecode-ivybeans-libs.nbm &
com-googlecode-ivybeans-module.nbm

4. In NetBeans go to Tools -> plugins -> downloaded tab -> add plugin ->
 install these 2 files.  Restart the netbeans IDE.  

5. Right click on the project -> properties -> check enable ivy. Then
 point the "ivy file" and the "settings file" to the files ivy.xml &
 ivysettings.xml in the project root directory.

6.  In the third line of ivy.xml, set the module and organisation to be
the name of your netbeans project.

7.  There is a bug in ivy
(https://code.google.com/p/ivybeans/issues/detail?id=58) Here is a
workaround: right click project -> properties -> build -> compiling ->
uncheck "compile on save" option.
