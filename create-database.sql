
DROP TABLE IF EXISTS `step`;
DROP TABLE IF EXISTS `solutions`;
DROP TABLE IF EXISTS `session`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `session` (
  `session_id` varchar(50) NOT NULL,
  `mode` varchar(20) NOT NULL,
  `user` varchar(100) NOT NULL,
  `section` varchar(50) NOT NULL,
  `problem` varchar(50) DEFAULT NULL,
  `group` varchar(50) DEFAULT NULL,
  `activity` varchar(30) DEFAULT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- All logging goes in table `step`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `step` (
  `tid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` varchar(50) NOT NULL,
  `method` varchar(20) NOT NULL,
  `message` text,
  `id` int(5) unsigned NOT NULL,
  PRIMARY KEY (`tid`),
  KEY (`session_id`),
  CONSTRAINT `fk_session_id` FOREIGN KEY (`session_id`) REFERENCES `session` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solutions`
--

--  the share and deleted bits are set here, rather than in the session table
--  since they are most naturally set during the autosave process.

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `solutions` (
  `session_id` varchar(50) NOT NULL,
  `share` BOOL NOT NULL DEFAULT 0, 
  `deleted` BOOL NOT NULL DEFAULT 0, 
  `solution_graph` TEXT DEFAULT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  CONSTRAINT `fk_sesssion_id` FOREIGN KEY (`session_id`) REFERENCES `session` (`session_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table to store information about the student and section
-- that persists across activities.
--
DROP TABLE IF EXISTS `state`;
CREATE TABLE IF NOT EXISTS `state` (
  `section` varchar(50) NOT NULL COMMENT 'Should match section in session table.',
  `user` varchar(100) NOT NULL DEFAULT '' COMMENT 'Empty string means that this is a section-wide setting.  Otherwise, should match user in session table.',
  `apropos` varchar(20) NOT NULL COMMENT 'Category of quantity.',
  `property` varchar(50) NOT NULL COMMENT 'Quantity name.',
  `tid` int(10) unsigned NOT NULL COMMENT 'References tid in step table.',
  `value` text DEFAULT NULL COMMENT 'Quantity value stored as JSON.  NULL is equivalent to removing a property from the table.',
  UNIQUE (`section`,`user`,`apropos`,`property`,`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=1644 DEFAULT CHARSET=latin1;
