const mysql = require('mysql');
// MySQL database configuration
const db = mysql.createConnection({
    multipleStatements: true,
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
            if (err)
                console.error('Error reconnecting to MySQL database:', err);
            else 
                console.log('Reconnected to MySQL database');
        });
    } else console.error(err);
});

module.exports = { db };