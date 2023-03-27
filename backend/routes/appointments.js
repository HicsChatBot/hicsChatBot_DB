var express = require('express');
var router = express.Router();

const { 
    getAppointment,
    getMostRecentPastAppointmentForPatient,
    getNextUpcomingAppointmentForPatient,
    deleteUpcomingAppointment,
    createUpcomingAppointment,
} = require("../controllers/appointmentsController");
const { 
    checkValidations,

    validateApptType,
    validateDateTime, 
    validateFutureDateTime,
    validateNonNullPositiveInteger,
    validateNullablePositiveInteger,
} = require('../controllers/validation');
const { query, body } = require('express-validator');


router.post("/createUpcomingAppointment",
        // Sanitization
        body("appointment.startDatetime").trim(),
        body("appointment.apptType").trim(),

        // Validation
        body("appointment.clinicId").custom((value, {req}) => validateNonNullPositiveInteger("clinicId", value)),
        body("appointment.roomNumber").custom((value, {req}) => validateNonNullPositiveInteger("roomNumber", value)),
        body("appointment.patientId").custom((value, {req}) => validateNonNullPositiveInteger("patientId", value)),
        body("appointment.startDatetime").custom((value, {req}) => validateFutureDateTime("startDatetime", value)),
        body("appointment.doctorId").custom((value, {req}) => validateNullablePositiveInteger("doctorId", value)),
        body("appointment.apptType").custom((value, {req}) => validateApptType(value)),
        checkValidations,

        createUpcomingAppointment);

router.delete("/deleteUpcomingAppointment",
        // Check validations
        body("appointment.startDatetime").trim(),

        body("clinicId").custom((value, {req}) => validateNonNullPositiveInteger("clinicId", value)),
        body("roomNumber").custom((value, {req}) => validateNonNullPositiveInteger("roomNumber", value)),
        body("patientId").custom((value, {req}) => validateNonNullPositiveInteger("patientId", value)),
        body("startDatetime").custom((value, {req}) => validateFutureDateTime("startDatetime", value)),
        checkValidations,

        deleteUpcomingAppointment);

router.get("/",
        // query("startDatetime").trim().isDate(),
        query("appointment.startDatetime").trim(),

        query("clinicId").custom((value, {req}) => validateNonNullPositiveInteger("clinicId", value)),
        query("roomNumber").custom((value, {req}) => validateNonNullPositiveInteger("roomNumber", value)),
        query("patientId").custom((value, {req}) => validateNonNullPositiveInteger("patientId", value)),
        query("startDatetime").custom((value, {req}) => validateDateTime("startDatetime", value)),

        checkValidations,

        getAppointment);

router.get("/getNextUpcomingAppointment",
        query("patientId").custom((value, {req}) => validateNonNullPositiveInteger("patientId", value)),
        checkValidations,

        getNextUpcomingAppointmentForPatient);

router.get("/getMostRecentPastAppointment",
        query("patientId").custom((value, {req}) => validateNonNullPositiveInteger("patientId", value)),
        checkValidations,

        getMostRecentPastAppointmentForPatient);

module.exports = router;
