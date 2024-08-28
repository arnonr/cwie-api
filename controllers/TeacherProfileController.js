const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");
const axios = require("axios");
// const prisma = new PrismaClient();
const $table = "teacher_profile";
const uploadController = require("./UploadsController");
const facultyController = require("./FacultyController");
const departmentController = require("./DepartmentController");

const prisma = new PrismaClient().$extends({
    result: {
        teacher_profile: {
            //extend Model name
            signature_file: {
                // the name of the new computed field
                needs: {
                    /* field */ signature_file: true,
                },
                compute(model) {
                    let signature_file = null;

                    if (model.signature_file != null) {
                        signature_file =
                            process.env.PATH_UPLOAD + model.signature_file;
                    }

                    return signature_file;
                },
            },
            fullname: {
                needs: {
                    prefix: true,
                    firstname: true,
                    surname: true,
                },
                compute(model) {
                    let prefix = "";

                    prefix = model.prefix ? model.prefix : "";

                    return prefix + model.firstname + " " + model.surname;
                },
            },
        },
    },
});

const hrisFindPersonnel = async (searchParams) => {
    try {
        if (
            searchParams.person_key == null &&
            searchParams.firstname == null &&
            searchParams.lastname == null &&
            searchParams.position_type_id == null
        ) {
            // return "Please enter search parameter";
            throw new Error("Search parameter must be defined");
        }

        dataParams = {};

        if (searchParams.firstname)
            dataParams["firstname"] = searchParams.firstname;

        if (searchParams.lastname)
            dataParams["lastname"] = searchParams.lastname;

        if (searchParams.person_key)
            dataParams["person_key"] = searchParams.person_key;

        if (searchParams.position_type_id)
            dataParams["position_type_id"] = searchParams.position_type_id;

        if (searchParams.person_key)
            dataParams["person_key"] = searchParams.person_key;

        if (searchParams.faculty_code)
            dataParams["faculty_code"] = searchParams.faculty_code;

        if (searchParams.department_code)
            dataParams["department_code"] = searchParams.department_code;

        const config = {
            method: "post",
            url: "https://api.hris.kmutnb.ac.th/api/personnel-api/list-personnel",
            headers: { Authorization: "Bearer " + process.env.HRIS_TOKEN },
            data: dataParams,
        };

        const response = await axios(config);
        if (response.status === 404) {
            return null;
        }
        // console.log(response);
        return response.data.data;
    } catch (error) {
        // console.log(error);
        throw error;
    }
};

const hrisPersonnelInfo = async (person_key) => {
    try {
        if (person_key == null) {
            // return "Please enter search parameter";
            throw new Error("person_key is required");
        }

        dataParams = {};
        dataParams["person_key"] = person_key;
        dataParams["get_work_info"] = 1;

        const config = {
            method: "post",
            url: "https://api.hris.kmutnb.ac.th/api/personnel-api/personnel-detail",
            headers: { Authorization: "Bearer " + process.env.HRIS_TOKEN },
            data: dataParams,
        };

        const response = await axios(config);
        // console.log(response);
        // if (response.status === 404) {
        //     return null;
        // }
        return response.data;
    } catch (error) {
        throw error;
    }
};

