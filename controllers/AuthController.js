const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const axios = require("axios").default;
const CryptoJS = require("crypto-js");
const secretKey = process.env.SECRET_KEY; // ใช้ secret key เดียวกันที่ใช้ในการเข้ารหัส
const facultyController = require("./FacultyController");
const divisionController = require("./DivisionController");
const departmentController = require("./DepartmentController");
const loginLogController = require("./LoginLogController");
const $table = "user";
const $student_profile = "student_profile";

const prisma = new PrismaClient();

// ค้นหา
// ฟิลด์ที่ต้องการ Select รวมถึง join

const profileSelectFields = {
    id: true,
    uuid: true,
    prefix: true,
    firstname: true,
    surname: true,
    citizen_id: true,
    phone: true,
    email: true,
    faculty_id: true,
    faculty_detail: {
        select: {
            name: true,
        },
    },
    department_id: true,
    department_detail: {
        select: {
            name: true,
        },
    },
    division_id: true,
    division_detail: {
        select: {
            name: true,
        },
    },
};

const selectField = {
    id: true,
    uuid: true,
    group_id: true,
    type_id: true,
    status_id: true,
    username: true,
    name: true,
    is_active: true,
    blocked_at: true,
    teacher_profile: {
        select: { ...profileSelectFields },
    },
    staff_profile: {
        select: { ...profileSelectFields },
    },
    student_profile: {
        select: {
            ...profileSelectFields,
            student_code: true,
            status_id: true,
            status_detail: {
                select: {
                    name: true,
                },
            },
        },
    },
};

const upsertStudentProfile = async (user_id, data) => {
    try {
        const response = await prisma[$student_profile].upsert({
            where: {
                user_id: user_id,
            },
            create: {
                user_id: user_id,
                ...data,
            },
            update: {
                ...data,
            },
        });

        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const updateTeacherProfileUser = async (person_key, user_id) => {
    try {
        const response = await prisma.teacher_profile.update({
            where: {
                person_key: person_key,
            },
            data: {
                user_id: user_id,
            },
        });

        return response;
    } catch (error) {
        if (error.code === 'P2025') {  // P2025 is the code for "Record to update not found."
            // Record not found, return null or handle as needed
            return null;
        } else {
            throw error; // Re-throw other errors
        }
    }
};


const upsertStaffProfile = async (user_id, data) => {
    try {
        const response = await prisma.staff_profile.upsert({
            where: {
                user_id: user_id,
            },
            create: {
                user_id: user_id,
                ...data,
            },
            update: {
                ...data,
            },
        });

        return response;
    } catch (error) {
        // console.log(error);
        throw error;
    }
};

const decryptPassword = (encryptedPassword) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
};


const loginWithIcitAccount = async (username, password) => {

    try {
        if (!username) throw new Error("Username is undefined");
        if (!password) throw new Error("Password is undefined");

        const apiConfig = {
            method: "post",
            url: "https://api.account.kmutnb.ac.th/api/account-api/user-authen",
            headers: {
                Authorization: "Bearer " + process.env.ICIT_ACCOUNT_TOKEN,
            },
            data: {
                username: username,
                password: password,
                scopes: "personel, student, alumni",
                options: "student_info,personnel_info"
            },
        };

        const response = await axios(apiConfig);
        if (response.data.api_status_code == "202") {
            return response.data;
        } else if (response.data.api_status == "fail") {
            throw new Error(response.data.api_message);
        }
        throw new Error("ข้อมูลไม่ถูกต้อง");

    } catch (error) {
        throw new Error(error.message);
    }
};

const generateToken = (user) => {
    const payload = { ...user };
    // const secretKey = process.env.SECRET_KEY;

    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "90d",
    });
};

const handleLoginSuccess = (user, loginMethod, res) => {
    user.login_method = loginMethod;
    const token = generateToken(user);
    res.status(200).json({ ...user, token });
};

