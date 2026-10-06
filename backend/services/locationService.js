const locationModel = require("../models/locationModel");

const findStorelocation = () => {
    return new Promise((success, fail) => {
        locationModel.findStoreLocation((err, result) => {
            if (err) { return fail(err) }

            success({
                success: true,
                data: result
            })
        });
    });
};

const updateStorelocation = (latitude, longitude) => {
    return new Promise((success, fail) => {
        locationModel.updateStoreLocation(latitude, longitude, (err, result) => {
            if (err) { return fail(err) }

            success({
                success: true,
                data: result
            })
        });
    });
};


module.exports = {
    findStorelocation,
    updateStorelocation,
}