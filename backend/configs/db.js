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
    dateStrings: true,
    timezone: '+07:00',

    // ✅ กัน connection ค้างบน cloud
    enableKeepAlive: true,       // ส่ง keep-alive ไม่ให้ connection ถูกตัดเงียบ ๆ
    keepAliveInitialDelay: 0,
    maxIdle: 5,                  // เก็บ connection ว่างไว้ไม่เกิน 5
    idleTimeout: 60000,          // ปิด connection ที่ว่างเกิน 60 วิ แล้วค่อยเปิดใหม่
    connectTimeout: 20000,       // ต่อไม่ได้ใน 20 วิ ให้ error แทนที่จะค้าง
});

// ทุก connection ใหม่ใน pool ให้ตั้ง session เป็นเวลาไทย
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