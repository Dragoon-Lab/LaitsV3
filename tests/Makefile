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
	@echo "Installing npm"
	git clone http://github.com/isaacs/npm.git
	npm install -g mocha phantomjs
	npm install chai webdriverjs 
	wget http://selenium-release.storage.googleapis.com/2.42/selenium-server-standalone-2.42.2.jar
endif
run:
	@echo "starting selenium server"
	java -jar selenium-server-standalone-2.42.2.jar > selenium.log &
	mocha tests -t 10000
	
