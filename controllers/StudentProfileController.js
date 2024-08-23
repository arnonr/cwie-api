const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");

const prisma = new PrismaClient();
const $table = "student_profile";

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    uuid: true,
    user_id: true,
    prefix: true,
    firstname: true,
    surname: true,
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
            name: true
        }
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
    student_code: true,
    class_year: true,
    class_room: true,
    advisor_id: true,
    advisor_detail: {
        select: {
            prefix: true,
            firstname: true,
            surname: true,
        },
    },
    gpa: true,
    contact1_name: true,
    contact1_relation: true,
    contact1_phone: true,
    contact2_name: true,
    contact2_relation: true,
    contact2_phone: true,
    blood_group: true,
    congenital_disease: true,
    drug_allergy: true,
    emergency_phone: true,
    height: true,
    weight: true,
    status_id: true,
    status_detail: {
        select: {
            name: true,
        },
    },
    photo_file: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    is_active: true,
};
const filterData = (req) => {
    const { id, uuid, user_id, firstname, surname, citizen_id, phone, email, address, faculty_id, department_id, division_id, province_id, district_id, sub_district_id, student_code, class_year, class_room, advisor_id, gpa, contact1_name, contact1_relation, contact1_phone, contact2_name, contact2_relation, contact2_phone, blood_group, congenital_disease, drug_allergy, emergency_phone, status_id, is_active } = req.query;

    // id && เป็นการใช้การประเมินแบบ short-circuit ซึ่งหมายความว่าถ้า id มีค่าเป็น truthy (เช่น ไม่ใช่ null, undefined, 0, false, หรือ "" เป็นต้น) จะดำเนินการด้านหลัง &&
    let $where = {
        deleted_at: null,
        ...(id && { id: Number(id) }),
        ...(uuid && { uuid: uuid }),
        ...(user_id && { user_id: Number(user_id) }),
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
        ...(student_code && { student_code: { contains: student_code } }),
        ...(class_year && { class_year: { contains: class_year } }),
        ...(class_room && { class_room: { contains: class_room } }),
        ...(advisor_id && { advisor_id: Number(advisor_id) }),
        ...(gpa && { gpa: { contains: gpa } }),
        ...(contact1_name && { contact1_name: { contains: contact1_name } }),
        ...(contact1_relation && { contact1_relation: { contains: contact1_relation } }),
        ...(contact1_phone && { contact1_phone: { contains: contact1_phone } }),
        ...(contact2_name && { contact2_name: { contains: contact2_name } }),
        ...(contact2_relation && { contact2_relation: { contains: contact2_relation } }),
        ...(contact2_phone && { contact2_phone: { contains: contact2_phone } }),
        ...(blood_group && { blood_group: { contains: blood_group } }),
        ...(congenital_disease && { congenital_disease: { contains: congenital_disease } }),
        ...(drug_allergy && { drug_allergy: { contains: drug_allergy } }),
        ...(emergency_phone && { emergency_phone: { contains: emergency_phone } }),
        ...(status_id && { status_id: Number(status_id) }),
        ...(is_active && { is_active: Number(is_active) }),
    };

    return $where;
};

const schema = Joi.object({
    user_id: Joi.number().required(),
    prefix: Joi.string().allow(null, ""),
    firstname: Joi.string().allow(null, ""),
    surname: Joi.string().allow(null, ""),
    citizen_id: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    email: Joi.string().allow(null, ""),
    address: Joi.string().allow(null, ""),
    faculty_id: Joi.number().required(),
    department_id: Joi.number().required(),
    division_id: Joi.number().required(),
    province_id: Joi.number().required(),
    district_id: Joi.number().required(),
    sub_district_id: Joi.number().required(),
    student_code: Joi.string().required(),
    class_year: Joi.string().allow(null, ""),
    class_room: Joi.string().allow(null, ""),
    advisor_id: Joi.number().allow(null, ""),
    gpa: Joi.number().precision(2).max(4.0).required(),
    contact1_name: Joi.string().allow(null, ""),
    contact1_relation: Joi.string().allow(null, ""),
    contact1_phone: Joi.string().allow(null, ""),
    contact2_name: Joi.string().allow(null, ""),
    contact2_relation: Joi.string().allow(null, ""),
    contact2_phone: Joi.string().allow(null, ""),
    blood_group: Joi.string().allow(null, ""),
    congenital_disease: Joi.string().allow(null, ""),
    drug_allergy: Joi.string().allow(null, ""),
    emergency_phone: Joi.string().allow(null, ""),
    status_id: Joi.number().required(),
    is_active: Joi.boolean().default(true),
});

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
            if(error.code === "P2025") {
                return res.status(404).json({ msg: "Item not found" });
            }
            res.status(404).json({ msg: error.message });
        }
    },

    // สร้าง
    async onCreate(req, res) {
        try {
            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({ msg: error.details[0].message });
            }

            const item = await prisma[$table].create({
                data: { ...value, created_by: req.user?.name },
            });

            res.status(201).json({ ...item, msg: "success" });
        } catch (error) {
            console.error("Error creating item:", error);
            if(error.code === "P2002") {
                return res.status(409).json({ msg: "Item already exists" });
            }
            res.status(500).json({ msg: error.message });
        }
    },

    // แก้ไข
    async onUpdate(req, res) {
        try {
            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({ msg: error.details[0].message });
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
            if(error.code === "P2025") {
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
                }
            });

            res.status(200).json({ msg: "success" });
        } catch (error) {
            console.error("Error deleting item:", error);
            if(error.code === "P2025") {
                res.status(404).json({ msg: "Item not found" });
            }
            res.status(400).json({ msg: error.message });
        }
    },
};

module.exports = { ...methods };
