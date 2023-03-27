var express = require('express');
var router = express.Router();
const { checkValidations, validateNonNullPositiveInteger, } = require("../controllers/validation");

const { getClinic } = require("../controllers/clinicsController");
const { query } = require('express-validator');

router.get('/',
        query("id").trim(),
        query("id").custom((value, {req}) => validateNonNullPositiveInteger("id", value)),
        checkValidations,
        getClinic);

module.exports = router;
