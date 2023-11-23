const express = require("express");
const { db } = require("../db");
const taRouter = express.Router();

taRouter.post("/submit-preference,", (req, res) => {
	const {
		student_id,
		email,
		name,
		cgpa,
		cat,
		coursepreference1,
		coursepreference2,
		coursepreference3,
		coursepreference4,
		coursepreference5,
		grade1,
		grade2,
		grade3,
		grade4,
		grade5,
		status,
		recordtimestamp,
		semid,
	} = req.body;

    // Validate required fields

    if (!email || !student_id || !name || !cgpa || !coursepreference1 || !grade1) {
		return res.status(400).json({
			error: "Missing required fields",
		});
	}

    let insertQuery = `
        INSERT INTO TACOURSEPREFERENCE (
            student_id,
            email,
            name,
            cgpa,
            cat,
            coursepreference1,
            coursepreference2,
            coursepreference3,
            coursepreference4,
            coursepreference5,
            grade1,
            grade2,
            grade3,
            grade4,
            grade5,
            status,
            recordtimestamp,
            semid,
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let values = [
		student_id,
        email,
        name,
        cgpa,
        cat,
        coursepreference1,
        coursepreference2,
        coursepreference3,
        coursepreference4,
        coursepreference5,
        grade1,
        grade2,
        grade3,
        grade4,
        grade5,
        status,
        recordtimestamp,
        semid
	];

	db.query(insertQuery, values, (err, result) => {
		if (err) {
			console.error("Error inserting into TACOURSEPREFERENCE:", err);
			return res.status(500).json({
				error: "Failed to add TA Course preference" + err.sqlMessage,
			});
		}

		console.log("New entry added to TACOURSEPREFERENCE:", result.insertId);
	});
});

taRouter.get("/get-allotment,", (req, res) => {
    const {
        email
	} = req.body;


    res.status(200).json({
        message: "TA Allotment fetched successfully",
    });
});

taRouter.post("/allot-course", (req, res) => {
//     try {
// 		const query = `
//     SELECT *
//     FROM
//   `;

});

taRouter.post("/send-email", (req, res) => {
    //     try {
    // 		const query = `
    //     SELECT *
    //     FROM
    //   `;
    
    });    

module.exports = taRouter;
