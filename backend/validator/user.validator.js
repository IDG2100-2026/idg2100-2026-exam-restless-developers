import { param, body } from 'express-validator';
import {checkUserExists, checkUsernameExists } from '../services/user.service.js';
import {
    MIN_USERNAME_LENGTH,
    MAX_USERNAME_LENGTH,
    MIN_PWD_LENGTH,
    MAX_PWD_LENGTH,
    MIN_LOWERCASE_USERNAME,
    MIN_UPPERCASE_USERNAME,
    MIN_NUMBERS_USERNAME,
    MIN_SYMBOLS_USERNAME
} from '../config/constants.js';

export function validateUserId() {
    return [
        param('uid')
        .isInt()
        .withMessage('User ID must be an integer')
        .toInt()
        .bail()
        .custom(async (uid) => {
            const user = await checkUserExists(uid);
            if (!user) {
                return Promise.reject('User not found');
            }
        }),

        body('username')
        .trim()
        .isAlphanumeric()
        .withMessage(`Username can only contain letters and numbers.`)
        .isLength({ min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH })
        .withMessage(`Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters long.`)
        .bail()
        .custom(async (username) => {
            const existingUser = await checkUsernameExists(username);
            if (existingUser == true) throw new Error('Username already exists and is in use');
            return true;
        }),

        body("pwd")
        .trim()
        .isStrongPassword({
            minLength: MIN_PWD_LENGTH,
            minLowercase: MIN_LOWERCASE_USERNAME,
            minUppercase: MIN_UPPERCASE_USERNAME,
            minNumbers: MIN_NUMBERS_USERNAME,
            minSymbols: MIN_SYMBOLS_USERNAME
        })
        .withMessage("Password must be at least 5 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 2 numbers, and 1 symbol."),

        body("email")
        .isEmail()
        .withMessage("Invalid email format."),

        body("dob")
        .isInt({ min: MIN_AGE, max: MAX_AGE })
        .withMessage(`Date of birth must be between ${MIN_AGE} and ${MAX_AGE} years old.`)
    ];

}