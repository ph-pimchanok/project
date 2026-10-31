const db = require('../configs/db')

// dashboard 1 

const findTotal_revenue = (callback) => {

    const sql = 
    `
        SELECT 
        -- [คำนวณยอดขาย] จำนวนสินค้า × ราคาขาย แล้วรวมทั้งหมด
            SUM(item.quantity * item.unit_price) AS today_total_amount,

            -- [คำนวณกำไร] จำนวนสินค้า × (ราคาขาย - ต้นทุน)
            -- แล้วรวมกำไรของสินค้าทุกรายการ
            SUM(item.quantity * (item.unit_price - item.cost_price)) AS today_total_profit
        
        FROM order_fulfillment_log f
        JOIN orders o ON f.order_id = o.order_id
        CROSS JOIN JSON_TABLE(
            f.items_snapshot,
            '$[*]' COLUMNS (
                quantity INT PATH '$.quantity',
                unit_price DECIMAL(10,2) PATH '$.unit_price',
                cost_price DECIMAL(10,2) PATH '$.cost_price'
            )
        ) AS item
        -- เลือกเฉพาะรายการที่ส่งสำเร็จและส่งในวันนี้

        WHERE f.delivery_date >= CURDATE() 
        AND f.delivery_date < CURDATE() + INTERVAL 1 DAY
        AND o.delivery_status = 'delivered';
    `
    db.query(sql , callback)
}


// 2. นับจำนวนออเดอร์ที่สร้างในวันนี้
const findTotal_orders = (callback) => {

    const sql = 
    ` -- [คำนวณ] COUNT ใช้นับจำนวนออเดอร์
        SELECT count(order_id) as count_order  
            FROM orders WHERE DATE(order_date) = CURDATE(); -- กรองเฉพาะออเดอร์ที่สร้างวันนี้
    `
    db.query(sql , callback)
}

// 3. นับจำนวนออเดอร์แยกตามสถานะ
const findOrder_status = (callback) => {

    const sql = 
    `
        SELECT 
            JSON_OBJECT(
                'pending', SUM(CASE WHEN delivery_status = 'pending' THEN 1 ELSE 0 END),
                'delivering', SUM(CASE WHEN delivery_status = 'delivering' THEN 1 ELSE 0 END),
                'delivered', SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END)
            ) AS order_status
            FROM orders 
            WHERE DATE(order_date) = CURDATE()
    `
    db.query(sql , callback)
}

// 4. คำนวณยอดขาย ต้นทุน และกำไรแยกตามเดือน
const yearly_revenue_chart = (callback) => {
    const sql = ` -- [คำนวณ] รวมจำนวนสินค้า × ราคาขาย
                -- [คำนวณ] รวมจำนวนสินค้า × ต้นทุนจากตาราง products
                -- [คำนวณ] รวมจำนวนสินค้า × (ราคาขาย - ต้นทุน)
            SELECT
                DATE_FORMAT(f.delivery_date, '%Y-%m') AS sale_month,
                COALESCE(SUM(item.quantity * item.unit_price), 0) AS total_revenue,
                COALESCE(SUM(item.quantity * p.cost_price), 0) AS total_cost,
                COALESCE(SUM(item.quantity * (item.unit_price - p.cost_price)), 0) AS total_profit
            FROM order_fulfillment_log f
            JOIN orders o 
                ON f.order_id = o.order_id 
            CROSS JOIN JSON_TABLE(
                f.items_snapshot,
                '$[*]' COLUMNS (
                    product_name VARCHAR(255) PATH '$.product_name',
                    quantity INT PATH '$.quantity',
                    unit_price DECIMAL(10,2) PATH '$.unit_price'
                )
            ) AS item
            LEFT JOIN products p 
                ON item.product_name COLLATE utf8mb4_unicode_ci = p.product_name COLLATE utf8mb4_unicode_ci
            WHERE o.delivery_status != 'cancelled' and o.delivery_status != 'delivering'
            GROUP BY DATE_FORMAT(f.delivery_date, '%Y-%m')
            ORDER BY sale_month ASC;
    `;
    db.query(sql, callback);
};

const findTotal_count = (callback) => {
    //  [คำนวณ] COUNT นับจำนวนสินค้าที่ตรงกับเงื่อนไข
    const sql = 
    `
        select count(product_id) as total_count from products where stock_qty <= 10
    `
    db.query(sql , callback)
}
// 6. ดึงรายละเอียดสินค้าที่มีสต็อกไม่เกิน 10 หน่วย
const findItem = (callback) => {

    const sql = 
    `
        select product_id , product_name , stock_qty , category from products where stock_qty <= 10
    `
    db.query(sql , callback)
}

