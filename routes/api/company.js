const express = require("express");
const router = express.Router();
const cacheMiddleware = require("../middleware/cacheMiddleware"); // import middleware

const controllers = require("../../controllers/CompanyController");

router.get("/", cacheMiddleware, controllers.onGetAll);
router.get("/:id", controllers.onGetById);

router.get("/get-by-uuid/:uuid", controllers.onGetByuuID);

router.post("/", controllers.onCreate);

// router.put("/:id", controllers.onUpdate);

router.post("/:id", controllers.onUpdate); /* POST method for Upload file */

router.delete("/:id", controllers.onDelete);

module.exports = router;
