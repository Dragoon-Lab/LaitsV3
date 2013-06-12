<?xml version="1.0" encoding="UTF-8"?>

<?php
     header('Content-type: application/x-java-jnlp-file');
/*
  Since the jnlp file is created dynamically, don't include
  the href attribute in the jnlp element.
  http://lopica.sourceforge.net/ref.html#jnlp
*/
$uri= $_SERVER['REQUEST_URI'];
$codebase="http://" . $_SERVER['SERVER_NAME'] . 
  substr($uri,0,strrpos($uri,'/')+1);
echo "<jnlp codebase=\"$codebase\" spec=\"1.0+\">\n";

?>
 
    <information>
        <title>Laits</title>
        <vendor>Arizona State University</vendor>
        <homepage href="dragoon.asu.edu/"/>
        <description>LAITS is a System Dynamics Modeling tool developed at the Arizona State
            University Computer Science department.
        </description>
        <description kind="short">Laits</description>
    </information>
    <update check="always"/>

    <security>
        <all-permissions/>
    </security>

    <resources>
        <j2se version="1.6+"/>
        <jar href="Laits.jar" main="true"/>
        <jar href="lib/BrowserLauncher2-10.jar"/>
        <jar href="lib/epsgraphics-1.0.0.jar"/>
        <jar href="lib/grapheditorCURRENT.jar"/>
        <jar href="lib/commons-net-3.2.jar"/>
        <jar href="lib/dom4j-1.6.1.jar"/>
        <jar href="lib/graphhelp.jar"/>
        <jar href="lib/jgraph.jar"/>
        <jar href="lib/jgrapht-jdk1.5.jar"/>
        <jar href="lib/jgrapht-jdk1.6.jar"/>
        <jar href="lib/jgraphx.jar"/>
        <jar href="lib/jeval.jar"/>
        <jar href="lib/jhall.jar"/>
        <jar href="lib/jcommon-1.0.16.jar"/>
        <jar href="lib/log4j-1.2.17.jar"/>
        <jar href="lib/swing-layout-1.0.4.jar"/>
        <jar href="lib/xpp3_min-1.1.4c.jar"/>
        <jar href="lib/xstream-1.2.1.jar"/>
        <jar href="lib/jfreechart-1.0.13.jar"/>
        <jar href="lib/jfreechart-1.0.13-experimental.jar"/>
        <jar href="lib/jfreechart-1.0.13-swt.jar"/>
        <jar href="lib/AbsoluteLayout.jar"/>
	<jar href="./lib/httpclient-4.2.5.jar" />
	<jar href="./lib/httpclient-cache-4.2.5.jar" />
	<jar href="./lib/httpcore-4.2.4.jar" />
	<jar href="./lib/httpmime-4.2.5.jar" />
	<jar href="./lib/fluent-hc-4.2.5.jar" />
	<jar href="./lib/commons-logging-1.1.1.jar" />
    </resources>

    <application-desc main-class="edu.asu.laits.gui.Application">
<?php
    //  print_r($_POST);
	$username = $_POST['username'];
	$mode = $_POST['mode'];
	$problem_id = $_POST['problem_id'];
	
	if($mode == "AUTHOR"){
		$problem_id = "_Author";
	}

	echo "<argument>$username</argument>\n";
        echo "<argument>$mode</argument>\n";
        echo "<argument>$problem_id</argument>\n";
        header("Content-Disposition: attachment; filename=\"laits-$problem_id.jnlp\"");
?>
    </application-desc>

</jnlp>
