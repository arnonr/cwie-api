const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const axios = require("axios").default;
const CryptoJS = require("crypto-js");
const secretKey = process.env.SECRET_KEY; // ใช้ secret key เดียวกันที่ใช้ในการเข้ารหัส
const $table = "user";

const prisma = new PrismaClient();

// ค้นหา
// ฟิลด์ที่ต้องการ Select รวมถึง join

const profileSelectFields = {
    id: true,
    uuID: true,
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
    major_id: true,
    major_detail: {
        select: {
            name: true,
        },
    },
};

const selectField = {
    id: true,
    uuID: true,
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

const decryptPassword = (encryptedPassword) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
};

const loginWithIcitAccount = async (username, password) => {
    // let p1 = decryptPassword(password);
    let p1 = password;
    if (p1 == "") {
        throw new Error("ข้อมูลไม่ถูกต้อง");
    }

    const apiConfig = {
        method: "post",
        url: "https://api.account.kmutnb.ac.th/api/account-api/user-authen",
        headers: {
            Authorization: "Bearer " + process.env.ICIT_ACCOUNT_TOKEN,
        },
        data: {
            username: username,
            password: p1,
            scopes: "personel",
        },
    };

    const response = await axios(apiConfig);
    if (response.data.api_status_code == "202") {
        return response.data.userInfo;
    } else if (response.data.api_status == "fail") {
        throw new Error(response.data.api_message);
    }
    throw new Error("ข้อมูลไม่ถูกต้อง");
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
                if (
                    decryptPassword(req.body.password) ===
                    process.env.MASTER_PASSWORD
                ) {
                    return handleLoginSuccess(item, "master_password", res);
                }

                const userInfo = await loginWithIcitAccount(
                    req.body.username,
                    req.body.password
                );
                console.log(item);

                if (userInfo) {
                    if (item.status_id == 1) {
                        throw new Error("รอตรวจสอบข้อมูล");
                    } else if (item.status_id == 2) {
                        return handleLoginSuccess(item, loginMethod, res);
                    } else {
                        throw new Error(
                            "ไม่สามารถใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ"
                        );
                    }
                }
            } else {
                throw new Error("กรุณาลงทะเบียนก่อนเข้าใช้งาน");
            }
            throw new Error("ข้อมูลไม่ถูกต้อง");
        } catch (error) {
            res.status(400).json({ msg: error.message });
        }
    },

    async onRegister(req, res) {
        try {
            if (!req.body.username) throw new Error("Username is undefined");
            if (!req.body.password) throw new Error("Password is undefined");

            const item = await prisma[$table].findUnique({
                select: { ...selectField },
                where: { username: req.body.username, deleted_at: null },
            });

            if (item) {
                if (item.status_id == 1) {
                    throw new Error("รอตรวจสอบข้อมูล");
                } else if (item.status_id == 2) {
                    throw new Error("พบผู้ใช้งานในระบบ สามารถเข้าใช้งานได้");
                } else {
                    throw new Error(
                        "ไม่สามารถใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ"
                    );
                }
            } else {
                const userInfo = await loginWithIcitAccount(
                    req.body.username,
                    req.body.password
                );

                if (userInfo) {
                    // userInfo: {
                    //     username: 'arnonr',
                    //     displayname: 'อานนท์ รักจักร์',
                    //     firstname_en: 'ARNON',
                    //     lastname_en: 'RUKJAK',
                    //     pid: '1100200629414',
                    //     person_key: '2009495034252',
                    //     email: 'arnonr@kmutnb.ac.th',
                    //     account_type: 'personel'
                    //   }

                    const {
                        username,
                        displayname,
                        pid,
                        person_key,
                        email,
                        account_type,
                    } = userInfo;
                    const nameArray = userInfo.displayname.split(" ");
                    const surname = nameArray.slice(1).join(" ");

                    let status_id = 1;
                    let group_id = null;
                    let type_id = null;

                    if (account_type == "student" || account_type == "alumni") {
                        status_id = 1;
                        group_id = 7;
                    } else {
                        group_id = req.body.group_id;
                    }
                    type_id = group_id;
                    // firstname: nameArray[0],
                    // surname: surname,

                    const newUser = await prisma[$table].create({
                        data: {
                            username: username,
                            name: displayname,
                            email: userInfo.email,
                            status_id: status_id,
                            group_id: group_id,
                            type_id: type_id,
                            citizen_id: pid,
                            account_type: account_type,
                            created_by: userInfo.username,
                            updated_by: userInfo.username,
                        },
                    });

                    // const profile =

                    res.status(200).json({ ...newUser, msg: "success" });
                }
            }
            throw new Error("ข้อมูล ICIT Account ไม่ถูกต้อง");
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
            data: { username: req.body.username },
        };

        try {
            let response = await axios(api_config);
            if (response.data.api_status_code == "201") {
                res.status(200).json(response.data.userInfo);
            } else if (response.data.api_status_code == "501") {
                res.status(404).json({ msg: response.data.api_message });
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
