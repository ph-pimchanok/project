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
    dateStrings: true ,
    timezone: '+07:00'
});
// ② ทุก connection ใหม่ใน pool ให้ตั้ง session เป็นเวลาไทย → NOW() / CURRENT_TIMESTAMP ถูก
db.on('connection', (connection) => {
    connection.query("SET time_zone = '+07:00'");
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