const express = require('express')
const router = express.Router()

const {findStorelocation , updateStorelocation} = require('../controller/locationControllers')

router.get('/', findStorelocation)
router.put('/', updateStorelocation)

module.exports = router