# Graph Design

## Nodes

The interior of a node contains the name of the quantity.
The nodes have the following shapes:

* Square: Parameter

* Diamond:  Accumulator

* Circle:  Function. 

* Triangle:  The Type has not been defined.  In AUTHOR mode, the non-solution nodes will have this shape.

For nodes of Type Function or Accumulator,
if the equation is a pure sum or product, as determined by method `isSum()` or `isProduct()`
in `js/equation.js`, and is not a single variable, then the node should be marked with a "+" or "*".
This is independent of any special behavior the node editor may have for these kinds of nodes.

If the node has been completely specified, the border is solid.  Otherwise the border is a dashed line.

The border is colored based on the first condition that is true:

* Red: There exists a red control

* Yellow:  There exists a yellow control

* Green: there exists a green control

* Black: default (in TEST mode, this will always be the case)

If all controls are green and there have *never* been any reds or yellows, then the node is "perfect."
(Syntax errors in the equation do not count.)
Perfect nodes are marked in special way:  for instance, we could turn the background green.

## Connectors

Connectors have no labels.  The there is an arrow at the target end of the connector.  If the node is a pure sum, as discussed above, then the target end is decorated with a + or - depending on whether it contributes as a plus or minus to the sum.
Doing something similar for product nodes in a way that would be helpful to the student seems difficult.