const upsertTeacherProfile = async (person_key, data) => {
    try {
        const response = await prisma.teacher_profile.upsert({
            where: {
                person_key: person_key,
            },
            create: {
                person_key: person_key,
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
// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    uuid: true,
    signature_file: true,
    executive_position: true,
    user_id: true,
    person_key: true,
    prefix: true,
    firstname: true,
    surname: true,
    fullname: true,
    citizen_id: true,
    phone: true,
    email: true,
    address: true,
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
    province_id: true,
    province_detail: {
        select: {
            name_th: true,
        },
    },
    district_id: true,
    district_detail: {
        select: {
            name_th: true,
        },
    },
    sub_district_id: true,
    sub_district_detail: {
        select: {
            name_th: true,
        },
    },
    is_active: true,
};
const filterData = (req) => {
    const {
        id,
        uuid,
        executive_position,
        user_id,
        person_key,
        firstname,
        surname,
        citizen_id,
        phone,
        email,
        address,
        faculty_id,
        department_id,
        division_id,
        province_id,
        district_id,
        sub_district_id,
        is_active,
    } = req.query;

    // id && เป็นการใช้การประเมินแบบ short-circuit ซึ่งหมายความว่าถ้า id มีค่าเป็น truthy (เช่น ไม่ใช่ null, undefined, 0, false, หรือ "" เป็นต้น) จะดำเนินการด้านหลัง &&
    let $where = {
        ...(id && { id: Number(id) }),
        ...(uuid && { uuid: uuid }),
        ...(executive_position && { executive_position: executive_position }),
        ...(user_id && { user_id: Number(user_id) }),
        ...(person_key && { person_key: person_key }),
        ...(firstname && { firstname: { contains: firstname } }),
        ...(surname && { surname: { contains: surname } }),
        ...(citizen_id && { citizen_id: citizen_id }),
        ...(phone && { phone: { contains: phone } }),
        ...(email && { email: { contains: email } }),
        ...(address && { address: { contains: address } }),
        ...(faculty_id && { faculty_id: Number(faculty_id) }),
        ...(department_id && { department_id: Number(department_id) }),
        ...(division_id && { division_id: Number(division_id) }),
        ...(province_id && { province_id: Number(province_id) }),
        ...(district_id && { district_id: Number(district_id) }),
        ...(sub_district_id && { sub_district_id: Number(sub_district_id) }),
        ...(is_active && { is_active: JSON.parse(is_active) }),
    };

    return $where;
};

const baseSchema = {
    executive_position: Joi.string().allow(null, ""),
    signature_file: Joi.string().allow(null, ""),
    user_id: Joi.number(),
    person_key: Joi.string().allow(null, ""),
    prefix: Joi.string().allow(null, ""),
    firstname: Joi.string().allow(null, ""),
    surname: Joi.string().allow(null, ""),
    citizen_id: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    email: Joi.string().allow(null, ""),
    address: Joi.string().allow(null, ""),
    faculty_id: Joi.number(),
    department_id: Joi.number(),
    division_id: Joi.number(),
    province_id: Joi.number(),
    district_id: Joi.number(),
    sub_district_id: Joi.number(),
    is_active: Joi.boolean().default(true),
};

const createSchema = Joi.object({
    ...baseSchema,
    faculty_id: baseSchema.faculty_id.required(),
    department_id: baseSchema.department_id.required(),
    division_id: baseSchema.division_id.required(),
});

const updateSchema = Joi.object(baseSchema);

const validateCreate = (data) => createSchema.validate(data);
const validateUpdate = (data) => updateSchema.validate(data);

const methods = {
    async onGetAll(req, res) {
        try {
            const $where = filterData(req);
            const other = await countDataAndOrder(prisma, req, $where, $table);

            const items = await prisma[$table].findMany({
                select: selectField,
                where: $where,
                orderBy: other.$orderBy,
                skip: other.$offset,
                take: other.$perPage,
            });

            res.status(200).json({
                data: items,
                totalData: other.$count,
                totalPage: other.$totalPage,
                currentPage: other.$currentPage,
                msg: "success",
            });
        } catch (error) {
            console.error("Error fetching data:", error); // Log error for debugging
            res.status(500).json({ msg: error.message });
        }
    },

    async onGetById(req, res) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({ msg: "Invalid ID format" });
            }

            const item = await prisma[$table].findUnique({
                select: selectField,
                where: {
                    id,
                },
            });

            if (!item) {
                return res.status(404).json({ msg: "Item not found" });
            }

            res.status(200).json({
                data: item,
                msg: "success",
            });
        } catch (error) {
            console.error("Error fetching item by ID:", error);
            if (error.code === "P2025") {
                return res.status(404).json({ msg: "Item not found" });
            }
            res.status(404).json({ msg: error.message });
        }
    },

    // สร้าง
    async onCreate(req, res) {
        try {
            const { error, value } = validateCreate(req.body);

            if (error) {
                return res.status(400).json({ msg: error.details[0].message });
            }

            let signaturePath = await uploadController.onUploadFile(
                req,
                "/teacher_profile/",
                "signature_file"
            );

            if (signaturePath == "error") {
                return res.status(500).send("signature_file error");
            }

            if (signaturePath) {
                value.signature_file = signaturePath;
            }

            const item = await prisma[$table].create({
                data: { ...value, created_by: req.user?.name },
            });

            res.status(201).json({ ...item, msg: "success" });
        } catch (error) {
            console.error("Error creating item:", error);
            if (error.code === "P2002") {
                return res.status(409).json({ msg: "Item already exists" });
            }
            res.status(500).json({ msg: error.message });
        }
    },

    // แก้ไข
    async onUpdate(req, res) {
        try {
            const { error, value } = validateUpdate(req.body);

            if (error) {
                return res.status(400).json({ msg: error.details[0].message });
            }

            let signaturePath = await uploadController.onUploadFile(
                req,
                "/teacher_profile/",
                "signature_file"
            );

            if (signaturePath == "error") {
                return res.status(500).send("signature_file error");
            }

            if (signaturePath) {
                value.signature_file = signaturePath;
            }

            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: { ...value, updated_by: req.user?.name },
            });

            res.status(200).json({ ...item, msg: "success" });
        } catch (error) {
            console.error("Error updating item:", error);
            if (error.code === "P2025") {
                return res.status(404).json({ msg: "Item not found" });
            }
            res.status(400).json({ msg: error.message });
        }
    },
    // ลบ
    async onDelete(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ msg: "ID is required" });
            }

            await prisma[$table].delete({
                where: {
                    id: Number(id),
                },
            });

            res.status(200).json({ msg: "success" });
        } catch (error) {
            console.error("Error deleting item:", error);
            if (error.code === "P2025") {
                res.status(404).json({ msg: "Item not found" });
            }
            res.status(400).json({ msg: error.message });
        }
    },

    async onHrisFindPersonnel(req, res) {
        try {
            const data = await hrisFindPersonnel(req.query);
            res.status(200).json({ data: data, msg: "success" });
        } catch (error) {
            // console.error("Error fetching data:", error);
            res.status(500).json({ msg: error.message });
        }
    },

    async onHrisSyncTeacher(req, res) {
        try {
            req.query.position_type_id = 1;
            const data = await hrisFindPersonnel(req.query);
            // Now you can work with the peopleData array
            for (const person of data) {
                const person_key = person.person_key;
                const firstname_th = person.firstname_th;
                const lastname_th = person.lastname_th;
                const firstname_en = person.firstname_en;
                const lastname_en = person.lastname_en;
                const fac_code = person.faculty_code;
                const department_code = person.department_code;

                const fac_id = await facultyController.getIdByCode(fac_code);
                const dept_id = await departmentController.getIdByCode(
                    department_code
                );

                const data = {
                    person_key: person_key,
                    prefix: null,
                    firstname: firstname_th,
                    surname: lastname_th,
                    faculty_id: fac_id,
                    department_id: dept_id,
                    division_id: null,
                    citizen_id: null,
                    phone: null,
                    email: null,
                    address: null,
                };

                // console.log(data);
                await upsertTeacherProfile(person_key, data);
            }

            res.status(200).json({ data: data, msg: "success" });
        } catch (error) {
            // console.error("Error fetching data:", error);
            res.status(500).json({ msg: error.message });
        }
    },

    async onHrisSyncTeacherByPersonKey(req, res) {
        try {
            const person_key = req.params.person_key;
            const data = await hrisPersonnelInfo(person_key);
            console.log(data);
            if (data !== null) {
                const person_key = data.person_key;
                const prefix = data.person_info.full_prefix_name_th;
                const firstname_th = data.person_info.firstname_th;
                const lastname_th = data.person_info.lastname_th;
                const firstname_en = data.person_info.firstname_en;
                const lastname_en = data.person_info.lastname_en;
                const fac_code = data.work_info.faculty_code;
                const department_code = data.work_info.department_code;

                const fac_id = await facultyController.getIdByCode(fac_code);
                const dept_id = await departmentController.getIdByCode(
                    department_code
                );

                const personData = {
                    person_key: person_key,
                    prefix: prefix,
                    firstname: firstname_th,
                    surname: lastname_th,
                    faculty_id: fac_id,
                    department_id: dept_id,
                    division_id: null,
                    citizen_id: null,
                    phone: null,
                    email: null,
                    address: null,
                };
                // console.log(personData);

                const item = await upsertTeacherProfile(person_key, personData);
                return res.status(200).json({ ...item, msg: "success" });
            }
            // console.log(data);
            res.status(200).json({ data: data, msg: "success" });
        } catch (error) {
            // console.error("Error fetching data:", error);
            res.status(500).json({ msg: error.message });
        }
    },
};

module.exports = { ...methods };
