const { db } = require('../models/database');
const { Doctor } = require("../models/doctor");

const getAllDoctors = (req, res, next) => {
    return db.any("SELECT p.*, d.phone, d.hospital_id FROM Doctors d JOIN Persons p ON d.id = p.id", {})
        .then(resp => {
            if (resp.length > 0) {
                resp = resp.map(d => Doctor.toEntity(d));
            }
            return res.send({ doctors: resp });
        })
        .catch(err => {
            return res.status(500).send({error: err.message});
        });
}

const getDoctor = (req, res, next) => {
    const id = req.query.id;

    return db.oneOrNone("SELECT p.*, d.phone, d.hospital_id FROM Persons p JOIN Doctors d ON p.id = d.id WHERE d.id = $<id>", {id: id})
            .then(resp => {
                if (resp) {
                    resp = Doctor.toEntity(resp);
                }
                return res.send({ doctor: resp });
            })
            .catch(err => {
                return res.status(500).json({error: err.message});
            });
}

const getDoctorsBySpecialization = (req, res, next) => {
    const specialization = req.query.specialization;

    return db.any("SELECT p.*, d.phone, d.hospital_id \
                    FROM Persons p JOIN Doctors d ON p.id = d.id \
                    JOIN DoctorsSpecializations ds ON ds.doctor_id = d.id \
                    JOIN Specializations s ON ds.specialization_id = s.id \
                    WHERE s.name = $<specialization>", {specialization: specialization})
            .then(resp => {
                if (resp.length > 0) {
                    resp = resp.map(d => Doctor.toEntity(d));
                }
                return res.send({ doctors: resp });
            })
            .catch(err => {
                return res.status(500).json({error: err.message});
            });
}

const getDoctorsBySpecializationAndRanking = (req, res, next) => {
    const specialization = req.query.specialization;
    // const rankingStr = req.query.ranking == "" ? "is null" : `= '${req.query.ranking}'`;
    const ranking = req.query.ranking;

    s = "SELECT p.*, d.phone, d.hospital_id \
            FROM Persons p JOIN Doctors d ON p.id = d.id \
            JOIN doctorsspecializations dsp ON dsp.doctor_id = d.id \
            JOIN Specializations s ON dsp.specialization_id = s.id \
            WHERE s.name = $<specialization> AND ";

    s += !ranking ? "dsp.ranking is null" : "dsp.ranking = $<ranking>";

    return db.any(s, {specialization: specialization, ranking: ranking})
            .then(resp => {
                if (resp.length > 0) {
                    resp = resp.map(d => Doctor.toEntity(d));
                }
                return res.send({ doctors: resp });
            })
            .catch(err => {
                return res.status(500).json({error: err.message});
            });
}

module.exports = {
    getAllDoctors,
    getDoctor,
    getDoctorsBySpecialization,
    getDoctorsBySpecializationAndRanking,
}
