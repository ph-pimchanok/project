const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createOrders = asyncHandler(async (req, res, next) => {
    const orderData = req.body;

    Object.keys(orderData).forEach(key => {
        if (orderData[key] === undefined || orderData[key] === null) {
            delete orderData[key];
        }
    });
    const result = await orderService.createOrder(orderData);

    res.status(201).json(result);
});

exports.findAllOrders = asyncHandler(async (req, res, next) => {
    const results = await orderService.getAllOrder();
    res.status(200).json(results);
});

exports.findOrderbyStatus = asyncHandler(async (req, res, next) => {
    const results = await orderService.findOrderbyStatus();
    res.status(200).json(results);
});

exports.deleteOrders = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    if (!id) { return next(new ApiError(400, "Missing required field: id")); }

    const result = await orderService.deleteOrder(id);
    res.status(200).json(result);
});

exports.updateOrderVehicle = asyncHandler(async (req, res, next) => {
    const { order_ids, vehicle_id } = req.body;

    if (!order_ids || !vehicle_id || !Array.isArray(order_ids) || order_ids.length === 0) {
        return next(new ApiError(400, "Missing or invalid required fields: order_ids (array) or vehicle_id"));
    }

    const result = await orderService.updateOrderVehicle(order_ids, vehicle_id);

    const io = req.app.get('io');
    if (io) {
        io.emit('order_delivery', {
            vehicle_id: Number(vehicle_id),
            order_ids: order_ids,
            status: 'delivering',
        });
    }

    res.status(200).json(result);
});

exports.findOrdertodayByVehicle = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    if (!id) { return next(new ApiError(400, "vehicle_id is required")); }

    const results = await orderService.findOrdertodayByVehicle(id);
    res.status(200).json(results);
});

exports.findOneOrder = asyncHandler(async (req, res, next) => {
    const id = req.params.id;

    if (!id) { return next(new ApiError(400, "order_id is required")); }

    const result = await orderService.findOneOrder(id);
    res.status(200).json(result);
});

exports.uploadImage = asyncHandler(async (req, res, next) => {

    const { order_id } = req.params;
    const { payment_method } = req.body;
    const { imageBase64 } = req.body;

    if (!order_id || !imageBase64 || !payment_method) {
        return next(new ApiError(400, "order_id and imageBase64 are required"));
    }

    try {

        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const dataUri = `data:image/jpeg;base64,${cleanBase64}`;

        // 2. ส่ง Data URI ขึ้น Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(dataUri, {
            folder: 'project-gas-proofs',
        });

        const imagePath = uploadResponse.secure_url;
        const result = await orderService.uploadImage(order_id, imagePath, payment_method);

        const io = req.app.get('io');
        if (io) {
            io.emit('order_status_update', {
                order_id: Number(order_id),
                status: 'delivered',
            });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Cloudinary Error Details:", error);
        const errorMsg = error?.message || error?.error?.message || JSON.stringify(error);
        return next(new ApiError(500, `ไม่สามารถอัปโหลดรูปภาพได้: ${errorMsg}`));
    }
});

exports.cancelOrder = asyncHandler(async (req, res, next) => {
    const order_id = req.params.id;

    if (!order_id) { return next(new ApiError(400, "order_id is required")); }

    const result = await orderService.cancelOrder(order_id);

    res.status(200).json(result);
});