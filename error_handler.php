<?php

set_error_handler('error_handler', E_ALL);

// called for errors
function error_handler($errNo, $errStr, $errFile, $errLine) {
	if(ob_get_length()) ob_clean(); // clear existing output buffer

	// creates and displays error
	$error_message = 'errNo: ' . $errNo . chr(10) .
	'TEXT: ' . $errStr . chr(10) .
	'LOCATION: ' . $errFile .
	', line ' . $errLine;
	echo $error_message;
	exit;
}

?>
