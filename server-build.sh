#!/bin/bash

if [ "$1" == --help ]; then
        echo Usage: $0 '<'version-number'> <'folder-name'>'

else
    rm -rf $1
    echo unzipping...
    mkdir $1

    unzip -oq $1'.zip' -d $1
    rm -rf $2/
    mv $1/ $2/
    echo setting up symlinks...
    ln -s ../../../demo/www/problems ./$2/www/problems
    ln -s ../../../demo/www/images ./$2/www/images
    echo copying db_user_password
    cp ../demo/db_user_password ./$2/db_user_password
fi