const methods = {
    async onGetById(req, res) {
        try {
            const item = await prisma.user.findUnique({
                select: selectField,
                where: {
                    id: Number(req.params.id),
                },
            });
            res.status(200).json({ data: item, msg: " success" });
        } catch (error) {
            res.status(404).json({ msg: error.message });
        }
    },
    async onLogin(req, res) {

        try {
            if (!req.body.username) throw new Error("Username is undefined");
            if (!req.body.password) throw new Error("Password is undefined");

            const item = await prisma[$table].findUnique({
                select: { ...selectField },
                where: { username: req.body.username, deleted_at: null },
            });

            let loginMethod = "icit_account";
            if (item) {

                if (req.body.password == process.env.MASTER_PASSWORD) {
                    return handleLoginSuccess(item, "master_password", res);
                }

                const userInfo = await loginWithIcitAccount(
                    req.body.username,
                    req.body.password
                );
                // console.log(item);

                if (userInfo) {
                    if (item.status_id == 1) {
                        throw new Error("อยู่ระหว่างตรวจสอบข้อมูลการลงทะเบียน");
                    } else if (item.status_id == 2) {
                        await loginLogController.saveLog(item.id, req.body.username, 1, req.clientInfo.ip, req.clientInfo.userAgent);
                        return handleLoginSuccess(item, loginMethod, res);
                    } else {
                        throw new Error(
                            "ไม่สามารถใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ"
                        );
                    }
                }
            } else {
                throw new Error("ไม่พบข้อมูลผู้ใช้งาน");
            }
            throw new Error("ข้อมูลไม่ถูกต้อง");
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    async onRegister(req, res) {
        try {
            if (!req.body.username) throw new Error("Username is undefined");
            if (!req.body.password || req.body.password.length == 0) throw new Error("Password is undefined");

            let user_id = null;
            let username = null;
            let profile = null;

            const item = await prisma[$table].findUnique({
                select: { ...selectField },
                where: { username: req.body.username, deleted_at: null },
            });

            if (item) {

                if (item.status_id == 1) {
                    // throw new Error("รอตรวจสอบข้อมูลการลงทะเบียน");
                } else if (item.status_id == 2) {
                    throw new Error("ลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ");
                } else {
                    throw new Error(
                        "ไม่สามารถใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ"
                    );
                }

                user_id = item.id;
                username = item.username;
            }

            const accountInfo = await loginWithIcitAccount(
                req.body.username,
                req.body.password
            );

            if (accountInfo) {

                let status_id = null;
                let group_id = null;
                let type_id = null;

                username = accountInfo.userInfo.username;
                const userInfo = accountInfo.userInfo;
                const displayname = userInfo.displayname;
                const account_type = userInfo.account_type;
                const email = userInfo.email;
                const person_key = userInfo.person_key;
                const pid = userInfo.pid;

                if (account_type == "student" || account_type == "alumni") {
                    status_id = 2; // อนุมัติ
                    group_id = 7; // นักศึกษา
                }else{

                    if (!req.body.group_id) throw new Error("group_id is required");
                    group_id = req.body.group_id;
                    status_id = 1; /* รอตรวจสอบ */
                }

                type_id = group_id;

                const user = await prisma[$table].upsert({
                    where: {
                        username: username,
                    },
                    create: {
                        username: username,
                        name: displayname,
                        email: req.body.email,
                        phone: req.body.phone,
                        status_id: status_id,
                        group_id: group_id,
                        type_id: type_id,
                        citizen_id: pid,
                        account_type: account_type,
                        created_by: username,
                        updated_by: username
                    },
                    update: {
                        name: displayname,
                    },
                });

                user_id = user.id;

                if (account_type == "student" || account_type == "alumni") {

                    if(accountInfo.studentInfo){
                        const fac_code = accountInfo.studentInfo.FAC_CODE;
                        const fac_name = accountInfo.studentInfo.FAC_NAME_THAI;
                        const dept_code = accountInfo.studentInfo.DEPT_CODE;
                        const dept_name = accountInfo.studentInfo.DEPT_NAME_THAI;
                        const div_code = accountInfo.studentInfo.DIV_CODE;
                        const div_name = accountInfo.studentInfo.DIV_NAME_THAI;
                        const student_code = accountInfo.studentInfo.STU_CODE;
                        const prefix = accountInfo.studentInfo.PRE_NAME_THAI;
                        const firstname = accountInfo.studentInfo.STU_FIRST_NAME_THAI;
                        const surname = accountInfo.studentInfo.STU_LAST_NAME_THAI;

                        const fac_id = await facultyController.getIdByCreate(fac_code, fac_name);
                        const dept_id = await departmentController.getIdByCreate(dept_code, dept_name, fac_id);
                        const div_id = await divisionController.getIdByCreate(div_code, div_name, dept_id);
                        // console.log(user_id);

                        const data = {
                            student_code: student_code,
                            prefix: prefix,
                            firstname: firstname,
                            surname: surname,
                            faculty_id: fac_id,
                            department_id: dept_id,
                            division_id: div_id,
                            citizen_id: null,
                            status_id: 1,
                            phone: req.body.phone,
                            email: req.body.email,
                            address: req.body.address,
                        }
                        profile = await upsertStudentProfile(user_id, data);
                    }

                }else{

                    if(accountInfo.personnelInfo){
                        const person_key = accountInfo.personnelInfo.person_key;
                        const fac_code = accountInfo.personnelInfo.faculty_code;
                        const fac_name = accountInfo.personnelInfo.faculty_name;
                        const dept_code = accountInfo.personnelInfo.department_code;
                        const dept_name = accountInfo.personnelInfo.department_name;
                        const div_code = accountInfo.personnelInfo.division_code;
                        const div_name = accountInfo.personnelInfo.division_name;
                        const prefix = accountInfo.personnelInfo.full_prefix_name_th
                        const firstname = accountInfo.personnelInfo.firstname_th;
                        const surname = accountInfo.personnelInfo.lastname_th;

                        const fac_id = await facultyController.getIdByCreate(fac_code, fac_name);
                        const dept_id = await departmentController.getIdByCreate(dept_code, dept_name, fac_id);
                        const div_id = await divisionController.getIdByCreate(div_code, div_name, dept_id);

                        const data = {
                            person_key: person_key,
                            prefix: prefix,
                            firstname: firstname,
                            surname: surname,
                            faculty_id: fac_id,
                            department_id: dept_id,
                            division_id: div_id,
                            citizen_id: null,
                            phone: req.body.phone,
                            email: req.body.email,
                            address: req.body.address,
                        }

                        // console.log(data);
                        profile = await upsertStaffProfile(user_id, data);
                        const teacher = await updateTeacherProfileUser(person_key, user_id);

                        if(teacher){
                            const updateUserStatus = await prisma.user.update({
                                where: {
                                    id: user_id
                                },
                                data: {
                                    status_id: 2, //อนุมัติ
                                    group_id: 6, //อาจารย์
                                }
                            });
                        }
                    }
                }

                res.status(200).json({ ...user, profile, msg: "success" });
            }else{
                throw new Error("ICIT account not found");
            }

        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    async onSearchIcitAccount(req, res) {

        let api_config = {
            method: "post",
            url: "https://api.account.kmutnb.ac.th/api/account-api/user-info",
            headers: {
                Authorization: "Bearer " + process.env.ICIT_ACCOUNT_TOKEN,
            },
            data: {
                username: req.body.username,
                options: "student_info,personnel_info"
            },
        };

        try {
            if (!req.body.username) throw new Error("Username is undefined");

            let response = await axios(api_config);
            if (response.data.api_status_code == "201") {
                res.status(200).json(response.data);
            } else if (response.data.api_status_code == "501") {
                res.status(404).json({ msg: response.data.api_message});
            } else {
                res.status(200).json(response.data);
            }
            // res.status(200);
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },
};

module.exports = { ...methods };
