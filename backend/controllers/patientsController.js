const { db } = require('../models/database');
const { Patient } = require("../models/patient");

const _getPersonByNric = (nric) => {
    return db.oneOrNone("SELECT * FROM Persons WHERE nric = $<nric>", {nric: nric});
}

// PUBLIC functions
const ping = (req, res, next) => {
    return res.send("ping");
}

const createPatient = (req, res, next) => {
    const p = req.body.patient;

    return _getPersonByNric(p.nric) // Check if a person (with same nric) already exists in the database
        .then(person => {
            if (person && person != null) { // person already exists
                return person;
            }

            // person doesn't exists yet, create the person record
            return db.one("INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ($<nric>, $<fullname>, $<gender>, $<dob>, $<address>) RETURNING *", 
                    {nric: p.nric, fullname: p.fullname, gender: p.gender, dob: p.dob, address: p.address});
        })
        .then(person => {
            // (person successfully created), create the patient record
            return db.one("INSERT INTO Patients(id, phone, title) VALUES ($<id>, $<phone>, $<title>) RETURNING *", {id: person.id, phone: p.phone, title: p.title})
                .then(patient => {
                    return {patient: patient, person: person}
                });
        })
        .then(dict => {
            patient = dict.patient;
            person = dict.person;
            // patient (& person) successfully created
            patientEntity = Patient.toJoinedEntity(person, patient);
            return res.send({patient: patientEntity});
        })
        .catch(err => {
            // If an error is thrown at any point in time during execution of above promises,
            // send response with error code 500 and error's message
            return res.status(500).send({error: err.message});
        });
}

const getAllPatients = (req, res, next) => {
    return db.any("SELECT * FROM Patients p JOIN Persons per ON p.id = per.id", {})
        .then(patients => {
            return res.send({
                patients: patients.map(patient => Patient.toEntity(patient))
            })
        })
        .catch(err => {
            return res.status(500).send({error: err.message});
        });
}

const getPatientByNric = (req, res, next) => {
    const nric = req.body.nric;

    return db.oneOrNone("SELECT * FROM Patients p JOIN Persons per ON p.id = per.id AND per.nric = $<nric>", {nric: nric})
            .then(resp => {
                if (resp) {
                    p = Patient.toEntity(resp);
                    return res.send({ patient: p });
                }
                return res.send({ patient: resp });
            })
            .catch(err => {
                return res.status(500).json({error: err.message});
            });
}

module.exports = {
    ping,
    createPatient,
    getAllPatients,
    getPatientByNric,
}