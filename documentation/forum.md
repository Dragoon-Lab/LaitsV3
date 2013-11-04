# Forum design#

## Groups and topic structures ##

### File changes ###

The forum is at `/home/laits/forum/` on the dragoon server.
There is a solo git repository in the home directory to
record file changes.

We will need to either merge this with the laits repository
or have it as a separate repository on github.
It could be also be made a submodule of the laits repository.
However, there is lots of stuff on the internet saying that
git submodules suck:  
[Why your company shouldn\u2019t use Git submodules](http://codingkilledthecat.wordpress.com/2012/04/28/).

### Changes to database ###

### Changes using Administration Control Panel ###

For each class/section, you need to create a new forum and usergroup in PHPBB for that class:

-In the ACP, Click on "Manage Groups" under "Quick Access"

-Under user-defined groups, create a new group with the SAME NAME as the class/section name.  The default group settings are fine.  Click Submit.

-In the ACP, click on "Manage Forums" under "Quick Access"

-Create a new forum using the SAME NAME you used for the usergroup.  Default settings are fine.  You will be taken to the Forum Permissions page.

-On Forum Permissions, under the "Add Groups" box, highlight the usergroup you created for your class and click Add Permissions.  Select the Standard Access role and click Apply All Permissions.
