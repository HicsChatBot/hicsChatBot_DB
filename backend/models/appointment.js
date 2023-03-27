class Appointment {
    constructor(clinicId, roomNumber, patientId, startDatetime, apptStatus, doctorId, apptType) {
        this.clinicId = clinicId;
        this.roomNumber = roomNumber;
        this.patientId = patientId;
        this.startDatetime = new Date(startDatetime)
        this.apptStatus = apptStatus;
        this.doctorId = doctorId;
        this.apptType = apptType;
    }

    /**
     * Creates the Appointment entity.
     * @param {*} fullApptData record after Person JOIN Appt query.
     */
    static toEntity(fullApptData) {
        return new Appointment(fullApptData['clinic_id'], fullApptData['room_number'], fullApptData['patient_id'], fullApptData['start_datetime'],fullApptData['appt_status'], fullApptData['doctor_id'], fullApptData['appt_type']);
    }
}

module.exports = {
    Appointment,
};