// dashboard 2
// สรุปรายได้ต่อเดือน
const findmonthly_summary = (year, month, callback) => {

    const sql = 
    `
        SELECT 
        
            COALESCE(SUM(item.quantity * item.unit_price), 0) AS total_revenue,
            COALESCE(SUM(item.quantity * (item.unit_price - item.cost_price)), 0) AS total_profit,
            COUNT(ofl.order_id) AS total_delivered_orders
        FROM order_fulfillment_log ofl
        JOIN orders o 
            ON o.order_id = ofl.order_id
        CROSS JOIN JSON_TABLE(
            ofl.items_snapshot,
            '$[*]' COLUMNS (
                quantity INT PATH '$.quantity',
                unit_price DECIMAL(10,2) PATH '$.unit_price',
                cost_price DECIMAL(10,2) PATH '$.cost_price'
            )
        ) AS item
        WHERE o.delivery_status = 'delivered'
        AND YEAR(ofl.delivery_date) = ?
        AND MONTH(ofl.delivery_date) = ?
    `;
    
    db.query(sql, [year, month], callback);
};
// สรุปรายได้ต่อสัปดาห์
const findWeeklyBreakdown = (year, month, callback) => {
    const sql = `
        SELECT 
            week_num_raw,
            CONCAT(
                SUBSTRING(week_num_raw, 1, 4), 
                '-W', 
                SUBSTRING(week_num_raw, 5, 2)
            ) AS week,
            MIN(delivery_date) AS start_date,
            MAX(delivery_date) AS end_date,
            SUM(revenue) AS revenue,
            SUM(profit) AS profit
        FROM (
            SELECT 
                YEARWEEK(f.delivery_date, 3) AS week_num_raw,
                DATE(f.delivery_date) AS delivery_date,
                (item.quantity * item.unit_price) AS revenue,
                (item.quantity * (item.unit_price - item.cost_price)) AS profit
            FROM order_fulfillment_log f
            JOIN orders o ON o.order_id = f.order_id
            CROSS JOIN JSON_TABLE(
                f.items_snapshot,
                '$[*]' COLUMNS (
                    quantity INT PATH '$.quantity',
                    unit_price DECIMAL(10,2) PATH '$.unit_price',
                    cost_price DECIMAL(10,2) PATH '$.cost_price'
                )
            ) AS item
            WHERE o.delivery_status = 'delivered'
            AND YEAR(f.delivery_date) = ?
            AND MONTH(f.delivery_date) = ?
        ) AS sub
        GROUP BY week_num_raw
        ORDER BY week_num_raw ASC;
    `;
    
    db.query(sql, [year, month], callback);
};
// สินค้าขายดี เอา 3 อันดับแรก
const findBestSellers = (year, month, callback) => {
    const sql = `
        SELECT 
            p.product_id AS item_id,
            item.product_name AS name,
            SUM(item.quantity) AS quantity_sold,
            SUM(item.quantity * item.unit_price) AS revenue
        FROM order_fulfillment_log f
        JOIN orders o ON o.order_id = f.order_id
        CROSS JOIN JSON_TABLE(
            f.items_snapshot,
            '$[*]' COLUMNS (
                product_name VARCHAR(255) PATH '$.product_name',
                quantity INT PATH '$.quantity',
                unit_price DECIMAL(10,2) PATH '$.unit_price'
            )
        ) AS item
        LEFT JOIN products p 
            ON item.product_name COLLATE utf8mb4_unicode_ci = p.product_name COLLATE utf8mb4_unicode_ci
        WHERE o.delivery_status = 'delivered'
          AND YEAR(f.delivery_date) = ?
          AND MONTH(f.delivery_date) = ?
        GROUP BY p.product_id, item.product_name
        ORDER BY quantity_sold DESC
        LIMIT 3;
    `;
    db.query(sql, [year, month], callback);
};
// สินนค้าขายไม่ดี 3 อันดับแรก
const findWorstSellers = (year, month, callback) => {
    const sql = `
        SELECT 
            p.product_id AS item_id,
            p.product_name AS name,
            COALESCE(SUM(item.quantity), 0) AS quantity_sold,
            COALESCE(SUM(item.quantity * item.unit_price), 0) AS revenue
        FROM products p
        LEFT JOIN (
            SELECT f.delivery_date, o.delivery_status, j.product_name, j.quantity, j.unit_price
            FROM order_fulfillment_log f
            JOIN orders o ON o.order_id = f.order_id
            CROSS JOIN JSON_TABLE(
                f.items_snapshot,
                '$[*]' COLUMNS (
                    product_name VARCHAR(255) PATH '$.product_name',
                    quantity INT PATH '$.quantity',
                    unit_price DECIMAL(10,2) PATH '$.unit_price'
                )
            ) AS j
            WHERE o.delivery_status = 'delivered'
              AND YEAR(f.delivery_date) = ?
              AND MONTH(f.delivery_date) = ?
        ) AS item ON p.product_name COLLATE utf8mb4_unicode_ci = item.product_name COLLATE utf8mb4_unicode_ci
        GROUP BY p.product_id, p.product_name
        ORDER BY quantity_sold ASC, revenue ASC
        LIMIT 3;
    `;
    db.query(sql, [year, month], callback);
};

//ประวัติการจัดส่งที่ส่งสำเร็จ
const findDeliveredHistory = (year, month, callback) => {
    const sql = `
        SELECT 
            f.order_id AS order_id,
            DATE_FORMAT(f.delivery_date, '%Y-%m-%dT%H:%i:%sZ') AS delivered_at,
            c.customer_name AS customer_name,
            COUNT(item.quantity) AS items_count,
            SUM(item.quantity * item.unit_price) AS total_amount
        FROM order_fulfillment_log f
        JOIN orders o ON o.order_id = f.order_id
        JOIN customers c ON f.customer_id = c.customer_id
        CROSS JOIN JSON_TABLE(
            f.items_snapshot,
            '$[*]' COLUMNS (
                quantity INT PATH '$.quantity',
                unit_price DECIMAL(10,2) PATH '$.unit_price'
            )
        ) AS item
        WHERE o.delivery_status = 'delivered'
          AND YEAR(f.delivery_date) = ?
          AND MONTH(f.delivery_date) = ?
        GROUP BY f.order_id, f.delivery_date, c.customer_name
        ORDER BY f.delivery_date DESC;
    `;
    db.query(sql, [year, month], callback);
};
 
module.exports = {
    findTotal_revenue,
    findTotal_orders,
    findOrder_status,
    yearly_revenue_chart,
    findTotal_count,
    findItem,
    findmonthly_summary,
    findWeeklyBreakdown,
    findBestSellers,
    findWorstSellers,
    findDeliveredHistory
}