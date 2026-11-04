const productModel = require('../models/productModel');
const ApiError =require('../utils/ApiError');

const findAllProduct =async()=>{
    return new Promise ((success,fail)=>{
        productModel.findAllProduct((error,results)=>{
            if(error){return fail(error)}

            success({
                success:true,
                message:"Products retrived Successfully",
                data:results
            })
        })
    })
}

const createProduct = async(productdata)=>{
    return new Promise((success,fail)=>{
        productModel.findDuplicateProduct(productdata,(error,rows)=>{
            if(error){return fail(error)}
            // ที่เพิ่มมาแก้สต้อคซ้ำ
            if (rows.length > 0) {
                return fail(new ApiError(409, "มีสินค้านี้ที่ราคาทุนและราคาขายเดียวกันอยู่แล้ว"));
            }
            productModel.createProduct(productdata, (error, results) => {
                if (error) { return fail(error) }

                success({
                    success:true,
                    message:"Product created Successfully",
                    data:results
                })
            })
        })
    })
}

const updateProduct =async(productdata,product_id)=>{
    return new Promise ((success,fail)=>{
        productModel.updateProduct(productdata,product_id,(error,results)=>{
            if(error){return fail(error)}

            success({
                success:true,
                message:"Product updated Successfully",
                data:results
            })

        })
    })
}

const deleteProduct = async(product_id)=>{
    return new Promise((success,fail)=>[
        productModel.deleteProduct(product_id,async(error,results)=>{
            if(error){return fail(error)}

            success({
                success:true,
                message:"Product deleted successfully "
            })
        })
    ])
}

module.exports={
    findAllProduct,
    createProduct,
    updateProduct,
    deleteProduct
}