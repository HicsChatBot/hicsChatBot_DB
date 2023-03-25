var express = require('express');
var router = express.Router();
const { validateId } = require("../controllers/validation");

const { getDoctor, getDoctorsBySpecialization, getDoctorsBySpecializationAndRanking } = require("../controllers/doctorsController");
const { query } = require('express-validator');

router.get('/',
        query("id").trim(),
        query("id").custom((value, {req}) => validateId(value)),
        getDoctor);

router.get('/getDoctorsBySpecialization',
        query("specialization").trim().toLowerCase(),
        query("specialization").custom((value, {req}) => validateSpecialization(value)),
        getDoctorsBySpecialization);

router.get('/getDoctorsBySpecializationAndRanking',
        query("specialization").trim().toLowerCase(),
        query("specialization").custom((value, {req}) => validateSpecialization(value)),
        getDoctorsBySpecializationAndRanking);


module.exports = router;
