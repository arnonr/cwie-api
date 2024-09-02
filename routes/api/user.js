const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");

const controllers = require("../../controllers/UserController");

const loginValidator = [
    body("email", "Email does not Empty").not().isEmpty(),
    body("email", "Invalid email").isEmail(),
    body("password", "Password does not Empty").not().isEmpty(),
];

// router.post("/login", controllers.onLogin);
// router.post("/login", controllers.onLogin);
router.get("/count-all", controllers.onCountAll);
router.get("/:uuid", controllers.onGetByUUID);
router.get("/", controllers.onGetAll);


router.post("/", controllers.onCreate);

router.put("/:uuid", controllers.onUpdate);
// router.put("/:id", controllers.onUpdate); /* POST method for Upload file */

router.delete("/:id", controllers.onDelete);

module.exports = router;
