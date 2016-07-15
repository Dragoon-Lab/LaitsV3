#Note: The phantomjs installed here uses "node" as the command to nodejs.
#      However, this fails on Debian based systems, which changed the
#      command from "node" to "nodejs".  To fix, create a link in
#      /usr/bin from nodejs to node before running this makefile.
#      (Assuming you don't have some other node command--no fix for that
#      yet.)  --JWW 10/2015

ifeq ($(shell uname),Darwin)
install:
	@echo "Installing NodeJs"
	git clone git://github.com/ry/node.git
	cd node;\
	./configure; \
	sudo make install;
	@echo "Installing npm"
	git clone http://github.com/isaacs/npm.git
	cd npm;make
	sudo npm install -g mocha phantomjs
	sudo npm install chai webdriverio synchronize 
	sudo npm install command-line-args request pug
	sudo curl http://selenium-release.storage.googleapis.com/2.46/selenium-server-standalone-2.46.0.jar
	#sudo curl http://chromedriver.storage.googleapis.com/2.14/chromedriver_mac32.zip
else ifeq ($(OS),Windows_NT)
install:
	@echo "WINDOWS"
	npm install -g mocha phantomjs
	npm install chai webdriverio synchronize
	curl http://selenium-release.storage.googleapis.com/2.46/selenium-server-standalone-2.46.0.jar
else
install:
	@echo "LINUX"
	-rm -r -f npm
	@echo "Installing npm"
	git clone http://github.com/isaacs/npm.git
	npm install -g mocha phantomjs
	npm install chai webdriverio
	npm install synchronize
	wget http://selenium-release.storage.googleapis.com/2.46/selenium-server-standalone-2.46.0.jar
endif

run:
	@echo "starting selenium server"
	java -jar selenium-server-standalone-2.46.0.jar > selenium.log &
	@echo "waiting 10 seconds for the server to come up..."
	sleep 10s
	@echo "launching tests"
	mocha scripts -t 10000
