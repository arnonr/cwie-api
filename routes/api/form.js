const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/FormController");

router.post("/add-request-book", controllers.onAddRequestBook);
router.post("/map-teacher-student", controllers.onMapTeacherStudent);
router.get("/", controllers.onGetAll);
router.get("/get-by-uuid/:uuid", controllers.onGetByuuID);
router.get("/:id", controllers.onGetById);

router.post("/", controllers.onCreate);

// router.put("/:id", controllers.onUpdate);

router.post("/:id", controllers.onUpdate); /* POST method for Upload file */

router.delete("/cancel/:id", controllers.onCancel);

router.delete("/:id", controllers.onDelete);

module.exports = router;
