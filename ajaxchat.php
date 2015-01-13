<?php

// loads required files
require_once("ajaxchat.class.php");

// declares variables for later use
$mode = $_POST['mode'];
$id = 0;
$chat = new Chat();

// posts new messages by user
if($mode == 'SendAndRetrieveNew') {
	$name = $_POST['name'];
	$message = $_POST['message'];
	$color = $_POST['color'];
	$id = $_POST['id'];
	
	// ensures no fields are null then posts message
	if ($name != '' && $message != '' && $color != '') {	
		$chat->postMessage($name, $message, $color);
	}
	
// deletes all messages 
} elseif($mode == 'DeleteAndRetrieveNew') {
	$chat->deleteMessages();

// gets new messages from other users
} elseif($mode == 'RetrieveNew') {
	$id = $_POST['id'];
}

// clears the output
if(ob_get_length()) ob_clean();

// prevents browser caching
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Content-Type: text/xml');

// retrieves new messages from the database
echo $chat->retrieveNewMessages($id);
?>
