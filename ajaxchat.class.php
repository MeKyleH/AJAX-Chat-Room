<?php
// loads required files
require_once ('config.php');
require_once ('error_handler.php');

// creates chat class for the server to process
class Chat {

	private $mysqli;

	// creates server/database connection
	function __construct() {
		$this -> mysqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
	}

	// destroys server/database connection
	public function __destruct() {
		$this -> mysqli -> close();
	}

	// deletes the messages from the database
	public function deleteMessages() {
		$query = 'TRUNCATE TABLE chat';
		$result = $this -> mysqli -> query($query);
	}

	// posts message to database
	public function postMessage($name, $message, $color) {
		// real_escape_string prevents hacking of the database
		$name = $this -> mysqli -> real_escape_string($name);
		$message = $this -> mysqli -> real_escape_string($message);
		$color = $this -> mysqli -> real_escape_string($color);

		// sends message to the database
		$query = 'INSERT INTO chat(posted_on, user_name, message, color) ' . 'VALUES (NOW(), "' . $name . '" , "' . $message . '","' . $color . '")';
		$result = $this -> mysqli -> query($query);
	}

	// retrieves new messages from the database
	public function retrieveNewMessages($id = 0) {
		$id = $this -> mysqli -> real_escape_string($id);

		// only gathers new chats if the user has already been in the chat room
		if ($id > 0) {
			$query = 'SELECT message_id, user_name, message, color, ' . ' DATE_FORMAT(posted_on, "%H:%i") ' . ' AS posted_on ' . ' FROM chat WHERE message_id > ' . $id . ' ORDER BY message_id ASC';
		} else {
			// gets the last 25 chats if a user is new to the chat room
			$query = ' SELECT message_id, user_name, message, color, posted_on FROM ' . ' (SELECT message_id, user_name, message, color, ' . ' DATE_FORMAT(posted_on, "%H:%i") AS posted_on ' . ' FROM chat ' . ' ORDER BY message_id DESC ' . ' LIMIT 25) AS Last25' . ' ORDER BY message_id ASC';
		}

		// sends request to the database
		$result = $this -> mysqli -> query($query);
		$response = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
		$response .= '<response>';
		$response .= $this -> isDatabaseCleared($id);

		// if we have results it loads them to the screen
		if ($result -> num_rows) {
			while ($row = $result -> fetch_array(MYSQLI_ASSOC)) {
				$id = $row['message_id'];
				$color = $row['color'];
				$userName = $row['user_name'];
				$time = $row['posted_on'];
				$message = $row['message'];
				$response .= '<id>' . $id . '</id>' . '<color>' . $color . '</color>' . '<time>' . $time . '</time>' . '<name>' . $userName . '</name>' . '<message>' . $message . '</message>';
			}
			// closes database connection for security
			$result -> close();
		}
		// returns response
		$response = $response . '</response>';
		return $response;
	}

	// checks if the database has been cleared by a user
	private function isDatabaseCleared($id) {
		if ($id > 0) {
			$check_clear = 'SELECT count(*) old FROM chat where message_id<=' . $id;
			$result = $this -> mysqli -> query($check_clear);
			$row = $result -> fetch_array(MYSQLI_ASSOC);

			// resets the chat if database has been cleared
			if ($row['old'] == 0)
				return '<clear>true</clear>';
		}
		return '<clear>false</clear>';
	}
}
?>
