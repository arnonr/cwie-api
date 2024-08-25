const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/FacultyController");

router.post("/hris-sync-faculty", controllers.onHrisSyncFaculty);
router.get("/", controllers.onGetAll);
router.get("/:id", controllers.onGetById);

router.post("/", controllers.onCreate);

router.put("/:id", controllers.onUpdate);

router.delete("/:id", controllers.onDelete);

module.exports = router;
