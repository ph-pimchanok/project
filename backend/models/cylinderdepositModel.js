const db=require('../configs/db');

const bulkCreateDeposite = async(cylinderdepositdata,callback)=>{
    const sql=`
        insert into cylinder_deposit(customer_id,product_id,order_id,qty_out,qty_return,deposit_date)
        values ?
    `
    db.query(sql,[cylinderdepositdata],callback)
}

const findAllCylinderdeposit = async(callback)=>{
    const sql=`select cd.deposit_id , c.customer_name ,cd.product_id, p.product_name , cd.qty_out , cd.qty_return , cd.deposit_date from cylinder_deposit cd
	join customers c
		on cd.customer_id = c.customer_id
			join products p
				on cd.product_id = p.product_id
                where p.category like '%gas%'`
    db.query(sql,callback);
}

const updateCylinderdeposit =async(deposit_id,qty_return,callback)=>{
    const sql=`
    update cylinder_deposit 
    set qty_return =?
    where deposit_id = ?
    `
    db.query(sql,[qty_return,deposit_id],callback);
}
const deleteCylinderdeposit =async(order_id,callback)=>{
    const sql="DELETE from cylinder_deposit where order_id = ?"
    db.query(sql,[order_id],callback);
}

module.exports={
    bulkCreateDeposite,
    findAllCylinderdeposit,
    updateCylinderdeposit,
    deleteCylinderdeposit
}