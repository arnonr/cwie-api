const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const axios = require("axios").default;
const CryptoJS = require("crypto-js");
const secretKey = process.env.SECRET_KEY; // ใช้ secret key เดียวกันที่ใช้ในการเข้ารหัส
const facultyController = require("./FacultyController");
const divisionController = require("./DivisionController");
const departmentController = require("./DepartmentController");
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
                username = accountInfo.userInfo.username;
                // const {
                //     username,
                //     displayname,
                //     pid,
                //     person_key,
                //     email,
                //     account_type,
                // } = userInfo;

                // const nameArray = userInfo.displayname.split(" ");
                // const surname = nameArray.slice(1).join(" ");
                // console.log(accountInfo);
                // userInfo: {
                //     username: 's5402041520261',
                //     displayname: 'ศิวกร หลงสมบูรณ์',
                //     firstname_en: 'SIWAKORN',
                //     lastname_en: 'LONGSOMBOON',
                //     pid: '2331400026249',
                //     person_key: '',
                //     email: 's5402041520261@kmutnb.ac.th',
                //     account_type: 'alumni'
                //   },
                //   studentInfo: {
                //     STU_CODE: '5402041520261',
                //     PRE_NAME_THAI: 'นาย',
                //     STU_FIRST_NAME_THAI: 'ศิวกร',
                //     STU_LAST_NAME_THAI: 'หลงสมบูรณ์',
                //     PRE_NAME_ENG: 'Mr. ',
                //     STU_FIRST_NAME_ENG: 'SIWAKORN',
                //     STU_LAST_NAME_ENG: 'LONGSOMBOON',
                //     SEX: 'M',
                //     LEVEL_CODE: 63,
                //     LEVEL_DESC: 'ปริญญาตรีเทียบโอน 2 - 3 ปี',
                //     FAC_CODE: '02',
                //     FAC_NAME_THAI: 'คณะครุศาสตร์อุตสาหกรรม',
                //     DEPT_CODE: '0204',
                //     DEPT_NAME_THAI: 'คอมพิวเตอร์ศึกษา',
                //     DIV_CODE: '020401',
                //     DIV_NAME_THAI: 'เทคโนโลยีคอมพิวเตอร์',
                //     DIV_SHRT_NAME: 'TCT',
                //     CAMPUS_ID: 10,
                //     CAMPUS_NAME: 'มจพ. กรุงเทพฯ',
                //     CURR_CODE: null,
                //     STU_YEAR: 3,
                //     BRANCH_CODE: 10,
                //     BRANCH_NAME: 'มจพ. กรุงเทพฯ',
                //     STU_STATUS: 40,
                //     STU_STATUS_DESC: 'สำเร็จการศึกษา'
                //   }
                const userInfo = accountInfo.userInfo;
                const displayname = userInfo.displayname;
                const account_type = userInfo.account_type;
                const email = userInfo.email;
                const person_key = userInfo.person_key;
                const pid = userInfo.pid;

                let status_id = 1;
                let group_id = null;
                let type_id = null;

                if (account_type == "student" || account_type == "alumni") {
                    status_id = 2; // อนุมัติ
                    group_id = 3; // นักศึกษา
                    type_id = 1; // นักศึกษา

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
                        // const email = accountInfo.studentInfo.STU_EMAIL;
                        // console.log(fac_code, fac_name, dept_code, dept_name, div_code);
                        // console.log(fac_code, dept_code, div_code);

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
                        }
                        const profile = await upsertStudentProfile(user_id, data);
                    }

                }
                // else {
                //     group_id = req.body.group_id;
                // }

                type_id = group_id;
                // firstname: nameArray[0],
                // surname: surname,
                console.log("username", username);
                const newUser = await prisma[$table].upsert({
                    where: {
                        username: username,
                    },
                    create: {
                        username: username,
                        name: displayname,
                        email: email,
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
                        // email: email,
                        // status_id: status_id,
                        // group_id: group_id,
                        // type_id: type_id,
                        // citizen_id: pid,
                        // account_type: account_type,
                        // updated_by: username
                    },
                });

                res.status(200).json({ ...newUser, icit_account: accountInfo, msg: "success" });
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
