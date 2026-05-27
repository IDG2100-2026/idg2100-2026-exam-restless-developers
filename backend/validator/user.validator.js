import { param, body, validationResult } from "express-validator";

import {
  checkuserExists,
  checkUsernameExists,
} from "../services/user.services.js";

import {
  MIN_AGE,
  MAX_AGE,
  MIN_LENGTH_USERNAME,
  MAX_LENGTH_USERNAME,
  MIN_LENGTH_PWD,
  MAX_LENGTH_PWD,
  MIN_LOWERCASE_USERNAME,
  MIN_UPPERCASE_USERNAME,
  MIN_NUMBERS_USERNAME,
  MIN_SYMBOLS_USERNAME,
} from "../config/constants.js";

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  next();
}

export function validateUserId() {
  return [
    param("uid").custom(async (uid) => {
      const user = await checkuserExists(uid);

      if (!user) {
        throw new Error("User not found");
      }

      return true;
    }),

    handleValidationErrors,
  ];
}

export function validateCreateUser() {
  return [
    body("username")
      .trim()
      .isAlphanumeric()
      .withMessage("Username can only contain letters and numbers.")
      .isLength({
        min: MIN_LENGTH_USERNAME,
        max: MAX_LENGTH_USERNAME,
      })
      .withMessage(
        `Username must be between ${MIN_LENGTH_USERNAME} and ${MAX_LENGTH_USERNAME} characters long.`
      )
      .bail()
      .custom(async (username) => {
        const existingUser = await checkUsernameExists(username);

        if (existingUser) {
          throw new Error("Username already exists and is in use");
        }

        return true;
      }),

    body("password")
      .trim()
      .isStrongPassword({
        minLength: MIN_LENGTH_PWD,
        minLowercase: MIN_LOWERCASE_USERNAME,
        minUppercase: MIN_UPPERCASE_USERNAME,
        minNumbers: 1,
        minSymbols: MIN_SYMBOLS_USERNAME,
      })
      .withMessage(
        `Password must be between ${MIN_LENGTH_PWD} and ${MAX_LENGTH_PWD} characters long and contain uppercase letters, lowercase letters, numbers, and symbols.`
      ),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Invalid email format."),

    body("dob")
      .isInt({
        min: new Date().getFullYear() - MAX_AGE,
        max: new Date().getFullYear() - MIN_AGE,
      })
      .withMessage(
        `User must be between ${MIN_AGE} and ${MAX_AGE} years old.`
      )
      .toInt(),

    handleValidationErrors,
  ];
}

export function validateLoginUser() {
  return [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),

    handleValidationErrors,
  ];
}

export function validateUpdateUser() {
  return [
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Invalid email format."),

    body("aboutMe")
      .optional()
      .isString()
      .isLength({ max: 700 })
      .withMessage("About me cannot be longer than 700 characters."),

    body("profileImage")
      .optional()
      .isString()
      .withMessage("Profile image must be a string."),

    body("password")
      .optional()
      .trim()
      .isStrongPassword({
        minLength: MIN_LENGTH_PWD,
        minLowercase: MIN_LOWERCASE_USERNAME,
        minUppercase: MIN_UPPERCASE_USERNAME,
        minNumbers: 1,
        minSymbols: MIN_SYMBOLS_USERNAME,
      })
      .withMessage(
        `Password must be between ${MIN_LENGTH_PWD} and ${MAX_LENGTH_PWD} characters long and contain uppercase letters, lowercase letters, numbers, and symbols.`
      ),

    body("dob")
      .optional()
      .isInt({
        min: new Date().getFullYear() - MAX_AGE,
        max: new Date().getFullYear() - MIN_AGE,
      })
      .withMessage(`User must be between ${MIN_AGE} and ${MAX_AGE} years old.`)
      .toInt(),

    handleValidationErrors,
  ];
}
