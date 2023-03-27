const { db } = require('../models/database');
const { Appointment } = require("../models/appointment");

const getAllAppointments = (req, res, next) => {
    return db.any("SELECT * FROM Appointments ORDER BY start_datetime ASC", {})
        .then(resp => {
            if (resp.length > 0) {
                resp = resp.map(a => Appointment.toEntity(a));
            }
            return res.send({ appointments: resp });
        })
        .catch(err => {
            return res.status(500).send({error: err.message});
        });
}

const getAppointment = (req, res, next) => {
    const clinicId = req.query.clinicId;
    const roomNumber = req.query.roomNumber;
    const patientId = req.query.patientId;
    const startDatetime = req.query.startDatetime;

    return  db.oneOrNone("SELECT * FROM Appointments \
                    WHERE clinic_id = $<clinicId> AND room_number = $<roomNumber> AND \
                    patient_id = $<patientId> AND start_datetime = $<startDatetime>::timestamp with time zone", 
                    { clinicId: clinicId, roomNumber: roomNumber, patientId: patientId, startDatetime: startDatetime })
            .then(appt => {
                if (appt) {
                    appt = Appointment.toEntity(appt);
                }
                return res.send({ appointment: appt });
            })
            .catch(err => {
                return res.status(500).json({error: err.message});
            });
}

const createUpcomingAppointment = (req, res, next) => {
    const appointment = req.body.appointment;

    const clinicId = appointment.clinicId;
    const roomNumber = appointment.roomNumber;
    const patientId = appointment.patientId;
    const startDatetime = appointment.startDatetime;
    const apptStatus = "upcoming";
    const doctorId = appointment.doctorId;
    const apptType = appointment.apptType;

    return db.oneOrNone("INSERT INTO Appointments \
                    VALUES ($<clinicId>, $<roomNumber>, $<patientId>, $<startDatetime>, $<apptStatus>, $<doctorId>, $<apptType>) \
                    RETURNING *", 
                    { 
                        clinicId: clinicId, 
                        roomNumber: roomNumber, 
                        patientId: patientId, 
                        startDatetime: startDatetime,
                        apptStatus: apptStatus,
                        doctorId: doctorId,
                        apptType: apptType,
                    })
            .then(appt => {
                if (appt) {
                    appt = Appointment.toEntity(appt);
                }
                return res.send({ appointment: appt });
            })
            .catch(err => {
                return res.status(500).json({error: err.message});
            });
}

const deleteUpcomingAppointment = (req, res, next) => {
    const clinicId = req.body.clinicId;
    const roomNumber = req.body.roomNumber;
    const patientId = req.body.patientId;
    const startDatetime = req.body.startDatetime;

    return  db.oneOrNone("DELETE FROM Appointments \
                    WHERE clinic_id = $<clinicId> AND room_number = $<roomNumber> AND \
                    patient_id = $<patientId> AND start_datetime = $<startDatetime>::timestamp with time zone \
                    AND start_datetime > now()", 
                    { clinicId: clinicId, roomNumber: roomNumber, patientId: patientId, startDatetime: startDatetime })
            .then(resp => {
                return res.send({ appointment: resp });
            })
            .catch(err => {
                return res.status(500).json({error: err.message});
            });
}

const getMostRecentPastAppointmentForPatient = (req, res, next) => {
    const patientId = req.query.patientId;

    return db.oneOrNone("SELECT * FROM Appointments \
                    WHERE appt_status = 'completed' AND now() > start_datetime AND patient_id = $<patientId> \
                    ORDER BY start_datetime DESC \
                    LIMIT 1", 
                    { patientId: patientId })
            .then(appt => {
                if (appt) {
                    appt = Appointment.toEntity(appt);
                }
                return res.send({ appointment: appt });
            })
            .catch(err => {
                return res.status(500).json({error: err.message});
            });
}

const getNextUpcomingAppointmentForPatient = (req, res, next) => {
    const patientId = req.query.patientId;

    return db.oneOrNone("SELECT * FROM Appointments \
                    WHERE appt_status = 'upcoming' AND now() <= start_datetime AND patient_id = $<patientId> \
                    ORDER BY start_datetime ASC \
                    LIMIT 1", 
                    { patientId: patientId })
            .then(appt => {
                if (appt) {
                    appt = Appointment.toEntity(appt);
                }
                return res.send({ appointment: appt });
            })
            .catch(err => {
                return res.status(500).json({error: err.message});
            });
}

module.exports = {
    createUpcomingAppointment,
    deleteUpcomingAppointment, 
    getAllAppointments,
    getAppointment,
    getMostRecentPastAppointmentForPatient,
    getNextUpcomingAppointmentForPatient,
}
