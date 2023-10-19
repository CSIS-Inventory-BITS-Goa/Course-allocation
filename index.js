const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const mysql = require('mysql');

const app = express();
const port = 3000;
const {
    getAuthToken,
    appendData
} = require('./googleSheetsService.js');

// Multer middleware for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage
});

app.use(express.json());

// MySQL database configuration
const db = mysql.createConnection({
    multipleStatements: true,
    host: 'localhost', // Update with your MySQL server host
    user: 'root', // Update with your MySQL username
    password: 'Password@123', // Update with your MySQL password
    database: 'testdb', // Update with your MySQL database name
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Handle MySQL disconnects
db.on('error', (err) => {
    console.error('MySQL database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        db.connect((err) => {
            if (err)
                console.error('Error reconnecting to MySQL database:', err);
            else 
                console.log('Reconnected to MySQL database');
        });
    } else console.error(err);
});

// Algortithm specific constants
let programTypes = new Set(['OnCampus', 'WILP']);
let courseClear = 'SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE COURSE; SET FOREIGN_KEY_CHECKS = 1;'

app.get('/', (req, res) => {
    res.status(200).send('Welcome to CSIS Course Allocation API 🚀')
});

// Clear the COURSE table
app.post('/clear-course', (req, res) => {
    db.query(courseClear, (err, results) => {
        if (err) {
            console.error('Failed to clear COURSE table', err);
            res.status(500).json({
                error: 'Failed to clear COURSE table' + err.sqlMessage
            });
        } else {
            console.log('COURSE table cleared.');
            res.json({
                message: 'COURSE table cleared.'
            });
        }
    });
});

// Upload Excel file and insert data into the COURSE table
app.post('/upload-course', upload.single('file'), (req, res) => {
    try {
        // Clear the COURSE table
        db.query('TRUNCATE TABLE COURSETAKEN', async (err, results) => {
            if (err) 
                console.error('Failed to clear COURSE table:', err.sqlMessage);
            else console.log('Database cleared');

            // Parse the Excel file from memory buffer
            const workbook = xlsx.read(req.file.buffer, {
                type: 'buffer'
            });
            const sheetName = workbook.SheetNames[0];
            const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Insert data into the COURSE table
            const insertQueries = sheetData.map((row) => {
                return new Promise((resolve, reject) => {
                    if (programTypes.has(row['ProgramType'])) {
                        db.query(
                            'INSERT INTO COURSE (courseid, coursename, programtype, coursetype, semester) VALUES (?, ?, ?, ?, ?)',
                            [row['COURSE NO'], row['COURSE TITLE'], row['ProgramType'], row['COURSETYPE'], row['SEMESTER']],
                            (err, results) => {
                                if (err) {
                                    console.error('Failed to insert data:', err);
                                    reject(err);
                                } else 
                                    resolve(results);
                            }
                        );
                    } else {

                        reject(`data ${row['COURSE NO']}, ${row['COURSE TITLE']}, because of ${row['ProgramType']}`);
                    }
                });
            });

            failing = [];
            Promise.allSettled(insertQueries)
                .then((results) => {
                    const failedPromises = results.filter((result) => result.status === 'rejected');
                    if (failedPromises.length > 0) {
                        failedPromises.forEach((promise) => {
                            console.error('Failed to insert data into COURSE table:', promise.reason);
                            failing.push(`Invalid ${promise.reason}`);
                        });

                        db.query(courseClear, async (err, results) => {
                            if (err) {
                                console.error('Failed to clear COURSE table:', err);
                                res.status(500).json({
                                    error: 'Failed to clear COURSE table' + err.sqlMessage
                                });
                            }
                            else{ 
                                console.log('Database cleared');
                                res.status(200).json({
                                    message : failing
                                });
                            }
                        });
                       
                    } else {
                        console.log('Data inserted into COURSE table.');
                        res.status(201).json({
                            message: 'Data inserted into COURSE table.'
                        });
                    }
                });


        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to insert data into COURSE table.'
        });
    }
});

app.post('/allot-course', async (req, res) => {
    try {
        const query = `
    SELECT *
    FROM FACULTYPREFERNCE
    ORDER BY course_code, preference
  `;
        db.query(query, async (err, results) => {
            if (err) {
                console.error('Error querying the database:', err);
                res.status(500).json({
                    error: 'Data could not be fetched from table' + err.sqlMessage
                });;
            }

            // Step 2: Initialize variables to track allocated courses and roles
            const allocatedFaculty = new Set();
            const allocatedRoles = new Set();

            // Step 3: Iterate through the sorted preferences and allocate courses
            const finalwrite = []
            const auth = await getAuthToken();
            results.forEach((preferences) => {
                const {
                    faculty_id,
                    course_code,
                    preference,
                    facultyrole,
                    totalnoofcsstudnets,
                    totalnootherdisciplinestudents
                } = preferences;


                // Check if the role is already allocated for this course
                if (!allocatedRoles.has(`${course_code}-${facultyrole}`) && !allocatedFaculty.has(`${faculty_id}-${facultyrole}`)) {
                    // Allocate the course to the faculty
                    console.log(`Allocating ${course_code} to ${faculty_id} with role ${facultyrole}`);
                    allocatedFaculty.add(`${faculty_id}-${facultyrole}`);
                    allocatedRoles.add(`${course_code}-${facultyrole}`);
                    const data = [faculty_id, course_code, facultyrole, totalnoofcsstudnets, totalnootherdisciplinestudents];
                    finalwrite.push(data)
                }

            });
            appendData(auth, finalwrite);
            res.status(201).json({
                message: 'Course allocation done'
            })
        })
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to create sample ALLOC statement'
        });
    }
})

app.post('/add-faculty-preference', (req, res) => {

    const {
        course_id,
        author_id,
        course_code,
        preference,
        facultyrole,
        totalnoofcsstudnets,
        totalnootherdisciplinestudents,
        comments,
        status,
        recordtimestamp
    } = req.body;

    let faculty_id = author_id;

    // Validate required fields
    if (!faculty_id || !course_code || !preference || !facultyrole) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }

    // Insert new entry into FACULTYPREFERNCE table
    let insertQuery = `
        INSERT INTO FACULTYPREFERNCE (
            faculty_id,
            course_code,
            preference,
            facultyrole,
            totalnoofcsstudnets,
            totalnootherdisciplinestudents
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;


    let values = [
        faculty_id,
        course_code,
        preference,
        facultyrole,
        totalnoofcsstudnets || null,
        totalnootherdisciplinestudents || null,
    ];

    db.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error('Error inserting into FACULTYPREFERNCE:', err);
            return res.status(500).json({
                error: 'Failed to add faculty preference' + err.sqlMessage
            });
        }

        console.log('New entry added to FACULTYPREFERNCE:', result.insertId);
    });

    insertQuery = `
    INSERT INTO COURSEPREFERENCE(
        courseid,
        authorid,
        facultyrole,
        totalnoofcsstudnets,
        totalnootherdisciplinestudents,
        comments,
        preferences,
        status,
        recordtimestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    values = [
        course_id,
        author_id,
        facultyrole,
        totalnoofcsstudnets || null,
        totalnootherdisciplinestudents || null,
        comments || null,
        preference,
        status,
        recordtimestamp
    ];

    db.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error('Error inserting into COURSEPREFERENCE:', err);
            return res.status(500).json({
                error: 'Failed to add course preference' + err.sqlMessage
            });
        }

        console.log('New entry added to COURSEPREFERENCE:', result.insertId);
        res.status(201).json({
            message: 'Course preference added successfully'
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});