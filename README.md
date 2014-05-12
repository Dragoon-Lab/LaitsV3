## Dragoon documentation ##

The [Dragoon website](http://dragoon.asu.edu) includes
background information, access to the tutor system and a
tutorial to get you started using dragoon.

[Documentation and design documents](documentation/README.md) are
available.

## Dragoon Install ##

This document contains instructions for setting up a dragoon server.
These instructions are for the Javascript version of Dragoon.

### Database Setup ###

Create the database using the script `create-database.sql`.
In the project root directory, create a file `db_user_passsword`
containing three lines containing the username, password, and 
database name.

### Install Libraries ###

In the root directory, enter `make install` to install the Javascript
libraries.

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
