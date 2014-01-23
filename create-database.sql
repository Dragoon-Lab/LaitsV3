-- MySQL dump 10.13  Distrib 5.1.61, for redhat-linux-gnu (x86_64)
--
-- Host: localhost    Database: laitsad_laitsdb
-- ------------------------------------------------------
-- Server version	5.1.61

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_logs` (
  `USER_ID` varchar(30) NOT NULL,
  `DATED` datetime NOT NULL,
  `LEVEL` varchar(10) NOT NULL,
  `MESSAGE` varchar(1000) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dev_logs`
--

DROP TABLE IF EXISTS `dev_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dev_logs` (
  `USER_ID` varchar(30) NOT NULL,
  `DATED` datetime NOT NULL,
  `LOGGER` varchar(200) NOT NULL,
  `LEVEL` varchar(10) NOT NULL,
  `MESSAGE` varchar(1000) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `session` (
  `session_id` varchar(50) NOT NULL,
  `mode` varchar(20) NOT NULL,
  `user` varchar(30) NOT NULL,
  `section` varchar(30) NOT NULL,
  `problem_name` varchar(30),
  `author` varchar(30),
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  PRIMARY KEY(session_id)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `autosave_table`
--

DROP TABLE IF EXISTS `autosave_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `autosave_table` (
  `session_id` varchar(50) NOT NULL,
  `saveData` text,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY(session_id)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `step`
--

DROP TABLE IF EXISTS `step`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `step` (
  `tid` int(10) unsigned NOT NULL auto_increment,
  `session_id` varchar(50) NOT NULL,
  `method` varchar(20) NOT NULL,
  `message` text,
  PRIMARY KEY(tid)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
ALTER TABLE `step` ADD KEY(session_id);
/*!40101 SET character_set_client = @saved_cs_client */;



DROP TABLE IF EXISTS `unsolutions`;
CREATE TABLE `unsolutions` (
  `author` varchar(30) NOT NULL,
  `section` varchar(30) NOT NULL,
  `problemName` varchar(30) NOT NULL,
  `saveData` text NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  primary key(author, section, problemName)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT 'Work-around for the java version, which has two xml formats.';

--
-- Table structure for table `solutions`
--

DROP TABLE IF EXISTS `solutions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `solutions` (
    `section` VARCHAR(30) NOT NULL, 
    `problemName` VARCHAR(30) NOT NULL,  
    `author` VARCHAR(30) NOT NULL, 
    `share` BOOL NOT NULL DEFAULT 0, 
    `deleted` BOOL NOT NULL DEFAULT 0, 
    `time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    `solutionGraph` TEXT NOT NULL, 
    PRIMARY KEY(section, problemName, author)
    ) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-06-14 13:41:42
