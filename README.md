## Dragoon documentation ##

The [Dragoon website](http://dragoon.asu.edu) includes
background information, access to the tutor system and a
tutorial to get you started using Dragoon.

[Documentation and design documents](documentation/README.md) are
available.

## Dragoon Install ##

This document contains instructions for setting up a Dragoon server.
These instructions are for the JavaScript version of Dragoon.

### Database Setup ###

Create the database using the script `create-database.sql`.  First enter mysql as root:

    $ mysql -u root -p
When prompted, enter the root password you created for mysql, not the root password for your machine.  Then create your new database and run the script. Two scripts are available in the same folder.  You can use the following commands:

    mysql> create database <your database name>;
    mysql> use <your database name>;
    mysql> source create-database.sql;
	mysql> source create-schema-database.sql;

In the project root directory, create a file `db_user_passsword`
containing three lines containing the username, password, and 
database name.

On Windows, you'll need to install WAMP, XAMPP or another AMP kit first.

### Install Libraries ###

In the root directory, enter `make install` to install the Javascript
libraries.

Windows doesn't come with make, but if you google "make for windows" you can download it from gnu.  After installing, either add make's path to your PATH variable or give the full path in the command line.  For best results, run within the powershell provided by GitHub for Windows.

### Run on local server ###

This section describes how to set up Dragoon to run off the 
local server on OS X 10.8 (mountain lion).

    sudo apachectl start
    cd /Library/WebServer/Documents/
    sudo ln -s <*path to Dragoon*>/www/ ./laits 
    # try http://localhost/laits/ in your web browser
    sudo nano /etc/apache2/httpd.conf  || uncomment php line
    sudo apachectl restart
    echo "<?php phpinfo(); ?>" > <*path to Dragoon*>/www/php-test.php 
    # try http://localhost/laits/php-test.php on Browser
	# PHP looks for the MySQL sock in the wrong place.
	# Make a link so that PHP will find the sock file:
	sudo mkdir /var/mysql
	sudo ln -s /tmp/mysql.sock /var/mysql/mysql.sock

More information on [starting php and Apache on OS X](http://akrabat.com/computing/setting-up-php-mysql-on-os-x-10-8-mountain-lion).

In order to give the apache server permisions to access the folder containing the dragoon librarys you must change the folder to a sharded folder and allow access to directory from the apache config

To change the folder to a sharded folder, simply right click (or control click) select get info, and then check the box that says "Shared folder"

Go into the config file

    sudo nano /etc/apache2/httpd.conf
    
Find the default directory settings and change them so they look like the following

    <Directory />
        Options +Indexes FollowSymLinks +ExecCGI
        AllowOverride AuthConfig FileInfo
        Order allow, deny
        Allow from all
    </Directory>
    
Afterwards reset the server

    sudo apachectl restart

## Testing Dragoon ##

More information about testing and installation of testing can be found in the [Readme in test folder](tests/README.md)
