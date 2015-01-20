DROP TABLE IF EXISTS `schema_opportunity`;
DROP TABLE IF EXISTS `schema_session`;
DROP TABLE IF EXISTS `schema_application`;

-- table stores the schemas that are there in a problem and there difficulty level --
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schema_opportunity`(
	`problem` varchar(30) NOT NULL COMMENT 'problem name from while authoring the problem',
	`schema_id` varchar(30) NOT NULL COMMENT 'this is same as the id coming from a file in the codebase.',
	`isolated` varbinary(1) NOT NULL COMMENT 'whether the schema is applied in isolation',
	`cues` varbinary(1) NOT NULL COMMENT 'whether the presentation has cues for the user to understand',
	`phrases` varbinary(1) NOT NULL COMMENT 'whether the presentation and noun phrases for user to understand the variables',
	`nodes` text COMMENT 'nodes to which the schema is applied should be added in the form of a json, structure can be checked from documentation',
	`id` varchar(50) NOT NULL COMMENT 'contains problem_schemaID string with the int conversion of isolated:cues:phrases i.e. 0 to 7 and is the primary key' 
	`time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT problem_id PRIMARY KEY (`id`, `problem`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schema_session`(
	`session_id` varchar(50) NOT NULL,
	`schema_id` varchar(30) NOT NULL,
	`id` varchar(50) NOT NULL,
	PRIMARY KEY (`session_id`),
	KEY (`id`),
	CONSTRAINT `fk_id` FOREIGN KEY (`id`) REFERENCES `schema_opportunity` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
	CONSTRAINT `fk_session_id` FOREIGN KEY (`session_id`) REFERENCES `session` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

-- table to store student schema application details --
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schema_application`(
	`session_id` varchar(50) NOT NULL,
	`time_spent` float(7, 2) NOT NULL COMMENT 'total time spent on the schema',
	`errors` int(5) unsigned NOT NULL COMMENT 'errors related to this schema',
	`competence` float(8, 7) NOT NULL,
	`count` int(5) unsigned NOT NULL COMMENT 'incremented value sent to order the schema as per the student value',
	`tid` int(10) unsigned NOT NULL AUTO_INCREMENT,
	PRIMARY KEY (`tid`),
	KEY (`session_id`),
	CONSTRAINT `fk_session_id` FOREIGN KEY (`session_id`) REFERENCES `schema_session` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
