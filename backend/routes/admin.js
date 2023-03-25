var express = require('express');
const { resetDatabase } = require('../controllers/adminController');
var router = express.Router();

router.post('/resetDatabase', 
        resetDatabase);

module.exports = router;
