# JavaScript user interface #

## Frameworks ##

We need a framework.  See Wikipedia [article comparing JavaScript frameworks](http://en.wikipedia.org/wiki/Comparison_of_JavaScript_frameworks). 
We need a framework with the following:

* 2-D vector graphics
* Charting
* Open Source license
* The equivalent of dojo mixin and extend.

There are other things we need but the above items most strongly
discriminate between the candidate libraries.


[d3js](http://d3js.org):
See [MIT Media lab project](http://immersion.media.mit.edu), you can 
login with your email account.

## Graph Visualization and editing ##

A [list of possible libraries](http://stackoverflow.com/questions/7034) at stackoverflow.

[jsPlumb](http://jsplumbtoolkit.com) sits on top of either jQuery,
MooTools, or [YUI3](http://en.wikipedia.org/wiki/YUI_Library).
If we go with another Framework, then we would have to interface this 
library with that framework.

## Automatic node placement ##

Right now, the fifth node is placed on top of the first node.
This was seen in author mode, but I suspect it is a general
flaw in initial node placement algorithm.
Maybe do placement like this:

     0  1  4  9
     2  3  5 10
     6  7  8 11
    12 13 14 15

Here is some code that will produce this:

    n is the number of the node
    q = int(sqrt(n));
    if(n<q^2+q)
      position=(q,n-q^2)
    else
      position=(n-q^2-q,q)

An explanation, showing the above table, should be included as a comment in the code.
