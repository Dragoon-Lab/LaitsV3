ifeq ($(OS),Windows_NT)
    SHELL=C:/Windows/System32/cmd.exe
endif
dojo-version=master

install:
	-rm -r -f dojo dijit dojox util jsPlumb math-parser
	git clone https://github.com/dojo/dojo.git dojo
	git clone https://github.com/dojo/dijit.git dijit
	git clone https://github.com/dojo/dojox.git dojox
	git clone https://github.com/dojo/util.git util
	git clone https://github.com/bhosaledipak/JsPlumb_Dojo_Integreate.git jsPlumb
	git clone https://github.com/bvds/js-expression-eval.git math-parser  
	echo "${dojo-version}" > dojo-install-version
	sudo npm install
	@echo "call to build script goes here"
	@echo "Installed Dojo $(dojo-version)."

update:
ifeq ($(shell test -f dojo-install-version && cat dojo-install-version),${dojo-version})
	cd dojo; git pull
	cd dijit; git pull
	cd dojox; git pull
	cd util; git pull
	cd jsPlumb; git pull
	cd math-parser; git pull
	cd ..
	sudo npm install
	@echo "call to build script goes here"
	@echo "Updated Dojo $(dojo-version)."
else 
	$(MAKE) install
endif
