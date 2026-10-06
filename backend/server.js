require('dotenv').config();
const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const path = require('path');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors())
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = require('./configs/db')

const notfound = require('./middlewares/notfound')
const errorHandler = require('./middlewares/errorHandler')

//routes 
const authRouter =require('./routers/authRouter')
const customerRouter =require('./routers/customerRouter')
const orderRouter =require('./routers/orderRouter')
const employeeRouter=require('./routers/employeeRouter')
const productRouter=require('./routers/productRouter')
const vehicleRouter=require('./routers/vehicleRouter')
const vehiclebrandRouter=require('./routers/vehiclebrandRouter')
const cylinderdepositRouter=require('./routers/cylinderdepositRouter')
const order_itemRouter =require('./routers/order_itemRoute')
const fillingorderRouter =require('./routers/fillingorderRouter')
const maintenenceRouter =require('./routers/maintenenceRouter')
const historyOrderRouter = require('./routers/historyOrderRouter')
const dashboardRouter = require('./routers/dashboardRouter')
const locationRouter = require('./routers/locationRouter')

//กำหนดชื่อ api
app.use('/api/auth',authRouter)
app.use('/api/customer',customerRouter)
app.use('/api/order',orderRouter)
app.use('/api/employee',employeeRouter)
app.use('/api/product',productRouter)
app.use('/api/vehicle',vehicleRouter)
app.use('/api/vehiclebrand',vehiclebrandRouter)
app.use('/api/cylinderdeposit',cylinderdepositRouter)
app.use('/api/order_item',order_itemRouter)
app.use('/api/fillingorder',fillingorderRouter)
app.use('/api/maintenence',maintenenceRouter)
app.use('/api/historyOrder', historyOrderRouter)
app.use('/api/dashboard' , dashboardRouter)
app.use('/api/location' , locationRouter)

app.use(notfound)
app.use(errorHandler)

// 2. สร้าง HTTP Server ครอบ Express app และตั้งค่า Socket.io
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

// 3. ผูก io ไว้กับ app เพื่อให้ดึงไปใช้ใน Controller ได้ผ่าน req.app.get('io')
app.set('io', io)

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`)
    })
})

const port = process.env.port || 5000

// 4. เปลี่ยนจาก app.listen มาเป็น server.listen แทน
server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

process.on('unhandledRejection', (err, promise) => {
    console.log(`Logged Error: ${err}`)
    server.close(() => process.exit(1))
})