## Dragoon documentation ##

The [Dragoon website](http://dragoon.asu.edu) includes
background information, access to the tutor system and a
tutorial to get you started using dragoon.

[Documentation and design documents](documentation/README.md) are
available.

## Dragoon Install and Netbeans ##

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
    sudo ln -s ~/laits/www/ ./laits 
    # try http://localhost/laits/ in your web browser
    sudo nano /etc/apache2/httpd.conf  || uncomment php line
    sudo apachectl restart
    echo "<?php phpinfo(); ?>" > ~/laits/www/index.php  
    # try http://localhost/laits/index.html on Browser

More information on [starting php and Apache on OS X](http://coolestguyplanettech.com/downtown/install-and-configure-apache-mysql-php-and-phpmyadmin-osx-108-mountain-lion).
