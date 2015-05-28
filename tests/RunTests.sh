#!/bin/bash
java -jar selenium-server-standalone-2.45.0.jar -log selenium.log &
echo "Waiting 5 seconds for server to start."
sleep 5
mocha scripts/coreTests -t 30000
mocha scripts/bugTests -t 30000
curl localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer
