-- phpMyAdmin SQL Dump
-- version 4.2.7.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 20, 2015 at 11:10 PM
-- Server version: 5.5.39
-- PHP Version: 5.4.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Table structure for table `sections`
--

CREATE TABLE IF NOT EXISTS `sections` (
`section_id` int(11) NOT NULL COMMENT 'Unique ID for section',
  `section_name` varchar(50) NOT NULL COMMENT 'Name of the section',
  `groups` text NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- Table structure for table `user_groups`
--

CREATE TABLE IF NOT EXISTS `user_groups` (
  `username` varchar(30) NOT NULL COMMENT 'username',
  `section` int(11) NOT NULL COMMENT 'Section to which this user belongs',
  `groups` text COMMENT 'Associated groups'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `sections`
 ADD PRIMARY KEY (`section_id`);

ALTER TABLE `user_groups`
 ADD PRIMARY KEY (`username`,`section`), ADD KEY `fk_sectionid` (`section`);

ALTER TABLE `sections`
MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique ID for section',AUTO_INCREMENT=4;

ALTER TABLE `user_groups`
ADD CONSTRAINT `fk_sectionid` FOREIGN KEY (`section`) REFERENCES `sections` (`section_id`);

