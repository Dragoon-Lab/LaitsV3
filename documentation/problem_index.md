# Problem Indexing Structure #
(This is under discussion and is subject to a lot of changes)
Currently the problems exist in JSON files in the problems folder under the www folder. The main use of these files are when a new user opens a problem for the first time, it picks up the json object to show problems. If a problem has already been opened then the user session is picked from the database tables.

There are two ways in which a authored problems exist, 
* Complete but not published problems - they are kept in the database. So if the front end is not using the same database as it was created on then you wont be able to run the problem.
* Complete and published problems which are stored in problems folder. Right now there is no automatic way to do publish a problem, even though it is easy to do. These are when problems are globally available, and are part of the central repository. 

## Requirements ##

* Authors should be able to share the problems through sending those JSONs directly. This requirement excludes the usage of database, as then complete database has to be shared for sharing the problem which is not feasible.
* Problem names are in two forms right now, one is a name of the file, and the other is the actual problem name which user sees. For example, Moose Population 1 is actually called isle1. So this format can also be used to store these filenames and can be used in the dashboard as well, which will keep the names in parallel, in the form of key-value pair.
* The problems are divided in groups like, Isle Royale, Energy balance and so on. This division will also help us keep a place where we can track all the groups and the problems as well. 
* This can also be used to make a global list of problems that we have. It can be used to show all the problems with proper group structure on the `dragoon.asu.edu`.

## Implementation ##
We will continue using the file structure as we have right now, and move the file in an external file which will be like a database for us. This will be a json object with structure :

group1 : {
	p1: problem name 1,
	p2: problem name 2
},
group2 : {
	p3: problem name 3,
	p4: problem name 4
}