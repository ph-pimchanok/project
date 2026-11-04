const db = require('../configs/db')

const findAllProduct = async (callback) => {
    const sql = "SELECT * FROM products"
    db.query(sql, callback);
}
const findProductById = (product_id, callback) => {

    const sql = 'select product_name , cost_price from products where product_id = ?'

    db.query(sql ,product_id, callback)
}

const createProduct = async (productdata, callback) => {
    const sql = "INSERT INTO products set ?"
    db.query(sql, productdata, callback);
}

const updateProduct = async (productdata, product_id, callback) => {
    const sql = "UPDATE products set ? where product_id= ?"
    db.query(sql, [productdata, product_id], callback);
}

const deleteProduct = async (product_id, callback) => {
    const sql = "DELETE from products where product_id= ?"
    db.query(sql, [product_id], callback);
}

const checkStock = (items, callback) => {
    if (!items || items.length === 0) {
        return callback(null, { sufficient: true, insufficient_items: [] });
    }

    const product_ids = items.map((item) => item.product_id);
    const sql = `SELECT product_id, stock_qty FROM products WHERE product_id IN (?)`;

    db.query(sql, [product_ids], (error, rows) => {
        if (error) return callback(error);

        const stockMap = {};
        rows.forEach((row) => {
            stockMap[row.product_id] = row.stock_qty;
        });

        const insufficient_items = [];

        items.forEach((item) => {
            const available = stockMap[item.product_id];

            if (available === undefined) {
                insufficient_items.push({
                    product_id: item.product_id,
                    requested: item.quantity,
                    available: 0,
                    reason: "product not found"
                });
            } else if (available < item.quantity) {
                insufficient_items.push({
                    product_id: item.product_id,
                    requested: item.quantity,
                    available,
                    reason: "insufficient stock"
                });
            }
        });

        callback(null, {
            sufficient: insufficient_items.length === 0,
            insufficient_items
        });
    });
};

const updateStock = (items, callback) => {
    if (!items || items.length === 0) {
        return callback(null);
    }

    let completed = 0;
    let hasError = false;

    items.forEach((item) => {
        const sql = `
            UPDATE products 
            SET stock_qty = stock_qty - ? 
            WHERE product_id = ? AND stock_qty >= ?
        `;

        db.query(sql, [item.quantity, item.product_id, item.quantity], (error, results) => {
            if (hasError) return;

            if (error) {
                hasError = true;
                return callback(error);
            }

            // ถ้า affectedRows เป็น 0 แปลว่าสต็อกไม่พอ (WHERE stock_qty >= ? ไม่ผ่าน)
            if (results.affectedRows === 0) {
                hasError = true;
                return callback(new Error(`สินค้า ID ${item.product_id} สต็อกไม่เพียงพอ`));
            }

            completed++;
            if (completed === items.length) {
                callback(null, results);
            }
        });
    });
};

const increaseStock = (product_id, quantity, callback) => {

    const sql = `UPDATE products SET stock_qty = stock_qty + ? WHERE product_id = ?`;
    db.query(sql, [quantity, product_id], callback);
};

const decreaseStock = (product_id, quantity, callback) => {

    const sql = `UPDATE products SET stock_qty = stock_qty - ? WHERE product_id = ? AND stock_qty >= ?`;
    
    db.query(sql, [quantity, product_id, quantity], (error, results) => {
        if (error) return callback(error);
        if (results.affectedRows === 0) {
            return callback(new Error(`สินค้า ID ${product_id} สต็อกไม่เพียงพอ`));
        }
        callback(null, results);
    });
};
// ที่แก้เพิ่มสต้อกซ้ำ
const findDuplicateProduct = (productdata, callack) => {
    const sql = `
        SELECT product_id FROM products
        WHERE product_name = ? AND cost_price = ? AND current_price = ?
    `;
    db.query(sql, [productdata.product_name, productdata.cost_price, productdata.current_price], callback);
}
module.exports = {
    findAllProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    checkStock,
    updateStock,
    increaseStock,
    decreaseStock,
    findProductById,
    findDuplicateProduct
}