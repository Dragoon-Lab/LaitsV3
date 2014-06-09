## Saving State##

There are three levels of specificity for saving state from session to session:

* *Quantities that are specific to the problem, and user*:  These are generally stored
in the problem nodes, `givenModelNodes` for AUTHOR mode and `studentModelNodes` for
the student modes.  In addition, in the student modes there are a few quantities that must
persist under deletion of a node.  These quanties reside in the appropriate node in `givenModelNodes`.
See [JSON format](json-format.md) for details.

* *Quantities that are specific to a user*:  These are stored in the state table (see below) and are identified by the `user` and `section`.

* *Quantities that are specific to a section*: These are also stored in teh state table, identified by `section` with `user` set to the empty string.

If a quantity has both a user-specific value and a section-wide value, then the user-specific value takes precidence.

### State table ###

The state table has the following columns:

* `section` (string):  The section

* `user` (string): The username.  An empty string indicates a section-wide default for a quantity.

* `apropos` (string):  A group of quantites.  Values for `apropos` include:
    * `policies`: settings of the tutor system, such as whether to use structured or algebraic equation
	   inputs on the node editor  or what level of hints to give.
    * `actions`: counters detailing what the student has done
       in the past.  For example: how many greeens the student has seen.
    * `skills`: variables describing what the student does or does not know
	
 Generally, actions are used to determine skills and skills are used to determine policies.
 There may be several competing sets of skills, corresponding to competing models of the student.
 Each set of skills should have its own `apropos` value.
 
* `property` (string): A quantity name

* `tid` (integer): This acts as a time stamp and gets its value from the most recent `tid` in the `step` table.  This allows us to retain a history of the various quantities for debugging and logging purposes.  Queries should return the value associated with the most recent `tid` so removing `tid` entirely should not affect the behavior of the state table.

* `value` (text): The value is an arbitrary JavaScript object, stored in JSON format.   Since it is an object, one is free to combine several quantities together into a single entry in the state table, if it is more convenient.

For normal use, the state table *should* be accessed using the script `www/state.php` which can set or return a value for a single parameter.  The `state.php` script hides the existence of the timestamp `tid` from the user.

It is possible for a server-side script to act on the state table, taking the `actions` and other log data, creating
a new model of the student, and setting values for `policies`.

### State Module ###

The JavaScript module `www/js/state.js` can be used to access the state table.  Generally, one creates a new state object for a specific `section`, `user`, and `apropos` using the 'init()' function. The 'init()' function places the initial value in the local cache. Then one can access the associated parameters using `getLocal()` and change the associated parameter using 'increment()' methods. 'Increment()' method also place the updated value in the state table.

Note: 'init()' is the only time the module needs to retrieve data from the server. Thus, 'init()' needs to be called before 'increment()' or 'getLocal()' to allow time for data retrieval. This is to avoid problems due to possible delays from the server. After 'init()', all data retrieval relies on the local cache, allowing for greater efficiency.

