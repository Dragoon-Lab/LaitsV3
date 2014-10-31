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
	sudo npm install chai webdriverjs 
	sudo curl http://selenium-release.storage.googleapis.com/2.42/selenium-server-standalone-2.42.2.jar > selenium-server-standalone-2.28.0.jar
else
install:
	-rm -r -f npm
	@echo "Installing npm"
	git clone http://github.com/isaacs/npm.git
	npm install -g mocha phantomjs
	npm install chai webdriverjs 
	wget http://selenium-release.storage.googleapis.com/2.42/selenium-server-standalone-2.42.2.jar
endif
run:
	@echo "starting selenium server"
	java -jar selenium-server-standalone-2.42.2.jar > selenium.log &
	@echo "waiting 10 seconds for the server to come up..."
	sleep 10s
	@echo "launching tests"
	mocha tests -t 10000
