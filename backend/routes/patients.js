var express = require('express');
var router = express.Router();

const { ping, getAllPatients, getPatientByNric, createPatient } = require("../controllers/patientsController");
const { 
    checkValidations, 
    validateAddress,
    validateDob,
    validateGender,
    validateNric, 
    validatePatientTitle, 
    validatePhone, 
    validateFullName 
} = require('../controllers/validation');
const { body, query } = require("express-validator");

router.get("/",
        ping);

router.post("/",
        // Sanitization
        body("patient.nric").trim().toUpperCase(),
        body("patient.fullname").trim(),
        body("patient.dob").trim().isDate(),
        body("patient.gender").trim().toUpperCase(),
        body("patient.address").trim(),
        body("patient.phone").trim(),

        // Validation
        body("patient.nric").custom((value, {req}) => validateNric(value)),
        body("patient.fullname").custom((value, {req}) => validateFullName(value)),
        body("patient.dob").custom((value, {req}) => validateDob(value)),
        body("patient.gender").custom((value, {req}) => validateGender(value)),
        body("patient.address").custom((value, {req}) => validateAddress(value)),
        body("patient.title").custom((value, {req}) => validatePatientTitle(value)),
        body("patient.phone").custom((value, {req}) => validatePhone(value)),
        checkValidations,

        createPatient);

router.get('/getAllPatients',
        getAllPatients);

router.get('/getPatientByNric/', 
        query("nric").trim().toUpperCase(),
        query("nric").custom((value, {req}) => validateNric(value)),
        checkValidations,

        getPatientByNric);

module.exports = router;
