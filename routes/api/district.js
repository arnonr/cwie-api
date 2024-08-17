const express = require("express");
const router = express.Router();
const cacheMiddleware = require("../middleware/cacheMiddleware"); // import middleware

const controllers = require("../../controllers/DistrictController");

router.get("/", cacheMiddleware, controllers.onGetAll);
router.get("/:id", controllers.onGetById);

module.exports = router;
