const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const pgp = require('pg-promise')();
const db = pgp('postgres://username:password@localhost:5432/yourdbname'); // Update with your database details

const app = express();
const port = 3000;

// Multer middleware for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());

app.get("/",(req,res)=>{
    res.status(200).send("Welcome to CSIS API")
})
// Clear the COURSE table
app.post('/clear-course', async (req, res) => {
    try {
        await db.none('DELETE FROM course');
        res.json({ message: 'COURSE table cleared.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear COURSE table.' });
    }
});

// Upload Excel file and insert data into the COURSE table
app.post('/upload-course', upload.single('file'), async (req, res) => {
    try {
        // Parse the Excel file from memory buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Insert data into the COURSE table
        const insertQueries = sheetData.map((row) => {
            return db.none('INSERT INTO course (courseid, coursename, programtype, coursetype, semester) VALUES ($1, $2, $3, $4, $5)',
                [row['COURSE NO'], row['COURSE TITLE'], row['ProgramType'], row['COURSETYPE'], row['SEMESTER']]);
        });

        await Promise.all(insertQueries);

        res.json({ message: 'Data inserted into COURSE table.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to insert data into COURSE table.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
