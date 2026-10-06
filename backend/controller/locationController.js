const locationServier = require('../services/locationService')
const ApiError =require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

exports.findStorelocation = asyncHandler(async( req, res ,next) => {

    const result = await locationServier.findStorelocation()

    res.status(200).json(result)
})


exports.updateStorelocation = asyncHandler(async( req, res ,next) => {
    const {latitude, longitude} = req.body

    if(!latitude || !longitude){
        return next(new ApiError('Please provide latitude and longitude', 400))
    }

    const result = await locationServier.updateStorelocation(latitude, longitude)

    res.status(200).json(result)
})