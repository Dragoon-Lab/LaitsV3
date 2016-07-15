#!/bin/bash
#resistor-battery-series,two-resistors-in-series,kcl,resistor-capacitor-1,resistor-capacitor-2,resistor-inductor,zero-set-point-homeostasis,nonzero-set-point-homeostasis,two-loop-homeostasis,simple-blood-glucose-homeostasis,glucose-min-model,Energy-balance-0,Energy-balance-1,Energy-balance-2,Energy-balance-3,Energy-balance-4,Energy-balance-5,Energy-balance-6,Energy-balance-7,Energy-balance-8,Fall-from-building-1,Fall-from-building-2,Fall-from-building-3,Thrown-Stone-1,Thrown-Stone-2,isle1,isle2,isle3,isle4,isle5,isle6,201,202,203,204,zebra-population-growth-1,zebra-population-growth-2,zebra-population-growth-3,zebra-population-growth-4,lion-population-growth-1,lion-population-growth-2,lion-population-growth-3,lion-population-growth-4,zebra-lions-independent-solo,zebra-lions-combined,CPI-2014-ps1-01,CPI-2014-ps1-02,CPI-2014-ps1-03,CPI-2014-ps1-04,CPI-2014-ps1-05,CPI-2014-ps1-06,CPI-2014-ps1-07,CPI-2014-ps1-08,
#CPI-2014-ps1-09,CPI-2014-ps1-10,CPI-2014-ps1-11,
ModelLibrary="CPI-2014-ps1-12,CPI-2014-ps2-01,CPI-2014-ps2-02,CPI-2014-ps2-03,CPI-2014-ps2-04,CPI-2014-ps2-05,CPI-2014-ps2-06,CPI-2014-ps2-07,CPI-2014-ps2-08,CPI-2014-ps2-09,CPI-2014-ps3-01,CPI-2014-ps3-02,CPI-2014-ps3-03,CPI-2014-ps3-04,CPI-2014-ps3-05,CPI-2014-ps3-06,CPI-2014-ps3-07,CPI-2014-ps3-08,CPI-2014-ps4-01,CPI-2014-ps4-02,CPI-2014-ps4-03,CPI-2014-ps4-04,CPI-2014-ps4-05,CPI-2014-ps4-06,CPI-2014-ps5-01,CPI-2014-ps5-02,CPI-2014-ps5-03,CPI-2014-ps5-04,CPI-2014-ps5-05,CPI-2014-ps5-06"

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

echo "Running tests in construction/coached mode"

node scripts/problemTester.js -p $ModelLibrary -m COACHED

echo Shutting down selenium server...
curl localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer
echo
