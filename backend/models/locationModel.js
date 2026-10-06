const db = require('../configs/db')

const findStoreLocation = (callback) =>{

    const sql = `select location_id , latitude ,longitude from store_location`

    db.query(sql , callback)
}

const updateStoreLocation = (latitude , longitude , callback) =>{

    const sql = `update store_location set latitude = ? , longitude = ? where location_id = 1`

    db.query(sql , [latitude , longitude] , callback)
}

module.exports = {
    findStoreLocation,
    updateStoreLocation
}