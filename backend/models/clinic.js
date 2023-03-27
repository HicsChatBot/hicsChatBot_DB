class Hospital {
    constructor(hospitalId, hospitalLocation, hospitalName, hospitalType) {
        this.hospitalId = hospitalId;
        this.hospitalLocation = hospitalLocation;
        this.hospitalName = hospitalName;
        this.hospitalType = hospitalType;
    }
}

class Specialization {
    constructor(specializationId, specializationName) {
        this.specializationId = specializationId;
        this.specializationName = specializationName;
    }
}

class Clinic {
    constructor(clinicId, hospitalId, hospitalName, hospitalLocation, hospitalType, specializationId, specializationName) {
        this.clinicId = clinicId;
        this.hospital = new Hospital(hospitalId, hospitalLocation, hospitalName, hospitalType);
        this.specialization = new Specialization(specializationId, specializationName);
    }

    /**
     * Creates the Appointment entity.
     * @param {*} fullApptData record after Person JOIN Appt query.
     */
    static toEntity(fullApptData) {
        return new Clinic(fullApptData['id'], fullApptData['hospital_id'], fullApptData['hospital_name'], fullApptData['hospital_location'],fullApptData['hospital_type'], fullApptData['specialization_id'], fullApptData['specialization_name']);
    }
}

module.exports = {
    Clinic,
};
