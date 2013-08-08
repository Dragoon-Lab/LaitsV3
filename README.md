# Dragoon Install #

## Database Setup ##

Create the database using the script create-database.sql.
In the project root directory, create a file db_user_passsword
containing three lines containing the username, password, and 
database name.

## Command Line ##

To run Dragoon locally, need to supply command line arguments.
Requires command line arguments in to run locally.  To set up command
line arguments in NetBeans, right-click the project, select
"Configuration" > "Customize", select the "Run" category, and enter
into the "Arguments" line in this format:

>username mode problemid

Mode can be:  `STUDENT`, `COACHED`, or `AUTHOR`.  Problemid
is the problem name you wish to run.  Example command line argument:

    developer1 STUDENT 105

See subdirectory `www/problems` for a list of valid problems.
Also, the "VM Options" line can be used to specify
the server and the section.

The server currently defaults to `http://dragoon.asu.edu/demo`. This can be 
changed by entering the following into the "VM Options" line:

    -Djnlp.server=http://dragoon.asu.edu/devel

The section (group) currently defaults to `login.html`. This can be 
changed by entering the following into the "VM Options" line (replace
"SectionName" with your section):

    -Djnlp.section=SectionName

Note that the "VM Options" line can receive multiple instructions.

## Run on local server ##

This section describes how to set up Dragoon to run off the 
local server on OS X 10.8 (mountain lion).
    sudo apachectl start
    cd /Library/WebServer/Documents/
    sudo ln -s /Users/bvds/NetBeansProjects/laits/www/ ./laits # try http//localhost/laits/
    sudo nano /etc/apache2/httpd.conf  || uncomment php line
    sudo apachectl restart
    echo "<?php phpinfo(); ?>" > ~/NetBeansProjects/laits/www/index.php  
    # try http://localhost/laits/index.php on Browser
More information on [starting php and Apache on OS X](http://coolestguyplanettech.com/downtown/install-and-configure-apache-mysql-php-and-phpmyadmin-osx-108-mountain-lion).


## Ivy Installation Instructions ##

1. Go to (https://code.google.com/p/ivybeans/downloads/list)

2. Download ivybeans zip file for your netbeans version.  (e.g. for
netbeans 7.1 you will download `ivybeans-1.2-nb71.zip`)

3. Unzip it. You will get 2 files: `com-googlecode-ivybeans-libs.nbm` &
`com-googlecode-ivybeans-module.nbm`

4. In NetBeans go to Tools -> plugins -> downloaded tab -> add plugin ->
 install these 2 files.  Restart the netbeans IDE.  

5. Right click on the project -> properties -> check enable ivy. Then
 point the "ivy file" and the "settings file" to the files `ivy.xml` &
 `ivysettings.xml` in the project root directory.

6. In the third line of `ivy.xml`, set the module and organisation to be
the name of your netbeans project.

7. There is a [bug in ivy](https://code.google.com/p/ivybeans/issues/detail?id=58). Here is a
workaround: right click project -> properties -> build -> compiling ->
uncheck "compile on save" option.
