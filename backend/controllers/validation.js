const { validationResult } = require('express-validator');
const moment = require("moment");

const REGEX_PATTERNS = {
    nricPattern: /(T|S|F|G)\d{7}[A-Z]/,
    phonePattern: /\+65 (9|8|6)\d{7}/,
};
Object.freeze(REGEX_PATTERNS);

const ENUM_VALUES = {
    APPOINTMENT_STATUS: ['upcoming', 'completed', 'missed'],
    APPOINTMENT_TYPE: ['first consult', 'follow up', 'review'],
    DOCTOR_RANKING: ['consultant', 'specialist', 'senior consultant'],
    GENDER: ['F', 'M', 'O'],
    HOSPITAL_TYPE: ['acute', 'community'],
    PATIENT_TITLE: ['Miss', 'Ms', 'Mr', 'Mrs'],
}
Object.freeze(ENUM_VALUES);

// Checks if a field is undefined or null
const checkNotNull = (fieldName, value) => {
    if (value == undefined || value == null) {
        throw new Error(`No ${fieldName} field provided`);
    }
}

const checkStringNotEmpty = (fieldName, value) => {
    if (value.length === "") {
        throw new Error(`${fieldName} cannot be empty`);
    }
}

const checkStringShorterThan = (fieldName, value, maxLength) => {
    if (value.length > maxLength) {
        throw new Error(`${fieldName} cannot be longer than ${maxLength} characters`);
    }
}

// Validation Chain Methods
const validateAddress = (address) => {
    checkNotNull('address', address);
    checkStringNotEmpty('address', address);

    checkStringShorterThan('address', address, 255);
    
    return true;
}

const validateApptType = (apptType) => {
    checkNotNull("apptType", apptType);

    if (!ENUM_VALUES.APPOINTMENT_TYPE.includes(apptType)) {
        throw new Error(`Appointment Type provided is invalid. Only: 'first consult', 'follow up' and 'review' are accepted. Got: ${apptType}.`);
    }
    
    return true;
}

const validateDob = (dob) => {
    checkNotNull('dob', dob);
    checkStringNotEmpty("dob", dob);

    date = moment(dob, "YYYY-MM-DD", true);

    if (!date.isValid()) {
        throw new Error(`Date provided is invalid. Must match: YYYY-MM-DD format. Got: ${dob}.`);
    }

    now = moment();
    diff_days = date.diff(now, 'days');
    age = now.diff(date, 'years');

    if (diff_days >= 0) {
        throw new Error('dob cannot be after current date.');
    }

    MAX_AGE = 200
    if (age >= MAX_AGE) {
        earliestYear = now.subtract({years: MAX_AGE}).year();
        throw new Error(`dob cannot be before ${earliestYear} (ie. age >= ${MAX_AGE}).`);
    }
    
    return true;
}

const validateDateTime = (fieldName, datetime) => {
    checkNotNull(fieldName, datetime);
    checkStringNotEmpty(fieldName, datetime);

    parsedDatetime = moment(datetime, "YYYY-MM-DDTHH:mm", true);

    if (!parsedDatetime.isValid()) {
        throw new Error(`${fieldName} provided is invalid. Must match: YYYY-MM-DDTHH:mm format. Got: ${datetime}.`);
    }

    return true;
}

const validateFutureDateTime = (fieldName, datetime) => {
    validateDateTime(fieldName, datetime);

    datetime = moment(datetime, "YYYY-MM-DDTHH:mm", true);

    now = moment();
    num_days_before = now.diff(datetime, 'days');

    if (num_days_before > 0) {
        throw new Error(`${fieldName} provided must be after current datetime (${now}). Got: ${datetime}.`);
    }

    return true;
}

const validateFullName = (fullname) => {
    checkNotNull('fullname', fullname);
    checkStringNotEmpty("fullname", fullname);

    checkStringShorterThan('fullname', fullname, 100);
    
    return true;
}

const validateGender = (gender) => {
    checkNotNull('gender', gender);
    checkStringNotEmpty("gender", gender);

    if (!ENUM_VALUES.GENDER.includes(gender)) {
        throw new Error(`gender provided is invalid. Only: "F", "M" and "O" are accepted. Got: ${gender}.`);
    }
    
    return true;
}

const validateNonNullPositiveInteger = (fieldName, value) => {
    checkNotNull(fieldName, value);
    
    if (isNaN(value) || value == 0) {
        throw new Error(`${fieldName} must be a positive integer. Got: ${value}.`);
    }
    return true;
}

const validateNullablePositiveInteger = (fieldName, value) => {
    if (value == null) {
        return true;
    }
    
    if (isNaN(parseInt(value)) || parseInt(value) == 0) {
        throw new Error(`${fieldName} must be a positive integer. Got: ${value}.`);
    }
    return true;
}

const validateNric = (nric) => {
    checkNotNull('nric', nric);
    
    if (!REGEX_PATTERNS.nricPattern.test(nric)) {
        throw new Error(`nric is invalid. Got: ${nric}.`);
    }

    return true;
}

const validatePatientTitle = (title) => {
    checkNotNull("title", title);

    if (!ENUM_VALUES.PATIENT_TITLE.includes(title)) {
        throw new Error(`patient title provided is invalid. Only: "Miss", "Mrs", "Mr" and "Ms" are accepted. Got: ${title}.`);
    }
    
    return true;
}

const validatePhone = (phone) => {
    checkNotNull('phone', phone);

    if (!REGEX_PATTERNS.phonePattern.test(phone)) {
        throw new Error(`phone is invalid. Got: ${phone}.`);
    }

    return true;
}

const validateRanking = (ranking) => {
    checkNotNull('ranking', ranking);
    checkStringNotEmpty('ranking', ranking);

    if (!ENUM_VALUES.DOCTOR_RANKING.includes(ranking)) {
        throw new Error(`doctor ranking provided is invalid. Only: "consultant", "specialist" and "senior consultant" are accepted. Got: ${ranking}.`);
    }

    return true;
}

const validateSpecialization = (specialization) => {
    checkNotNull('specialization', specialization);
    checkStringNotEmpty('specialization', specialization);

    return true;
}

/**
 * Validation functions by themselves do not throw errors. 
 * This method will collect all the error message for all validation chains called before this is called, 
 * formats all errors and throws it.
 * 
 * @param {*} req contains all validation errors.
 * @param {*} res 
 * @param {*} next passes execution to the next (middleware) function (when there is no validation error).
 */
const checkValidations = (req, res, next) => {
    const result = validationResult(req);
    const noErrors = result.isEmpty();

    if (noErrors) { // no errors continue execution
        return next();
    }

    errors = result.errors;
    formattedErrorMsgs = result.errors.map(err => `Error in req.${err.location} for parameter ${err.param}: ${err.msg}`);

    return res.status(400).send({ errors: formattedErrorMsgs});
}


module.exports = {
    validateAddress,
    validateApptType,
    validateDob,
    validateDateTime,
    validateFutureDateTime,
    validateFullName,
    validateGender,
    validateNonNullPositiveInteger,
    validateNullablePositiveInteger,
    validateNric, 
    validatePatientTitle,
    validatePhone,
    validateRanking,
    validateSpecialization,

    checkValidations,
}
