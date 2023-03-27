var express = require('express');
var router = express.Router();
const { checkValidations, validateNonNullPositiveInteger, validateSpecialization, validateRanking } = require("../controllers/validation");

const { getDoctor, getDoctorsBySpecialization, getDoctorsBySpecializationAndRanking } = require("../controllers/doctorsController");
const { query } = require('express-validator');

router.get('/',
        query("id").trim(),
        query("id").custom((value, {req}) => validateNonNullPositiveInteger("id", value)),
        checkValidations,
        getDoctor);

router.get('/getDoctorsBySpecialization',
        query("specialization").trim().toLowerCase(),
        query("specialization").custom((value, {req}) => validateSpecialization(value)),
        checkValidations,
        getDoctorsBySpecialization);

router.get('/getDoctorsBySpecializationAndRanking',
        query("specialization").trim().toLowerCase(),
        query("ranking").trim().toLowerCase(),

        query("specialization").custom((value, {req}) => validateSpecialization(value)),
        query("ranking").custom((value, {req}) => validateRanking(value)),
        checkValidations,
        getDoctorsBySpecializationAndRanking);


module.exports = router;
