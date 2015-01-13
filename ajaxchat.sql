CREATE TABLE chat (
	message_id int(11) NOT NULL AUTO_INCREMENT,
	posted_on datetime NOT NULL,
	user_name varchar(20) NOT NULL,
	message text NOT NULL,
	color char(7) default '#000000',
	PRIMARY KEY (message_id)
);
