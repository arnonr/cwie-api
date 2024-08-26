const express = require("express");
const router = express.Router();
const cacheMiddleware = require("../middleware/cacheMiddleware"); // import middleware

const controllers = require("../../controllers/ProvinceController");

router.get("/thailand", cacheMiddleware, controllers.onGetThailand);
router.get("/", cacheMiddleware, controllers.onGetAll);
router.get("/:id", controllers.onGetById);

module.exports = router;
