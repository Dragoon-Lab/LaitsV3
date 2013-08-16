## Documentation for Dragoon ##

This contains mostly design documents.  

* [Node Editor](node-editor.md) with tabs:  Description, Plan, and Calculation
* [Add sliders to parameters](sliders.md)
* [Major modes](major-modes.md) (STUDENT COACHED TEST AUTHOR)
* [Session behavior](sessions.md) which discusses saving, modifying, and sharing problems.
* [Problem and node-specific forum](Forum_Feature_in_Dragoon.docx).  Document written by Ram
  with comments by BvdS.
* [Session storage](Dragoon_model_storage_use_cases_13_08_12.docx)

Documentation can be in any convenient format (word, html, *et cetera*) with generic 
[markdown](http://en.wikipedia.org/wiki/Markdown) being the default choice.  Any
document should have an associated link in this file.  

### Install Documentation ###

Place a link to the `documentation` directory in your webserver root directory.  
For the sever to properly translate the markdown, download a 
[markdown handler](https://github.com/alue/markdown-handler), 
edit the provided `.htaccess` file, and install the files your the web server root directory.
You may need to activate `AllowOverride` in your Apache configuration file.