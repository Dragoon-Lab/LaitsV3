@echo off
echo Starting selenium server...
START /B java -jar .\selenium-server-standalone-2.45.0.jar -log selenium.log
timeout 10
echo Engage!

rem USE NEXT LINE TO TEST MOCHA ITSELF:
rem call mocha %1 -t 30000

rem USE NEXT TWO LINES TO RUN NORMAL TESTS:
call mocha ./scripts/coreTests/ -t 30000
call mocha ./scripts/bugTests/ -t 30000

echo Shutting down selenium server...
curl http://localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer
