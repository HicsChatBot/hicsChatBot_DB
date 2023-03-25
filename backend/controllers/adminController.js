const { db } = require('../models/database');

/**
 * Special function that resets the database and creates initial data.
 * This method is only provided for demo and testing purposes, since the database is only a mock database.
 */
const resetDatabase = (req, res, next) => {
    dbInitScript = `
        BEGIN;
        ALTER USER ${process.env.DB_USER_NAME} SET TimeZone = 'Asia/Singapore';

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
            ranking DoctorRanking,
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

        /* Insert: for tables with no dependencies */
        INSERT INTO AppointmentTypes VALUES ('first consult', 45), ('follow up', 30), ('review', 10);
        INSERT INTO Specializations(name) VALUES ('cardiology'), ('nephrology'), ('neurology'), ('oncology'), ('pediatrics'), ('general');

        INSERT INTO Hospitals(name, location, hospital_type) VALUES ('Singapore General Hospital', 'Singapore General Hospital, Outram Road, Singapore 169608', 'acute');
        INSERT INTO Hospitals(name, location, hospital_type) VALUES ('Tan Tock Seng Hospital', '11 Jalan Tan Tock Seng, Singapore 308433', 'acute');
        INSERT INTO Hospitals(name, location, hospital_type) VALUES ('Bright Vision Hospital', '5 Lorong Napiri, Singapore 547530', 'community');

        INSERT INTO Clinics(hospital_id, specialization_id) VALUES (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6);
        INSERT INTO Clinics(hospital_id, specialization_id) VALUES (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6);
        INSERT INTO Clinics(hospital_id, specialization_id) VALUES (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6);

        /* Every clinic has 1 room initially */
        INSERT INTO Rooms VALUES (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1);
        INSERT INTO Rooms VALUES (7, 1), (8, 1), (9, 1), (10, 1), (11, 1), (12, 1);
        INSERT INTO Rooms VALUES (13, 1), (14, 1), (15, 1), (16, 1), (17, 1), (18, 1);


        /* DOCTORS (with PERSONS) x18 */
        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0123123A', 'Patricio Mohammed', 'M', '1972-04-23'::timestamp with time zone , '2 Westerfield Terrace');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (1, 1, '+65 68641793');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0106341Z', 'Noelani Ferdinand', 'M', '1983-04-12'::timestamp with time zone , '7 Fordem Court');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (2, 1, '+65 99739006');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0522101Z', 'Ev Rounsivall', 'F', '1987-11-03'::timestamp with time zone , '4 American Ash Pass');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (3, 1, '+65 90020128');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0202663Z', 'Blake Mac', 'M', '1961-04-19'::timestamp with time zone , '2 Mallard Park');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (4, 1, '+65 84522866');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0573534Z', 'Lori Irons', 'F', '1962-06-25'::timestamp with time zone , '0208 Bellgrove Park');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (5, 1, '+65 60696160');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0681762Z', 'Barbe Fudge', 'F', '1967-06-17'::timestamp with time zone , '46866 Susan Hill');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (6, 1, '+65 82965235');


        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0913459X', 'Ethel Renehan', 'F', '1959-12-08'::timestamp with time zone , '72886 Mosinee Point');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (7, 2, '+65 62008881');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0321806Z', 'Bearnard Mc Ilory', 'M', '1961-05-09'::timestamp with time zone , '79 Mosinee Road');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (8, 2, '+65 66382079');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0019711W', 'Adria Sweetnam', 'F', '1976-10-28'::timestamp with time zone , '95 Summerview Place');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (9, 2, '+65 90294187');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0998130U', 'Jecho Misken', 'M', '1958-07-25'::timestamp with time zone , '62531 Hazelcrest Plaza');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (10, 2, '+65 62237827');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0575244W', 'Dunstan Reedshaw', 'M', '1974-03-08'::timestamp with time zone , '66 Clyde Gallagher Trail');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (11, 2, '+65 69401386');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0042740Y', 'Berri Dodshun', 'M', '1970-03-29'::timestamp with time zone , '93 David Alley');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (12, 2, '+65 95922416');


        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0302386U', 'Gard Leeb', 'M', '1966-11-26'::timestamp with time zone , '987 Valley Edge Drive');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (13, 3, '+65 80002146');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0265900Z', 'Lexi McGregor', 'F', '1974-08-01'::timestamp with time zone , '	390 Utah Plaza');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (14, 3, '+65 95908029');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0451237Z', 'Giraldo Pedrozzi', 'M', '1990-02-21'::timestamp with time zone , '20302 Claremont Road');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (15, 3, '+65 69545037');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0908762Z', 'Jacinta Berthomier', 'F', '1955-08-03'::timestamp with time zone , '9748 Sundown Street');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (16, 3, '+65 69013401');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0483695Z', 'Myrtle Standrin', 'F', '1988-08-28'::timestamp with time zone , '87 Morrow Hill');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (17, 3, '+65 87878096');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0008109Z', 'Byrle Bolesma', 'M', '1972-07-19'::timestamp with time zone , '67 Golf View Crossing');
        INSERT INTO Doctors(id, hospital_id, phone) VALUES (18, 3, '+65 68775943');


        /* DOCTOR SPECIALIZATIONS */
        INSERT INTO DoctorsSpecializations VALUES (1, 1, 'consultant');
        INSERT INTO DoctorsSpecializations VALUES (1, 2, 'specialist');
        INSERT INTO DoctorsSpecializations VALUES (2, 2, 'consultant');
        INSERT INTO DoctorsSpecializations VALUES (2, 3, 'specialist');
        INSERT INTO DoctorsSpecializations VALUES (3, 3, 'consultant');
        INSERT INTO DoctorsSpecializations VALUES (3, 4, 'senior consultant');
        INSERT INTO DoctorsSpecializations VALUES (4, 4, 'consultant');
        INSERT INTO DoctorsSpecializations VALUES (4, 5, null);
        INSERT INTO DoctorsSpecializations VALUES (5, 6, null);
        INSERT INTO DoctorsSpecializations VALUES (5, 5, 'consultant');
        INSERT INTO DoctorsSpecializations VALUES (6, 6, 'consultant');

        INSERT INTO DoctorsSpecializations VALUES (7, 1, 'specialist');
        INSERT INTO DoctorsSpecializations VALUES (8, 2, null);
        INSERT INTO DoctorsSpecializations VALUES (9, 3, null);
        INSERT INTO DoctorsSpecializations VALUES (10, 4, 'specialist');
        INSERT INTO DoctorsSpecializations VALUES (11, 5, 'specialist');
        INSERT INTO DoctorsSpecializations VALUES (12, 6, 'specialist');

        INSERT INTO DoctorsSpecializations VALUES (13, 1, 'senior consultant');
        INSERT INTO DoctorsSpecializations VALUES (14, 1, null);
        INSERT INTO DoctorsSpecializations VALUES (14, 2, 'senior consultant');
        INSERT INTO DoctorsSpecializations VALUES (15, 3, 'senior consultant');
        INSERT INTO DoctorsSpecializations VALUES (16, 4, null);
        INSERT INTO DoctorsSpecializations VALUES (17, 5, 'senior consultant');
        INSERT INTO DoctorsSpecializations VALUES (18, 6, 'senior consultant');

        /* Patients x8 – id starts from 19 */
        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0996338Z', 'Elfrieda Lockless', 'F', '1959-08-24'::timestamp with time zone , '0 Reindahl Terrace');
        INSERT INTO Patients VALUES (19, '+65 93824611', 'Mrs');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0381322Y', 'Marie Hogsden', 'F', '1993-11-16'::timestamp with time zone , '4 Blue Bill Park Park');
        INSERT INTO Patients VALUES (20, '+65 94897143', 'Miss');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0784791Y', 'Wynn Wrathmall', 'M', '1965-01-20'::timestamp with time zone , '11 Declaration Court');
        INSERT INTO Patients VALUES (21, '+65 90938755', 'Mr');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0506732Z', 'Marilin Kilty', 'F', '1955-09-12'::timestamp with time zone , '24 Warner Lane');
        INSERT INTO Patients VALUES (22, '+65 85531972', 'Ms');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0945015Y', 'Gunner Pairpoint', 'M', '1987-03-28'::timestamp with time zone , '2282 Raven Street');
        INSERT INTO Patients VALUES (23, '+65 91540457', 'Mr');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0502317Z', 'Ky Pritchard', 'M', '1963-07-23'::timestamp with time zone , '21891 Melody Court');
        INSERT INTO Patients VALUES (24, '+65 94286119', 'Mr');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0803758X', 'Peggi Handy', 'F', '1976-06-18'::timestamp with time zone , '2538 Tomscot Way');
        INSERT INTO Patients VALUES (25, '+65 96717283', 'Ms');

        INSERT INTO Persons(nric, fullname, gender, dob, address) VALUES ('T0836148V', 'Meredith Goosey', 'F', '1964-10-31'::timestamp with time zone , '2126 3rd Parkway');
        INSERT INTO Patients VALUES (26, '+65 86520858', 'Mrs');


        /* APPOINTMENTS 
        Distribution of appts:
            1. have old appt & follow_up appt
            2. only have old appts (haven't booked new appt yet)
            3. no old_appt, have new appts 
            4. no old appt, no new appts
        */

        /* Case 1: Has Old Appt(s) AND Has New Appt(s) 
            -> patient_id = 19, 20 
        */
        INSERT INTO Appointments VALUES (13, 1, 19, '2022-06-07T12:00'::timestamp with time zone, 'completed', 13, 'first consult');
        INSERT INTO Appointments VALUES (3, 1, 20, '2022-06-07T12:00'::timestamp with time zone, 'completed', 2, 'first consult');

        INSERT INTO Appointments VALUES (13, 1, 19, '2023-11-11T10:30'::timestamp with time zone, 'upcoming', 13, 'follow up');
        INSERT INTO Appointments VALUES (3, 1, 20, '2023-10-10T10:30'::timestamp with time zone, 'upcoming', 2, 'follow up');

        /* Case 2: Only has Old Appt(s)
            -> patient_id = 21, 22
        */
        INSERT INTO Appointments VALUES (6, 1, 21, '2022-05-05T11:00'::timestamp with time zone, 'completed', null, 'first consult');
        INSERT INTO Appointments VALUES (12, 1, 22, '2022-04-04T13:00'::timestamp with time zone, 'completed', 12, 'first consult');

        /* Case 3: Only has New Appt(s)
            -> patient_id = 23, 24
        */
        INSERT INTO Appointments VALUES (8, 1, 23, '2023-09-09T11:00'::timestamp with time zone, 'upcoming', 8, 'first consult');
        INSERT INTO Appointments VALUES (5, 1, 24, '2023-11-28T13:00'::timestamp with time zone, 'upcoming', null, 'first consult');

        END;
        `;
    
    return db.none(dbInitScript, {})
            .then(() => {
                res.send({ msg: "Successfully reset the database." });
            })
            .catch(err => {
                res.status(500).json({ error: "Failed to reset database" });
            });
}

module.exports = {
    resetDatabase,
}
