const express = require("express");
const { db } = require("../db");
const taRouter = express.Router();

taRouter.post("/allot-ta", async (req, res) => {
  try {
    const subQuery = `
    SELECT * FROM TACOURSEPREFERENCE
    `;
    db.query(subQuery, async (err, results) => {
      if (err) {
        console.error("Error updating the database:", err);
        res.status(500).json({
          error: "Data could not be fetched from table" + err.sqlMessage,
        });
      }
      let coursePreferences = results;
      const courseBuckets = {};
      const updatedCoursePreferences = coursePreferences.map((row) => {
        const newRow = { ...row };
        newRow.grade1 = (parseInt(newRow.grade1) || 0) - 1;
        newRow.grade2 = (parseInt(newRow.grade2) || 0) - 2;
        newRow.grade3 = (parseInt(newRow.grade3) || 0) - 3;
        newRow.grade4 = (parseInt(newRow.grade4) || 0) - 4;
        newRow.grade5 = (parseInt(newRow.grade5) || 0) - 5;
        return newRow;
      });

      // now create course buckets
      updatedCoursePreferences.forEach((row) => {
        const sid = row.student_id;
        const cg = row.cgpa;

        for (let i = 1; i <= 5; i++) {
          const coursePreference = `coursepreference${i}`;
          const course = row[coursePreference];
          if(course!=null){

            const gradeNum = `grade${i}`
            const gradePoint = row[gradeNum]
            if (!courseBuckets[course]) {
              courseBuckets[course] = [];
            }
            
            courseBuckets[course].push({
              sid,
              cg,
              gradePoint
            });
          }
        }
      });

      // console.log(courseBuckets)
      const sortedCourseBuckets = Object.fromEntries(
        Object.entries(courseBuckets).sort((a, b) => a[1].length - b[1].length)
      );

      // console.log("Sorted Course Buckets",sortedCourseBuckets);
      
      const allottedCourses = {};
      for (const course in sortedCourseBuckets) {
        const students = sortedCourseBuckets[course];
        students.sort((a, b) => {
          if (a.gradePoint !== b.gradePoint) {
            return b.gradePoint - a.gradePoint;
          } else {
            return b.cg - a.cg;
          }
        });
        const allottedStudents = students.slice(0, 5); // Limit to maximum 5 TAs per course
        console.log("Top 5 students here", allottedStudents)
        allottedCourses[course] = allottedStudents;

        // Remove allotted students from the course bucket
        allottedStudents.forEach((student) => {
          for (const course in sortedCourseBuckets) {
            const studentsInCourse = sortedCourseBuckets[course];
            const index = studentsInCourse.findIndex((s) => s.sid === student.sid);
            if (index !== -1) {
              studentsInCourse.splice(index, 1);
            }
          }
        });
      }

      console.log(allottedCourses);
      res.status(201).json({
        message: 'TA allocation done'
    })
    })
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to create sample TAALLOC statement",
    });
  }
});

module.exports = taRouter;
