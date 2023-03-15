const { validationResult } = require('express-validator');
const moment = require("moment");

const REGEX_PATTERNS = {
    nricPattern: /(T|S|F|G)\d{7}[A-Z]/,
    phonePattern: /\+65 (9|8|6)\d{7}/,
};
Object.freeze(REGEX_PATTERNS);

const ENUM_VALUES = {
    APPOINTMENT_STATUS: ['upcoming', 'completed', 'missed'],
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

const validateDob = (dob) => {
    checkNotNull('dob', dob);
    checkStringNotEmpty("dob", dob);

    date = moment(dob, "YYYY-MM-DD", true);

    if (!date.isValid()) {
        throw new Error('Date provided is invalid. Must match: YYYY-MM-DD format.');
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
        throw new Error('gender provided is invalid. Only: "F", "M" and "O" are accepted.');
    }
    
    return true;
}

const validateNric = (nric) => {
    checkNotNull('nric', nric);
    
    if (!REGEX_PATTERNS.nricPattern.test(nric)) {
        throw new Error('nric is invalid.');
    }

    return true;
}

const validatePatientTitle = (title) => {
    checkNotNull("title", title);

    if (!ENUM_VALUES.PATIENT_TITLE.includes(title)) {
        throw new Error('patient title provided is invalid. Only: "Miss", "Mrs", "Mr" and "Ms" are accepted.');
    }
    
    return true;
}

const validatePhone = (phone) => {
    checkNotNull('phone', phone);

    if (!REGEX_PATTERNS.phonePattern.test(phone)) {
        throw new Error('phone is invalid.');
    }

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
    console.log(errors);
    formattedErrorMsgs = result.errors.map(err => `Error in req.${err.location} for parameter ${err.param}: ${err.msg}`);

    return res.status(400).send({ errors: formattedErrorMsgs});
}


module.exports = {
    validateAddress,
    validateDob,
    validateFullName,
    validateGender,
    validateNric, 
    validatePatientTitle,
    validatePhone,

    checkValidations,
}