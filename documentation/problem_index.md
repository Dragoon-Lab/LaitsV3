# Problem Indexing Structure #
(This is under discussion and is subject to a lot of changes)
Currently the problems exist in JSON files in the problems folder under the www folder. The main use of these files are when a new user opens a problem for the first time, it picks up the json object to show problems. If a problem has already been opened then the user session is picked from the database tables.

There are two ways in which a authored problems exist, 
* Complete but not published problems - they are kept in the database. So if the front end is not using the same database as it was created on then you won't be able to run the problem.
* Complete and published problems which are stored in problems folder. Right now there is no automatic way to do publish a problem, even though it is easy to do. These are when problems are globally available, and are part of the central repository. 

## Requirements ##

* Authors should be able to share the problems through sending those JSONs directly. This requirement excludes the usage of database, as then complete database has to be shared for sharing the problem which is not feasible.
* Problem names are in two forms right now, one is a name of the file, and the other is the actual problem name which user sees. For example, Moose Population 1 is actually called `isle1.json`. So this format can also be used to store these filenames and can be used in the dashboard as well, which will keep the names in parallel, in the form of key-value pair.
* The problems are divided in groups like, Isle Royale, Energy balance and so on. This division will also help us keep a place where we can track all the groups and the problems as well. 
* This can also be used to make a global list of problems that we have. It can be used to show all the problems with proper group structure on the `dragoon.asu.edu`.

## Implementation & Integration with other modules ##
We will continue using the file structure as we have right now, and create a file (say problems.json) which will be like a database table for us. This will be a json object with structure :

group1 : {
	p1: problem name 1,
	p2: problem name 2
},
group2 : {
	p3: problem name 3,
	p4: problem name 4
}

Functions needed:
Since this a functionality related to session of the user, the changes will be primarily made in load-save.js. We would need functions for :

* Getting the json object
* Editing this object
* Writing it back to the file. (Some functions already exist in the file and they can be used to make these functions).

Automating the publishing process

We will need to give an external link to the author to be able to publish the completed problems. After initial checking i.e., whether the problem is feasible, the nodes are complete, description and image and other required information is complete, we can create a json object with the file name given by the author (this file name has to be unique and we would need to check here whether it is or not). This would just need a function in `load-save.js` and to write it to a file and put in the problems folder. Then we will update the above json object and write it back to the file. This would be a three step process : Get the object, edit it and write it back to the file. 

To check whether a file name is unique or not can be done in two ways:

* First make a call to get the file name, and if the server comes back without any such then we can assume that the file does not exist. 
* Second can be to look in the problems json object and make sure that the key value is unique, i.e. no such key exists already with the same name. This is a better way as previous would be more of a hack. But we will need to make sure that this file is always up to date. 

In dashboard we will just need a similar one more function call which will give the user understandable names of the problems, and then this can be displayed on the dashboard. The function for getting a file is already available in dashboard and some changes would be needed in the rendering part.