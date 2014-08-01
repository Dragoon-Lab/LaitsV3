ifeq ($(shell uname),Darwin)
    SUDO = sudo
else
    SUDO =
endif
install:
	echo "Installing NodeJs"
	git clone git://github.com/ry/node.git
	cd node;\
	./configure; \
	$(SUDO) make install;
	echo "Installing npm"
	git clone http://github.com/isaacs/npm.git
	cd npm;make
	$(SUDO) npm install -g mocha chai webdriverjs
	$(SUDO) curl http://selenium-release.storage.googleapis.com/2.42/selenium-server-standalone-2.42.2.jar > selenium-server-standalone-2.28.0.jar
