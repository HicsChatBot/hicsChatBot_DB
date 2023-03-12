var express = require('express');
var router = express.Router();

const { ping, getAllPatients, getPatientByNric, createPatient } = require("../controllers/patientsController");

router.get("/",
        ping);

router.post("/",
        createPatient);

router.get('/getAllPatients',
        getAllPatients);

router.get('/getPatientByNric', 
        getPatientByNric);

module.exports = router;
