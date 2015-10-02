@echo off
echo Starting selenium server...
START /B java -jar .\selenium-server-standalone-2.45.0.jar -log selenium.log
timeout 10
echo Engage!

rem USE NEXT LINE TO TEST MOCHA ITSELF:
rem call mocha -t 30000

rem Run core and bug tests unless otherwise specified
IF [%1]==[] (
	call mocha ./scripts/coreTests/ -t 30000
	call mocha ./scripts/bugTests/ -t 30000 
) ELSE (
	call mocha %1 -t 30000 
)

echo Shutting down selenium server...
curl http://localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer
