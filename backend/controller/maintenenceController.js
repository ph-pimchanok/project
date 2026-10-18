const maintenenceService = require('../services/maintenenceService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const cloudinary = require('cloudinary').v2;

// ตั้งค่า Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.findAllMaintenance = asyncHandler(async (req, res, next) => {
    const result = await maintenenceService.findAllMaintenance();
    res.status(200).json(result);
});

exports.createMaintenance = asyncHandler(async (req, res, next) => {
    const { received_date, imageBase64 } = req.body;

    if (!received_date) {
        return next(new ApiError(400, "received_date is required"));
    }

    let imagePath = null;

    if (imageBase64) {
        try {
            // 1. ทำความสะอาด Base64 และแปลงเป็น Data URI
            const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const dataUri = `data:image/jpeg;base64,${cleanBase64}`;

            // 2. อัปโหลดรูปภาพขึ้น Cloudinary (เก็บไว้ในโฟลเดอร์ maintenance-proofs)
            const uploadResponse = await cloudinary.uploader.upload(dataUri, {
                folder: 'maintenance-proofs',
            });

            // 3. ดึง Secure URL (ลิงก์เต็ม) มาใช้งาน
            imagePath = uploadResponse.secure_url;
        } catch (error) {
            console.error("Cloudinary Error Details:", error);
            const errorMsg = error?.message || error?.error?.message || JSON.stringify(error);
            return next(new ApiError(500, `ไม่สามารถอัปโหลดรูปภาพได้: ${errorMsg}`));
        }
    }

    const maintenanceData = {
        received_date,
        imageUrl: imagePath
    };

    const result = await maintenenceService.createMaintenance(maintenanceData);
    res.status(201).json(result);
});

exports.deleteMaintenance = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ApiError(400, "id not found"));
    }

    const result = await maintenenceService.deleteMaintenance(id);
    res.status(200).json(result);
});