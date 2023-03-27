var express = require('express');
var router = express.Router();
const { checkValidations, validatePositiveInteger } = require("../controllers/validation");

const { getDoctor, getDoctorsBySpecialization, getDoctorsBySpecializationAndRanking } = require("../controllers/doctorsController");
const { query } = require('express-validator');

router.get('/',
        query("id").trim(),
        query("id").custom((value, {req}) => validatePositiveInteger("id", value)),
        checkValidations,
        getDoctor);

router.get('/getDoctorsBySpecialization',
        query("specialization").trim().toLowerCase(),
        query("specialization").custom((value, {req}) => validateSpecialization(value)),
        checkValidations,
        getDoctorsBySpecialization);

router.get('/getDoctorsBySpecializationAndRanking',
        query("specialization").trim().toLowerCase(),
        query("specialization").custom((value, {req}) => validateSpecialization(value)),
        checkValidations,
        getDoctorsBySpecializationAndRanking);


module.exports = router;
