const express = require("express");
const router = express.Router();
const cacheMiddleware = require("../middleware/cacheMiddleware"); // import middleware

const controllers = require("../../controllers/SemesterController");

router.get("/", controllers.onGetAll);
router.get("/:id", controllers.onGetById);
router.get("/:uuid", controllers.onGetByUUID);

router.post("/", controllers.onCreate);

router.put("/:id", controllers.onUpdate);

router.delete("/:id", controllers.onDelete);

module.exports = router;