-- MySQL dump 10.13  Distrib 8.1.0, for macos14.0 (arm64)
--
-- Host: localhost    Database: testdb
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `COURSE`
--

DROP TABLE IF EXISTS `COURSE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `COURSE` (
  `courseid` varchar(255) NOT NULL,
  `coursename` varchar(255) DEFAULT NULL,
  `programtype` enum('OnCampus','WILP') NOT NULL,
  `coursetype` enum('Core Course','Elective') NOT NULL,
  `semester` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`courseid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `COURSE`
--

LOCK TABLES `COURSE` WRITE;
/*!40000 ALTER TABLE `COURSE` DISABLE KEYS */;
INSERT INTO `COURSE` VALUES ('BITS F452','BLOCKCHAIN TECHNOLOGY','OnCampus','Core Course',NULL),('CS F213','OBJECT ORIENTED PROGRAMMING + Lab','OnCampus','Core Course',NULL),('CS F214','LOGIC IN COMPUTER SC','WILP','Core Course',NULL),('CS F215/ EEE F215/ INSTR F215/ ECE F215','DIGITAL DESIGN + Lab','WILP','Elective',NULL),('CS F222','DISCR STRUC FOR COMP SCI','OnCampus','Core Course',NULL),('CS F301','PRINCIPLES OF PROGG LANG','OnCampus','Core Course',NULL),('CS F314','SOFTWARE DEVELOPEMENT FOR PORTABLE DEVICES','WILP','Elective',NULL),('CS F342','COMPUTER ARCHITECTURE + Lab','OnCampus','Elective',NULL),('CS F351','THEORY OF COMPUTATION','OnCampus','Core Course',NULL),('CS F372','OPERATING SYSTEMS','OnCampus','Core Course',NULL),('CS F402','COMPUTATIONAL GEOMETRY','WILP','Core Course',NULL),('CS F446','DATA STORAGE TECHNOLOGIES AND NETWORKS','OnCampus','Elective',NULL);
/*!40000 ALTER TABLE `COURSE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `COURSEPREFERENCE`
--

DROP TABLE IF EXISTS `COURSEPREFERENCE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `COURSEPREFERENCE` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courseid` varchar(255) NOT NULL,
  `authorid` varchar(255) NOT NULL,
  `facultyrole` enum('Tutorial','Practical','Theory','IC','Instructor') NOT NULL,
  `totalnoofcsstudnets` int NOT NULL,
  `totalnootherdisciplinestudents` int NOT NULL,
  `comments` varchar(255) NOT NULL,
  `preferences` int NOT NULL,
  `status` int DEFAULT '0',
  `recordtimestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `courseprefernce_ibfk_1` (`authorid`),
  KEY `courseprefernce_ibfk_2` (`courseid`),
  CONSTRAINT `courseprefernce_ibfk_1` FOREIGN KEY (`authorid`) REFERENCES `USERS_DETAILS` (`users_id`),
  CONSTRAINT `courseprefernce_ibfk_2` FOREIGN KEY (`courseid`) REFERENCES `COURSE` (`courseid`),
  CONSTRAINT `courseprefernce_chk_1` CHECK (((`preferences` >= 1) and (`preferences` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `COURSEPREFERENCE`
--

LOCK TABLES `COURSEPREFERENCE` WRITE;
/*!40000 ALTER TABLE `COURSEPREFERENCE` DISABLE KEYS */;
/*!40000 ALTER TABLE `COURSEPREFERENCE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `COURSETAKEN`
--

DROP TABLE IF EXISTS `COURSETAKEN`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `COURSETAKEN` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courseid` varchar(255) DEFAULT NULL,
  `authorid` varchar(255) DEFAULT NULL,
  `facultyrole` enum('Tutorial','Practical','Theory','IC','Instructor') DEFAULT NULL,
  `totalnoofcsstudents` int DEFAULT NULL,
  `totalnootherdisciplinestudents` int DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courseid` (`courseid`),
  CONSTRAINT `coursetaken_ibfk_1` FOREIGN KEY (`courseid`) REFERENCES `COURSE` (`courseid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `COURSETAKEN`
--

LOCK TABLES `COURSETAKEN` WRITE;
/*!40000 ALTER TABLE `COURSETAKEN` DISABLE KEYS */;
/*!40000 ALTER TABLE `COURSETAKEN` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FACULTYPREFERNCE`
--

DROP TABLE IF EXISTS `FACULTYPREFERNCE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FACULTYPREFERNCE` (
  `faculty_id` varchar(255) NOT NULL,
  `course_code` varchar(255) NOT NULL,
  `preference` int DEFAULT NULL,
  `facultyrole` enum('Tutorial','Practical','Theory','IC','Instructor') DEFAULT NULL,
  `totalnoofcsstudnets` int DEFAULT NULL,
  `totalnootherdisciplinestudents` int DEFAULT NULL,
  PRIMARY KEY (`faculty_id`,`course_code`),
  KEY `course_code` (`course_code`),
  CONSTRAINT `facultyprefernce_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `USERS_DETAILS` (`users_id`),
  CONSTRAINT `facultyprefernce_ibfk_2` FOREIGN KEY (`course_code`) REFERENCES `COURSE` (`courseid`),
  CONSTRAINT `facultyprefernce_chk_1` CHECK (((`preference` >= 1) and (`preference` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FACULTYPREFERNCE`
--

LOCK TABLES `FACULTYPREFERNCE` WRITE;
/*!40000 ALTER TABLE `FACULTYPREFERNCE` DISABLE KEYS */;
INSERT INTO `FACULTYPREFERNCE` VALUES ('user1','CS F213',1,'Tutorial',15,10),('user1','CS F214',3,'Practical',15,10),('user1','CS F222',4,'Practical',15,10),('user1','CS F342',2,'Tutorial',15,10),('user1','CS F351',2,'Tutorial',15,10),('user1','CS F372',5,'Practical',15,10),('user2','CS F213',2,'Practical',15,10),('user2','CS F214',1,'Theory',15,10),('user2','CS F222',1,'Theory',15,10),('user2','CS F342',4,'Practical',15,10),('user2','CS F351',5,'Practical',15,10),('user2','CS F372',2,'Theory',15,10),('user3','CS F213',3,'Theory',15,10),('user3','CS F214',5,'Tutorial',15,10),('user3','CS F222',5,'Tutorial',15,10),('user3','CS F342',1,'Theory',15,10),('user3','CS F351',1,'Theory',15,10),('user3','CS F372',1,'Tutorial',15,10),('user4','CS F213',4,'IC',15,10),('user4','CS F214',2,'IC',15,10),('user4','CS F222',3,'IC',15,10),('user4','CS F342',3,'IC',15,10),('user4','CS F351',3,'IC',15,10),('user5','CS F213',5,'Instructor',15,10),('user5','CS F214',4,'Instructor',15,10),('user5','CS F222',2,'Instructor',15,10),('user5','CS F342',5,'Instructor',15,10),('user5','CS F351',4,'Instructor',15,10),('user5','CS F372',1,'Tutorial',10,1);
/*!40000 ALTER TABLE `FACULTYPREFERNCE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `USERS_DETAILS`
--

DROP TABLE IF EXISTS `USERS_DETAILS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USERS_DETAILS` (
  `users_id` varchar(255) NOT NULL,
  `users_name` varchar(255) DEFAULT NULL,
  `users_type` int DEFAULT NULL,
  `users_designation` varchar(255) DEFAULT NULL,
  `users_department` int DEFAULT NULL,
  `users_organization` varchar(255) DEFAULT NULL,
  `users_contact_no` int DEFAULT NULL,
  `users_email_id` varchar(255) DEFAULT NULL,
  `users_status` int DEFAULT NULL,
  `users_join_date` date DEFAULT NULL,
  `users_leaving_date` date DEFAULT NULL,
  `users_total_citations` int DEFAULT NULL,
  `users_h_index` int DEFAULT NULL,
  `users_i10_index` int DEFAULT NULL,
  `users_eigenfactor` int DEFAULT NULL,
  `users_h_index_norm` int DEFAULT NULL,
  `users_impact_factor` int DEFAULT NULL,
  `users_author_keywords` int DEFAULT NULL,
  `users_course` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`users_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `USERS_DETAILS`
--

LOCK TABLES `USERS_DETAILS` WRITE;
/*!40000 ALTER TABLE `USERS_DETAILS` DISABLE KEYS */;
INSERT INTO `USERS_DETAILS` VALUES ('user1','John Doe',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('user2','Jane Smith',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('user3','Michael Johnson',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('user4','Emily Davis',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('user5','Robert Brown',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `USERS_DETAILS` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-19  0:01:31
