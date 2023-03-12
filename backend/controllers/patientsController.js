const { db } = require('../models/database');
const { Patient } = require("../models/patient");

const _getPersonByNric = async (nric) => {
    const resp = await db.oneOrNone("SELECT * FROM Persons WHERE nric = $<nric>", {nric: nric});
    return resp;
}

// PUBLIC functions
const ping = (req, res, next) => {
    return res.send("ping");
}

const createPatient = async (req, res, next) => {
    const p = req.body.patient;

    // Checks if a person already exists.
    person = await _getPersonByNric(p.nric)
    if (person == null) { 
        // Insert into Persons if don't exist
        person = await db.one("INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ($<nric>, $<fullname>, $<gender>, $<dob>, $<address>) RETURNING *", {nric: p.nric, fullname: p.fullname, gender: p.gender, dob: p.dob, address: p.address});
    }

    // Insert into Patients 
    patient = await db.one("INSERT INTO Patients(id, phone, title) VALUES ($<id>, $<phone>, $<title>) RETURNING *", {id: person.id, phone: p.phone, title: p.title});

    patientEntity = Patient.toJoinedEntity(person, patient);

    return res.send({patient: patientEntity});
}

const getAllPatients = (req, res, next) => {
    return db.any("SELECT * FROM Patients p JOIN Persons per ON p.id = per.id", {}).then(patients => {
        return res.send({
            patients: patients.map(patient => Patient.toEntity(patient))
        })
    });
}

const getPatientByNric = async (req, res, next) => {
    const nric = req.body.nric;

    const resp = await db.oneOrNone("SELECT * FROM Patients p JOIN Persons per ON p.id = per.id AND per.nric = $<nric>", {nric: nric});
    if (!resp) {
        return res.status(400).json({error: `Patient with nric (${nric}) does not exist.`});
    }
    p = Patient.toEntity(resp);
    return res.send({ patient: p });
}

module.exports = {
    ping,
    createPatient,
    getAllPatients,
    getPatientByNric,
}