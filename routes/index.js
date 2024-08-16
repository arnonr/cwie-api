const express = require("express");
const authMiddleware = require("./middleware/authMiddleware"); // import middleware
const router = express.Router();
// import api from './api/index.js'
const auth = require("./api/auth");
const user = require("./api/user");
const campus = require("./api/campus");
const faculty = require("./api/faculty");
const department = require("./api/department");
const company = require("./api/company");
const subDistrict = require("./api/sub-district");
// const student = require("./api/student");
// const froala = require("./api/froala");

router.use(
    // `${process.env.SUB_URL}/api/v${process.env.API_VERSION}`,
    `/api/v${process.env.API_VERSION}`,
    router.use("/auth", auth),
    router.use("/user", user),
    router.use("/campus", campus),
    router.use("/faculty", faculty),
    router.use("/department", department),
    router.use("/company", authMiddleware, company),
    router.use("/sub-district", subDistrict)
    // router.use("/student", authMiddleware, student)
    // router.use("/froala", froala),
);

module.exports = router;
