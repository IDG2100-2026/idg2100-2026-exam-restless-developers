import { body, param } from "express-validator";

const matchValidator = {
  validateCreateMatch() {
    return [
      body("players")
        .isArray({ min: 1 })
        .withMessage("Spillerlisten må inneholde minst én spiller"),

      body("variant").exists().withMessage("Variant må være spesifisert"),

      body("variant.rounds")
        .isIn([3, 5, 7])
        .withMessage("Antall runder må være 3, 5 eller 7"),

      body("variant.straightsAllowed")
        .isBoolean()
        .withMessage("straightsAllowed må være en boolean"),

      body("variant.timeControl")
        .isIn([5, 10, 15])
        .withMessage("timeControl må være 5, 10 eller 15"),
    ];
  },

  validateJoinMatch() {
    return [
      param("id").isMongoId().withMessage("Ugyldig kamp-ID"),

      // userId is optional because anonymous players don't have one
      body("userId")
        .optional()
        .isMongoId()
        .withMessage("Ugyldig bruker-ID"),

      body("isAnonymous")
        .optional()
        .isBoolean()
        .withMessage("isAnonymous må være en boolean"),
    ];
  },

  validateSaveResult() {
    return [
      param("id").isMongoId().withMessage("Ugyldig kamp-ID"),

      body("roundsData")
        .isArray({ min: 1 })
        .withMessage("roundsData må være en liste"),

      // winner/loser can be null for anonymous matches
      body("winner")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Ugyldig vinner-ID"),

      body("loser")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Ugyldig taper-ID"),

      body("eloChange")
        .optional()
        .isObject()
        .withMessage("eloChange må være et objekt"),
    ];
  },

  validateComment() {
    return [
      param("id").isMongoId().withMessage("Ugyldig kamp-ID"),

      body("text")
        .isString()
        .isLength({ min: 1 })
        .withMessage("Kommentaren kan ikke være tom"),

      // user is optional because anonymous users cannot comment
      body("user")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Ugyldig bruker-ID"),
    ];
  },
};

export default matchValidator;
