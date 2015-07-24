
## Parameterizing the Initial State based on Activity and Modes ##

We need to define the initial state of dragoon, the state which depends on Activity and Mode dragoon is using. When the dragoon is loaded an object is created which contains all UI and Activity parameters that are required to initialize and define the initial state of the dragoon.

### To ADD New Parameters (UI PARAMETERS): ###
For each activity we have a single property that contains an array of object. Each object in array would have MODE and PARAM. MODE would be an array containing all the modes for which parameters are defined.

The first object contains all modes and would be treated as a DEFAULT parameter collection which is applied to all modes in that activity. 
Other object contains specific parameters that override the DEFAULT parameters.
