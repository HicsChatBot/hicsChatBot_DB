// Loading and initializing the library:
const pgp = require('pg-promise')({
    // Initialization Options
});

const dotenv = require('dotenv');
dotenv.config(); // load in from .env file

const createTables = (db) => {
    console.log("creating tables");
    dbInitScript = `
            BEGIN;
            DROP TABLE IF EXISTS Appointments;
            DROP TABLE IF EXISTS Rooms;
            DROP TABLE IF EXISTS Clinics;
            DROP TABLE IF EXISTS Doctorsspecializations;
            DROP TABLE IF EXISTS Patients;
            DROP TABLE IF EXISTS Doctors;
            DROP TABLE IF EXISTS Specializations;
            DROP TABLE IF EXISTS AppointmentTypes;
            DROP TABLE IF EXISTS Hospitals;
            DROP TABLE IF EXISTS Persons;

            DROP TYPE IF EXISTS Gender;
            DROP TYPE IF EXISTS HospitalType;
            DROP TYPE IF EXISTS AppointmentStatus;
            DROP TYPE IF EXISTS PatientTitle;
            DROP TYPE IF EXISTS DoctorRanking;

            CREATE TYPE Gender AS ENUM('M', 'F', 'O');
            CREATE TYPE HospitalType AS ENUM('acute', 'community');
            CREATE TYPE AppointmentStatus AS ENUM('upcoming', 'completed', 'missed');
            CREATE TYPE PatientTitle AS ENUM('Miss', 'Mrs', 'Mr', 'Ms');
            CREATE TYPE DoctorRanking AS ENUM('consultant', 'specialist', 'senior consultant');

            /* no dependencies */
            CREATE TABLE AppointmentTypes(
                type VARCHAR(30) PRIMARY KEY,
                duration int NOT NULL
            );

            CREATE TABLE Specializations(
                id SERIAL PRIMARY KEY,
                name VARCHAR(30) UNIQUE NOT NULL
            );

            /* with dependencies */
            CREATE TABLE Hospitals(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                location VARCHAR(150) NOT NULL,
                hospital_type HospitalType NOT NULL
            );

            CREATE TABLE Persons(
                id SERIAL PRIMARY KEY,
                nric VARCHAR(9) UNIQUE NOT NULL,
                fullname VARCHAR(100) NOT NULL,
                gender Gender NOT NULL,
                dob DATE NOT NULL,
                address VARCHAR(255) NOT NULL,

                CONSTRAINT person_nric_regex CHECK (nric ~ '^[T|S|F|G]\\d{7}[A-Z]$')
            );

            CREATE TABLE Doctors(
                id INT PRIMARY KEY REFERENCES Persons(id) ON UPDATE CASCADE ON DELETE CASCADE,
                hospital_id INT NOT NULL REFERENCES Hospitals(id) ON UPDATE CASCADE ON DELETE NO ACTION,
                phone VARCHAR(12) NOT NULL,

                CONSTRAINT doctor_phone_regex CHECK (phone ~ '^\\+65[[:space:]][6|8|9]\\d{7}$')
            );
            CREATE TABLE Patients(
                id INT PRIMARY KEY REFERENCES Persons(id) ON UPDATE CASCADE ON DELETE CASCADE,
                phone VARCHAR(12) NOT NULL,
                title PatientTitle,

                CONSTRAINT patient_phone_regex CHECK (phone ~ '^\\+65[[:space:]][6|8|9]\\d{7}$')
            );

            CREATE TABLE DoctorsSpecializations(
                doctor_id INT NOT NULL REFERENCES Doctors(id) ON UPDATE CASCADE ON DELETE CASCADE,
                specialization_id INT NOT NULL REFERENCES Specializations(id) ON UPDATE CASCADE ON DELETE CASCADE,
                PRIMARY KEY(doctor_id, specialization_id)
            );

            CREATE TABLE Clinics(
                id SERIAL PRIMARY KEY,
                hospital_id INT NOT NULL REFERENCES Hospitals(id) ON UPDATE CASCADE ON DELETE NO ACTION,
                specialization_id INT NOT NULL REFERENCES Specializations(id) ON UPDATE CASCADE ON DELETE NO ACTION,

                UNIQUE(hospital_id, specialization_id)
            );

            CREATE TABLE Rooms(
                clinic_id INT NOT NULL REFERENCES Clinics(id) ON UPDATE CASCADE ON DELETE NO ACTION,
                room_number INT NOT NULL,

                PRIMARY KEY(clinic_id, room_number)
            );

            CREATE TABLE Appointments(
                clinic_id INT NOT NULL,
                room_number INT NOT NULL,
                patient_id INT NOT NULL REFERENCES Patients(id) ON UPDATE CASCADE ON DELETE CASCADE,
                start_datetime TIMESTAMPTZ NOT NULL,

                appt_status AppointmentStatus NOT NULL DEFAULT 'upcoming',
                doctor_id INT REFERENCES Doctors(id) ON UPDATE CASCADE ON DELETE SET NULL,
                appt_type VARCHAR(50) REFERENCES AppointmentTypes(type) ON UPDATE CASCADE ON DELETE NO ACTION,

                PRIMARY KEY (clinic_id, room_number, patient_id, start_datetime),
                FOREIGN KEY (clinic_id, room_number) REFERENCES Rooms(clinic_id, room_number) ON UPDATE CASCADE ON DELETE CASCADE,
                CONSTRAINT appt_check_doctor_patient_diff CHECK (doctor_id <> patient_id)
            );

            END;
            `;
    
    return db.none(dbInitScript, {}).then(() => {console.log("Done Creating tables.")});
}

// Preparing the connection details:
const cn = process.env.DB_URL;

// Creating a new database instance from the connection details:
const db = pgp(cn);

createTables(db);

module.exports = {
    db,
};
