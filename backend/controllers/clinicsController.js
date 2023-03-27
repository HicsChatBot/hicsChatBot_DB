const { db } = require('../models/database');
const { Clinic } = require('../models/clinic');

const getClinic = (req, res, next) => {
    const clinicId = req.query.id;

    return db.oneOrNone("SELECT c.*, h.name as hospital_name, h.location as hospital_location, h.hospital_type, s.name as specialization_name\
                    FROM Clinics c JOIN Hospitals h ON c.hospital_id = h.id\
                    JOIN Specializations s ON c.specialization_id = s.id \
                    WHERE c.id = $<clinicId>",
                    {clinicId: clinicId})
            .then(resp => {
                if (resp) {
                    resp = Clinic.toEntity(resp);
                }
                return res.send({ clinic: resp });
            })
            .catch(err => {
                return res.status(500).json({error: err.message});
            });
}

module.exports = {
    getClinic,
}
