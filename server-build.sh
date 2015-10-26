#!/bin/bash

if [ "$1" == --help ]; then
	echo Usage: $0 [version-number] [folder-name]

else
    sudo rm -rf $1
    echo unzipping...
    sudo mkdir $1
    sudo unzip -o -q $1'.zip' -d $1
    sudo rm -rf $2/
    sudo mv $1/ $2/

    sudo ln -s ../../../www/problems ./$2/www/problems
    sudo ln -s ../../../www/images ./$2/www/images

    sudo cp ../db_user_password ./$2/db_user_password
fi