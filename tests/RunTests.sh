#!/bin/bash
if [ "$1" == --help ]; then
	echo Usage: $0 [test-path]
	echo Note: test-path can be either a directory or a single file
else
	java -jar selenium-server-standalone-2.46.0.jar -log selenium.log &
	echo "Waiting 5 seconds for selenium server to start.: "
	printf "5..."
	sleep 1
	printf "4..."
	sleep 1
	printf "3..."
	sleep 1
	printf "2..."
	sleep 1
	printf "1..."
	sleep 1
	printf "Engage!\n"
	if [ "$1" != "" ]; then # run the script(s) in path given	
		mocha $1 -t 30000
	else # run all the core and bug tests
		mocha scripts/coreTests -t 30000
		mocha scripts/bugTests -t 30000
	fi
	echo Shutting down selenium server...
	curl localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer
	echo
fi