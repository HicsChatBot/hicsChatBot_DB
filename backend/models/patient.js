class Patient {
    constructor(id, phone, title, nric, fullname, gender, dob, address) {
        this.id = id;
        this.nric = nric;
        this.fullname = fullname;
        this.gender = gender;
        this.dob = new Date(dob);
        this.address = address;

        this.phone = phone;
        this.title = title;
    }

    /**
     * Creates the Patient entity.
     * @param {*} fullPatientData record after Person JOIN Patient query.
     */
    static toEntity(fullPatientData) {
        return new Patient(fullPatientData['id'], fullPatientData['phone'], fullPatientData['title'], fullPatientData['nric'],fullPatientData['fullname'], fullPatientData['gender'], fullPatientData['dob'], fullPatientData['address']);
    }

    /**
     * Creates the Patient entity.
     * @param {*} personData record from Person table.
     * @param {*} patientData record from Patient table.
     */
    static toJoinedEntity(personData, patientData) {
        return new Patient(personData['id'], patientData['phone'], patientData['title'], personData['nric'],personData['fullname'], personData['gender'], personData['dob'], personData['address']);
    }
}

module.exports = {
    Patient
};
