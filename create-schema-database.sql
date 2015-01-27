DROP TABLE IF EXISTS `schema_session`;
DROP TABLE IF EXISTS `schema_application`;

-- table saves the session schema values for the student. username and problem name can be picked up from the session_id 
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schema_session`(
	`session_id` varchar(50) NOT NULL,
	`schema_id` varchar(30) NOT NULL,
	`difficulty` text NOT NULL COMMENT 'contains difficulty parameters for the schema.',
	CONSTRAINT `pk_session_schema` PRIMARY KEY (`session_id`, `schema_id`),
	CONSTRAINT `fk_session_id` FOREIGN KEY (`session_id`) REFERENCES `session` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

-- table to store student schema application details 
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schema_application`(
	`session_id` varchar(50) NOT NULL,
	`schema_id` varchar(30) NOT NULL,
	`competence` text COMMENT 'contains all types of competence and user data values in a json',
	`counter` int(5) unsigned NOT NULL COMMENT 'incremented value sent to order the schema as per the student value',
	`tid` int(10) unsigned NOT NULL AUTO_INCREMENT,
	PRIMARY KEY (`tid`),
	KEY (`session_id`),
	CONSTRAINT `fk_session_id` FOREIGN KEY (`session_id`) REFERENCES `schema_session` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
