const express = require("express");
const router = express.Router();
const cacheMiddleware = require("../middleware/cacheMiddleware"); // import middleware

const controllers = require("../../controllers/StudentProfileController");

router.get("/", controllers.onGetAll);
router.get("/:id", controllers.onGetById);

router.post("/", controllers.onCreate);

// router.put("/:id", controllers.onUpdate);

router.post("/:id", controllers.onUpdate); /* POST method for Upload file */

router.delete("/:id", controllers.onDelete);

module.exports = router;