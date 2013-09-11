## Dragoon documentation ##

The [Dragoon website](http://dragoon.asu.edu) includes
background information, access to the tutor system and a
tutorial to get you started using dragoon.

[Documentation and design documents](documentation/README.md) are
available.

## Dragoon Install ##

Instructions for setting up a dragoon server and for
setting up a development environment for dragoon.  We use
Netbeans for java code development, but none of the code
is Netbean-specific.

### Database Setup ###

Create the database using the script `create-database.sql`.
In the project root directory, create a file `db_user_passsword`
containing three lines containing the username, password, and 
database name.


### Command Line arguements ###

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


### Libraries via Ivy ###

Need to add any jar files in `lib` directory as libraries in project.
These are libraries that have not been integrated into Ivy.

Install Ivy:

1. Go to https://code.google.com/p/ivybeans/downloads/list

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


### Build the project using Ant ###

1.   Download apache ant  
	http://ant.apache.org/bindownload.cgi

2.	set ANT\_HOME and JAVA\_HOME environment variables on the system. If these are not present in the environment variables, create new environment variables with these names.  
e.g. :  
ANT_HOME : C:\apache-ant-1.9.2  
JAVA_HOME : C:\Program Files\Java\jdk1.7.0_03

3.	Add bin directories to 'path' user environment variable.  
e.g. : add  ;C:\apache-ant-1.9.2\bin;C:\Program Files\Java\jdk1.7.0_03\bin  
If the 'path' variable is not already present in the user environment variables then create a new one with name 'path' and value as paths to the bin folders.  
e.g. : C:\apache-ant-1.9.2\bin;C:\Program Files\Java\jdk1.7.0_03\bin

4.	download apache ivy  
	http://ant.apache.org/ivy/download.cgi  
copy the jar file(ivy-2.3.0.jar) inside the downloaded folder into the lib directory of your Ant download.

5.	Download apache contrib :  	http://sourceforge.net/projects/ant-contrib/files/ant-contrib/ant-contrib-0.3/  
download the bin.zip folder  
copy the ant-contrib-0.3.jar inside downloaded folder to the lib directory of your Ant download.

6.	For usage through command-line :  
open terminal  
go to project directory. ==> e.g. : C:\laitsv3  
run following commands in the same order :  
ant compile  
ant jar  
ant unsign  
cd www  
>java -jar Laits.jar username mode problemid


### Run on local server ###

This section describes how to set up Dragoon to run off the 
local server on OS X 10.8 (mountain lion).

    sudo apachectl start
    cd /Library/WebServer/Documents/
    sudo ln -s /Users/bvds/NetBeansProjects/laits/www/ ./laits 
    # try http://localhost/laits/ in your web browser
    sudo nano /etc/apache2/httpd.conf  || uncomment php line
    sudo apachectl restart
    echo "<?php phpinfo(); ?>" > ~/NetBeansProjects/laits/www/index.php  
    # try http://localhost/laits/index.php on Browser

More information on [starting php and Apache on OS X](http://coolestguyplanettech.com/downtown/install-and-configure-apache-mysql-php-and-phpmyadmin-osx-108-mountain-lion).
