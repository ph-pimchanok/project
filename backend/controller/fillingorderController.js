const fillingOrderService = require('../services/fillingorderService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const cloudinary = require('cloudinary').v2;

// ตั้งค่า Cloudinary ให้เหมือนกับฝั่ง orderController
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.findAllFillingOrder = asyncHandler(async (req, res, next) => {
    const result = await fillingOrderService.findALlFillingOrder();
    res.status(200).json(result);
});

exports.createFillingOrder = asyncHandler(async (req, res, next) => {
    const { order_date, imageBase64 } = req.body;

    if (!order_date) {
        return next(new ApiError(400, "order_date is required"));
    }

    let imagePath = null;

    if (imageBase64) {
        try {
            // 1. ตัด Header เก่าออก (ถ้ามี) แล้วแปลงเป็น Data URI ที่ Cloudinary รองรับแน่นอน 100%
            const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const dataUri = `data:image/jpeg;base64,${cleanBase64}`;

            // 2. ส่ง Data URI ขึ้น Cloudinary (เก็บไว้ในโฟลเดอร์ filling-proofs)
            const uploadResponse = await cloudinary.uploader.upload(dataUri, {
                folder: 'filling-proofs',
            });

            // 3. ดึง Secure URL (ลิงก์เต็ม) มาเก็บบันทึก
            imagePath = uploadResponse.secure_url;
        } catch (error) {
            console.error("Cloudinary Error Details:", error);
            const errorMsg = error?.message || error?.error?.message || JSON.stringify(error);
            return next(new ApiError(500, `ไม่สามารถอัปโหลดรูปภาพได้: ${errorMsg}`));
        }
    }

    const fillingData = {
        order_date,
        imageUrl: imagePath
    };

    const result = await fillingOrderService.createFillingOrder(fillingData);
    res.status(201).json(result);
});

exports.deleteFillingOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ApiError(400, "id not found"));
    }

    const result = await fillingOrderService.deletefillingOrder(id);
    res.status(200).json(result);
});