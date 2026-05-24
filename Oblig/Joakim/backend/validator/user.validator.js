import { param, body } from "express-validator";
import { checkUserExists, checkUsernameExists } from "../services/user.services.js";

export function validateUid() {
    return [
        param("uid")
            .isInt({ min: 1 })
            .withMessage("UID må være et heltall større enn 0")
            .toInt()
            .bail()
            .custom(checkUserExists)
    ];
}

export function validateUser() {
    return [
        body("uid")
            .isInt({ min: 1 })
            .withMessage("UID må være et heltall større enn 0")
            .toInt()
            .bail()
            .custom(async (uid) => {
                const exists = await checkUserExists(uid);
                if (exists) throw new Error("En bruker med denne UID-en finnes allerede");
                return true;
            }),

        body("username")
            .trim()
            .isAlphanumeric()
            .withMessage("Brukernavn kan kun inneholde bokstaver og tall")
            .isLength({ min: 3 })
            .withMessage("Brukernavn må være minst 3 tegn")
            .bail()
            .custom(async (username) => {
                const exists = await checkUsernameExists(username);
                if (exists) throw new Error("Dette brukernavnet er allerede i bruk");
                return true;
            }),

        body("password")
            .trim()
            .isStrongPassword({
                minLength: 9,
                minLowercase: 2,
                minUppercase: 2,
                minNumbers: 2,
                minSymbols: 2
            })
            .withMessage("Passordet oppfyller ikke kravene"),

        body("email")
            .isEmail()
            .withMessage("Ugyldig e‑postadresse"),

        body("dob")
            .isInt({ min: 1900, max: 2026 })
            .withMessage("Fødselsår må være et tall mellom 1900 og 2026")
            .toInt()
    ];
}

export function validateCreateUser() {
    return [
        body("username")
            .trim()
            .isAlphanumeric()
            .withMessage("Brukernavn kan kun inneholde bokstaver og tall")
            .isLength({ min: 3 })
            .withMessage("Brukernavn må være minst 3 tegn"),

        body("password")
            .exists().withMessage("Passord mangler")
            .bail()
            .isString().withMessage("Passord må være tekst")
            .bail()
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            })
            .withMessage("Passordet oppfyller ikke kravene"),

        body("email")
            .isEmail()
            .withMessage("Ugyldig e‑postadresse"),

        body("dob")
            .isInt({ min: 1900, max: 2026 })
            .withMessage("Fødselsår må være et tall mellom 1900 og 2026")
            .toInt()
    ];
}

export default {
    validateUid,
    validateUser,
    validateCreateUser
};
