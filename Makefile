install:
	@echo "You will need to create database using create-database.sql"
	@echo "You will also need to create a \"db_user_password\" file."
	@echo "See README.md for installation instructions."
	cd www; $(MAKE) install

update:
	git pull
	cd www; $(MAKE) update

jar:
	rm -f laitsupload/*.jar
	cp dist/*.jar laitsupload/Laits.jar
	cp dist/lib/*.jar laitsupload/
	@echo "work-around for Bug #2162"
	cp lib/jhall-2.0.jar laitsupload/
	#rm laitsupload/jhall-2.0.jar
	#cp lib/jhall.jar laitsupload/
	(cd laitsupload/; ./test.sh)
	rm www/lib/*.jar
	cp laitsupload/*.jar www/lib
	mv www/lib/Laits.jar www
