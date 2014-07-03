# Graph Design


## Node Borders

The nodes have the following shapes:

* Square:  Accumulator

* Diamond: Parameter

* Circle:  Function. 

* Triangle:  The Type has not been defined.  In AUTHOR mode, the non-solution nodes may have this shape.

If the node has been completely specified, the border is solid.  Otherwise the border is a dashed line.  This is determined by the function
`isComplete()` for the appropriate model in `js/models.js`.
The border is colored based on the first condition that is true:

* Red: There exists a red control

* Yellow:  There exists a yellow control

* Green: there exists a green control

* Black: default (in TEST mode, this will always be the case)

The border coloring is calculated by the function `getCorrectness()` in `js/model.js`.

## Node interiors

The interior of a node has three possible labels giving the functional
form, the value, and the name.  

**functional form**:  Nodes without an equation are not marked.
If the is a pure sum or product, as determined by method 
`isSum()` or `isProduct()` in `js/equation.js`, 
then the node should be marked with a "+" or "*" (alternatively, we could
use "sum" and "product").
If both `isSum()` and `isProduct()` are true, then the equation is 
a single variable and there should be no marking.
If the both `isSum()` and `isProduct()` are false, then the node should
be marked with the equation itself.  If the equation is too long,
it should be truncated with trailing ellipses shown; on mouseover,
the full equation should be shown.

**value**:  Nodes of type parameter should show any value together 
with any units.  If the expression is too long,
it should be truncated with trailing ellipses shown; on mouseover,
the full expression should be shown.
In the same manner, the initial value of any accumulator will also
be displayed.

**name** Any name should be shown. On mouseover, the associated description 
should be shown.  If the name is too long, it should be truncated with 
trailing ellipses shown; on mouseover,
the full name should be shown.

If all controls are green and there have *never* been any reds or yellows, then the node is "perfect."
(Syntax errors in the equation do not count.)
Perfect nodes are marked in special way:  for instance, we could turn the background green.

## Connectors

Connectors have no labels.  The there is an arrow at the target end of 
the connector.  When the node is a pure sum (as discussed above) and the 
quantity associated with the connector has a negative contribution to 
the node equation, then the arrow is decorated with a "-". Likewise 
when the node is a pure product, and the quantity associated with 
the connector appears in the denominator of the node equation, then 
the arrow is decorated with a "/".  The decoration is 
added to the node `inputs` by the function `createInputs()` in 
`js/equation.js`.
For example:

    inputs: [{ID: "id2, label: "-"}, ...]

## Automatic node placement ##

Our algorithm for automatic node placement will
produce a pattern like this:

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
