const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/AuthController");

router.post("/login", controllers.onLogin);
router.post("/register", controllers.onRegister);
router.post("/search-icit-account", controllers.onSearchIcitAccount);
module.exports = router;
