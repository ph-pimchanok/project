const db = require('../configs/db')

const createOrder = async (orderdata, callback) => {
    const sql = "INSERT INTO orders set ?"
    db.query(sql, orderdata, callback);
}

const updateOrder_Decrement = (order_id, total_amount, callback) => {
    const sql = "UPDATE orders set total_amount = total_amount - ? where order_id =?"
    db.query(sql, [total_amount, order_id], callback)
}
const updateOrder_Increment = (order_id, total_amount, callback) => {
    const sql = "UPDATE orders set total_amount = total_amount + ? where order_id =?"
    db.query(sql, [total_amount, order_id], callback)
}

const findAllOrder = (callback) => {
    const sql = `SELECT o.order_id, c.customer_name, o.total_amount, o.delivery_status, o.order_date 
                FROM orders o
                JOIN customers c 
                    ON o.customer_id = c.customer_id 
                WHERE o.order_date >= CURDATE() 
                AND o.order_date < CURDATE() + INTERVAL 1 DAY 
                ORDER BY o.order_date DESC;`
    db.query(sql, callback)
}
const updatetotal_amount = (order_id, amount, callback) => {

    const sql = "update orders set total_amount = total_amount - ? where order_id = ?"
    db.query(sql, [amount, order_id], callback)

}
const deleteOrder = (order_id, callback) => {
    const sql = "delete from orders where order_id = ?"
    db.query(sql, order_id, callback)
}
const delivery_status = (order_id, callback) => {
    const sql = "select delivery_status from orders where order_id = ?"
    db.query(sql, order_id, callback)
}

const findOrderbyStatus = (callback) => {

    const sql =
        `
        SELECT o.order_id, c.address, o.order_date, o.total_amount, o.delivery_status, e.name
        FROM orders o
        JOIN customers c
            ON o.customer_id = c.customer_id
        LEFT JOIN vehicles v
            ON o.vehicle_id = v.vehicle_id
        LEFT JOIN employees e
            ON v.vehicle_id = e.vehicle_id
        WHERE o.order_date >= CURDATE() 
        AND o.order_date < CURDATE() + INTERVAL 1 DAY
        ORDER BY o.order_date DESC;
    `
    db.query(sql, callback)
}

const updateOrderVehicle = (order_id, vehicle_id, callback) => {

    const sql = "update orders set vehicle_id = ? where order_id in (?)"

    db.query(sql, [vehicle_id, order_id], callback)
}

const updateOrderStatus = (order_ids, status, callback) => {

    const sql = "update orders set delivery_status = ? where order_id in (?)"
    db.query(sql, [status, order_ids], callback);
}

const findOrdertodayByVehicle = (vehicle_id, callback) => {

    const sql = `
        select o.order_id , o.order_date ,o.total_amount ,
	        o.delivery_status , c.customer_name ,  c.phone , c.address , c.delivery_note ,c.latitude,c.longitude
                from orders o
		            join customers c 
			                    on o.customer_id = c.customer_id
		                where vehicle_id = ? 
			                AND o.order_date >= CURDATE()
    `
    db.query(sql, vehicle_id, callback)
}

const findOneOrder = (order_id, callback) => {

    const sql =
        `
        select o.order_id , o.order_date , o.delivery_status ,c.customer_name, c.phone,c.address , c.delivery_note, c.latitude , c.longitude from orders o
	            join customers c 
		    on o.customer_id = c.customer_id where order_id = ?
    `

    db.query(sql, order_id, callback)
}

const uploadImage = (order_id , imagePath , payment_method, callback) => {

    const sql = `update orders set imageUrl = ?, payment_method = ? where order_id = ?`

    db.query(sql , [imagePath, payment_method, order_id]  , callback)
}

const cancelOrder = (order_id, callback) => {

    const sql =
        `
        update orders set delivery_status = 'cancelled' where order_id = ?;
    `
    db.query(sql, order_id, callback)
}

const findOrderCount = (vehicle_id, callback) => {
    const sql = `
        SELECT count(order_id) as order_delivering 
        FROM orders 
        WHERE vehicle_id = ? 
        AND delivery_status = 'delivering'
    `;

    db.query(sql, [vehicle_id], callback);
}

module.exports = {
    createOrder,
    updateOrder_Decrement,
    updateOrder_Increment,
    findAllOrder,
    updatetotal_amount,
    deleteOrder,
    delivery_status,
    findOrderbyStatus,
    updateOrderVehicle,
    updateOrderStatus,
    findOrdertodayByVehicle,
    findOneOrder,
    uploadImage,
    cancelOrder,
    findOrderCount
}