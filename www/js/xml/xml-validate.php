<?php
session_start();
$xml = new DOMDocument();
$xml->load('http://localhost/laits/js/xml/xml-test.xml'); // Or load if filename required
if (!$xml->schemaValidate('http://localhost/laits/js/xml/dragoon_schema.xsd')) // Or schemaValidateSource if string used.
{    echo "You have an error in the XML file";
}else{
    echo "XML validated";
}
?>


<!--Script with different error checking at http://www.ibm.com/developerworks/library/x-validxphp/

-->