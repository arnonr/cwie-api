const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/LoginLogController");

router.get("/", controllers.onGetAll);
router.get("/get-by-user/:user_id", controllers.onGetAllByUserId);

module.exports = router;
