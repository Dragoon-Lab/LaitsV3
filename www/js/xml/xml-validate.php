<?php

//This code mostly comes from the following website:
//http://www.ibm.com/developerworks/library/x-validxphp/

//To use the validation script, enter the address to the this file followed by
//"?url=<address to the file>"
//without quotes or angle brackets

function libxml_display_error($error) {
    $return = "<br/>\n";
    switch ($error->level) {
        case LIBXML_ERR_WARNING:
            $return .= "<b>Warning $error->code</b>: ";
            break;
        case LIBXML_ERR_ERROR:
            $return .= "<b>Error $error->code</b>: ";
            break;
        case LIBXML_ERR_FATAL:
            $return .= "<b>Fatal Error $error->code</b>: ";
            break;
    }
    $return .= trim($error->message);
    if ($error->file) {
        $return .= " in <b>$error->file</b>";
    }
    $return .= " on line <b>$error->line</b>\n";

    return $return;
}

function libxml_display_errors() {
    $errors = libxml_get_errors();
    foreach ($errors as $error) {
        print libxml_display_error($error);
    }
    libxml_clear_errors();
}

// Enable user error handling 
libxml_use_internal_errors(true);

$xml = new DOMDocument();
$xml->load($_GET["url"]);

if (!$xml->schemaValidate('dragoon_schema.xsd')) {
    print '<b>Errors Found!</b>';
    libxml_display_errors();
} else {
    echo "The XML document has been validated.";
}
?>

