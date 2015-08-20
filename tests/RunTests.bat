@echo off
echo Starting selenium server...
START /B java -jar .\selenium-server-standalone-2.45.0.jar -log selenium.log
timeout 10
echo Engage!
rem call mocha ./scripts/coreTests/functionTest.js -t 30000
call mocha %1 -t 30000

echo Shutting down selenium server...
curl http://localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer
