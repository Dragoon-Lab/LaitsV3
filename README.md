LaitsV3
=======

Version 3 of LAITS Project with jGraph

Requires command line arguments in to run locally from NetBeans.  To set up command line arguments in NetBeans, right-click the project, select "Configuration" > "Customize", select the "Run" category, and enter into the Arguments line in this format:

username mode problemid

Currently accepted modes are STUDENT, COACHED and AUTHOR.  Problemid is the problem number you wish to run.  Example command line argument:

developer1 STUDENT 105

Currently valid problem ids for STUDENT: 74, 79, 80, 92 - 102, 105 -115, 201 - 205

Current problem ids for COACHED: 1005, 1006, 1007, 1008


Ivy Installation Instructions

-----------------------------------

1. Go to https://code.google.com/p/ivybeans/downloads/list

2. Download ivybeans zip file for your netbeans version.

(e.g. : for netbeans 7.1 you will download ivybeans-1.2-nb71.zip)

3. Unzip it. You will get 2 files : com-googlecode-ivybeans-libs.nbm & com-googlecode-ivybeans-module.nbm

4. Go to netbeans -> plugins editor -> downloaded tab -> add plugin -> install these 2 files. Restart netbeans
 IDE.
5. Right click on the project -> properties -> check enable ivy. Point ivy file and settings file to ivy.xml & ivysettings.xml (you can pull these two files from git), respectively.
