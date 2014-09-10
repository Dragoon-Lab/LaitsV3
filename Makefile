install:
	@echo "You will need to create database using create-database.sql"
	@echo "You will also need to create a \"db_user_password\" file."
	@echo "See README.md for installation instructions."
	cd www; $(MAKE) install
	cd tests; $(MAKE) install

update:
	git pull
	cd www; $(MAKE) update
