require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();

// ===== CORS (ต้องอยู่บนสุด ก่อนทุกอย่าง) =====
const allowedOrigins = [
  'https://project-beta-sable-44.vercel.app', // ใส่โดเมน Vercel จริง ไม่มี / ท้าย
];

const corsOptions = {
  origin: (origin, callback) => {
    // อนุญาต: ไม่มี origin (Postman, แอปมือถือ), localhost ทุกพอร์ต, โดเมนในรายการ
    if (
      !origin ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = require('./configs/db');

const notfound = require('./middlewares/notfound');
const errorHandler = require('./middlewares/errorHandler');

// routes
const authRouter = require('./routers/authRouter');
const customerRouter = require('./routers/customerRouter');
const orderRouter = require('./routers/orderRouter');
const employeeRouter = require('./routers/employeeRouter');
const productRouter = require('./routers/productRouter');
const vehicleRouter = require('./routers/vehicleRouter');
const vehiclebrandRouter = require('./routers/vehiclebrandRouter');
const cylinderdepositRouter = require('./routers/cylinderdepositRouter');
const order_itemRouter = require('./routers/order_itemRoute');
const fillingorderRouter = require('./routers/fillingorderRouter');
const maintenenceRouter = require('./routers/maintenenceRouter');
const historyOrderRouter = require('./routers/historyOrderRouter');
const dashboardRouter = require('./routers/dashboardRouter');
const locationRouter = require('./routers/locationRouter');

// health check ไว้ทดสอบว่า server ยังทำงานอยู่
app.get('/', (req, res) => res.json({ status: 'ok' }));

// กำหนดชื่อ api
app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/order', orderRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/product', productRouter);
app.use('/api/vehicle', vehicleRouter);
app.use('/api/vehiclebrand', vehiclebrandRouter);
app.use('/api/cylinderdeposit', cylinderdepositRouter);
app.use('/api/order_item', order_itemRouter);
app.use('/api/fillingorder', fillingorderRouter);
app.use('/api/maintenence', maintenenceRouter);
app.use('/api/historyOrder', historyOrderRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/location', locationRouter);

app.use(notfound);
app.use(errorHandler);

// HTTP Server + Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ผูก io ไว้กับ app เพื่อให้ดึงไปใช้ใน Controller ได้ผ่าน req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 5000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

// log error ไว้ดู แต่ "ไม่ปิด server"
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});