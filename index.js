const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const mysql = require('mysql');

const app = express();
const port = 3000;
const { getAuthToken, appendData } = require("./googleSheetsService.js");
// Multer middleware for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());

// MySQL database configuration
const db = mysql.createConnection({
    host: 'localhost', // Update with your MySQL server host
    user: 'root', // Update with your MySQL username
    password: 'password', // Update with your MySQL password
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
            if (err) {
                console.error('Error reconnecting to MySQL database:', err);
            } else {
                console.log('Reconnected to MySQL database');
            }
        });
    } else {
        throw err;
    }
});

app.get("/", (req, res) => {
    res.status(200).send("Welcome to CSIS API")
});

// Clear the COURSE table
app.post('/clear-course', (req, res) => {
    db.query('TRUNCATE TABLE course', (err, results) => {
        if (err) {
            console.error('Failed to clear COURSE table:', err);
            res.status(500).json({ error: 'Failed to clear COURSE table.' });
        } else {
            console.log('COURSE table cleared.');
            res.json({ message: 'COURSE table cleared.' });
        }
    });
});

// Upload Excel file and insert data into the COURSE table
app.post('/upload-course', upload.single('file'), (req, res) => {
    try {
        // Clear the COURSE table
        db.query('TRUNCATE TABLE COURSETAKEN', async (err, results) => {
            if (err) {
                console.error('Failed to clear COURSE table:', err);
                throw err;
            }

            console.log('DB has been cleared');

            // Parse the Excel file from memory buffer
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Insert data into the COURSE table
            const insertQueries = sheetData.map((row) => {
                return new Promise((resolve, reject) => {
                    db.query(
                        'INSERT INTO COURSE (courseid, coursename, programtype, coursetype, semester) VALUES (?, ?, ?, ?, ?)',
                        [row['COURSE NO'], row['COURSE TITLE'], row['ProgramType'], row['COURSETYPE'], row['SEMESTER']],
                        (err, results) => {
                            if (err) {
                                console.error('Failed to insert data:', err);
                                reject(err);
                            } else {
                                resolve(results);
                            }
                        }
                    );
                });
            });

            Promise.all(insertQueries)
                .then(() => {
                    res.json({ message: 'Data inserted into COURSE table.' });
                })
                .catch((error) => {
                    console.error('Failed to insert data into COURSE table:', error);
                    res.status(500).json({ error: 'Failed to insert data into COURSE table.' });
                });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to insert data into COURSE table.' });
    }
});

app.post("/allot-course", async (req, res) => {
    try {
        const query = `
    SELECT *
    FROM FACULTYPREFERNCE
    ORDER BY course_code, preference
  `;
        db.query(query, async (err, results) => {
            if (err) {
                console.error('Error querying the database:', err);
                res.status(500).json({ error: err });;
            }

            // Step 2: Initialize variables to track allocated courses and roles
            const allocatedCourses = new Set();
            const allocatedRoles = new Set();

            // Step 3: Iterate through the sorted preferences and allocate courses
            results.forEach(async (preferences) => {
                const { faculty_id, course_code, preference, facultyrole, totalnoofcsstudnets, totalnootherdisciplinestudents } = preferences;

                const auth = await getAuthToken();
                const finalwrite =[]
                // Check if the role is already allocated for this course
                if (!allocatedRoles.has(`${course_code}-${facultyrole}`)) {
                    // Allocate the course to the faculty
                    console.log(`Allocating ${course_code} to ${faculty_id} with role ${facultyrole}`);
                    allocatedCourses.add(course_code);
                    allocatedRoles.add(`${course_code}-${facultyrole}`);
                    const data = [faculty_id,course_code, facultyrole, totalnoofcsstudnets, totalnootherdisciplinestudents];
                    finalwrite.push(data)
                }
                
                appendData(auth, finalwrite);
            });
            res.status(201).json({ message: "Course allocation done" })
        })
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to create sample ALLOC statement' });
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});