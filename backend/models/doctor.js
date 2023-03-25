class Doctor {
    constructor(id, phone, hospitalId, nric, fullname, gender, dob, address) {
        this.id = id;
        this.nric = nric;
        this.fullname = fullname;
        this.gender = gender;
        this.dob = new Date(dob);
        this.address = address;

        this.hospitalId = hospitalId;
        this.phone = phone;
    }

    /**
     * Creates the Doctor entity.
     * @param {*} fullDoctorData record after Person JOIN Doctor query.
     */
    static toEntity(fullDoctorData) {
        return new Doctor(fullDoctorData['id'], fullDoctorData['phone'], fullDoctorData['hospital_id'], fullDoctorData['nric'],fullDoctorData['fullname'], fullDoctorData['gender'], fullDoctorData['dob'], fullDoctorData['address']);
    }

    /**
     * Creates the Doctor entity.
     * @param {*} personData record from Person table.
     * @param {*} DoctorData record from Doctor table.
     */
    static toJoinedEntity(personData, DoctorData) {
        return new Doctor(personData['id'], DoctorData['phone'], DoctorData['hospital_id'], personData['nric'],personData['fullname'], personData['gender'], personData['dob'], personData['address']);
    }
}

module.exports = {
    Doctor,
};
