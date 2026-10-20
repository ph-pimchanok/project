const mysql = require("mysql2");


const db = mysql.createPool({

    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true 
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database: ', err);
    } else {
        console.log('Connected to the database successfully via Connection Pool!');
        connection.release();
    }
});

module.exports = db;