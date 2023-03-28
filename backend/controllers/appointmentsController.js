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

/**
 * finds a doctor where ranking = null and specialization = {@code specialization}
 */
const findNextAvailableSubsidizedAppointment = (req, res, next) => {
    const specialization = req.query.specialization;
    const apptType = req.query.apptType;

    return db.tx(async t => {
        let res = await t.oneOrNone("SELECT ds.doctor_id FROM DoctorsSpecializations ds\
                JOIN Specializations s ON ds.specialization_id = s.id \
                WHERE ds.ranking is null AND s.name = $<specialization>", {specialization: specialization});
        
        const doctorId = res.doctor_id;

        res = await t.oneOrNone("SELECT c.id FROM Doctors d JOIN Hospitals h ON d.hospital_id = h.id \
                JOIN Clinics c on h.id = c.hospital_id \
                JOIN Specializations s on s.id = c.specialization_id \
                WHERE d.id = $<doctorId> AND s.name = $<specialization>",
                { doctorId: doctorId, specialization: specialization});
        const clinicId = res.id;

        const roomNumber = 1;
        
        const numDaysFromNow = 7;
        const numExistingAppointments = await t.one("SELECT count(*) FROM Appointments \
                    WHERE clinic_id = $<clinicId> AND room_number = $<roomNumber> AND start_datetime::date = (now() + interval '$<numDaysFromNow> days')::date",
                    {clinicId: clinicId, roomNumber: roomNumber, numDaysFromNow: numDaysFromNow});

        while (numExistingAppointments > 5) {
            numDaysFromNow += 1;
            numExistingAppointments = await t.one("SELECT count(*) FROM Appointments \
                    WHERE clinic_id = $<clinicId> AND room_number = $<roomNumber> AND start_datetime::date = (now() + interval '$<numDaysFromNow> days')::date",
                    {clinicId: clinicId, roomNumber: roomNumber, numDaysFromNow: numDaysFromNow});
        }

        let datestr = new Date();
        datestr.setDate(datestr.getDate() + numDaysFromNow);

        const dateStr = datestr.toISOString().split("T")[0];

        const times = ['10:00', '12:00', '14:00', '16:00', '18:00'];
        let dt = null;

        for (time of times) {
            const datetime = dateStr + 'T' + time;
            res = await t.oneOrNone("SELECT 1 FROM Appointments a \
                    WHERE clinic_id = $<clinicId> AND room_number = $<roomNumber> \
                    AND start_datetime = $<datetime>",
                    {clinicId: clinicId, roomNumber: roomNumber, datetime: datetime})
            
            if (res == null) {
                dt = datetime;
                break;
            }
        }

        return {clinicId, roomNumber, startDatetime: dt, doctorId, apptType}
    }).then(data => {
        return res.send({apptData: data});
    }).catch(err => {
        return res.status(500).json({ error: err.message });
    });

}

module.exports = {
    createUpcomingAppointment,
    deleteUpcomingAppointment, 
    getAllAppointments,
    getAppointment,
    getMostRecentPastAppointmentForPatient,
    getNextUpcomingAppointmentForPatient,

    findNextAvailableSubsidizedAppointment,
}
