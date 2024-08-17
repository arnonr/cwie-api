const express = require("express");
const authMiddleware = require("./middleware/authMiddleware"); // import middleware
const router = express.Router();
// import api from './api/index.js'
const auth = require("./api/auth");
const user = require("./api/user");
const campus = require("./api/campus");
const faculty = require("./api/faculty");
const department = require("./api/department");
const division = require("./api/division");
const company = require("./api/company");
const subDistrict = require("./api/sub-district");
const group = require("./api/group");
const groupPermission = require("./api/group-permission");
const province = require("./api/province");
const district = require("./api/district");
const userStatus = require("./api/user-status");
const teacherProfile = require("./api/teacher-profile");
const staffProfile = require("./api/staff-profile");
const permission = require("./api/permission");
const studentStatus = require("./api/student-status");
const studentProfile = require("./api/student-profile");

router.use(
    // `${process.env.SUB_URL}/api/v${process.env.API_VERSION}`,
    `/api/v${process.env.API_VERSION}`,
    router.use("/auth", auth),
    router.use("/user", user),
    router.use("/campus", campus),
    router.use("/faculty", faculty),
    router.use("/department", department),
    router.use("/division", division),
    router.use("/company", authMiddleware, company),
    router.use("/sub-district", subDistrict),
    router.use("/group", group),
    router.use("/group-permission", groupPermission),
    router.use("/province", province),
    router.use("/district", district),
    router.use("/user-status", userStatus),
    router.use("/teacher-profile", teacherProfile),
    router.use("/staff-profile", staffProfile),
    router.use("/permission", permission),
    router.use("/student-status", studentStatus),
    router.use("/student-profile", studentProfile)
);

module.exports = router;
