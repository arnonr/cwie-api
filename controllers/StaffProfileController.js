const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");

const prisma = new PrismaClient();
const $table = "staff_profile";

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    uuid: true,
    user_id: true,
    person_key: true,
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
    is_active: true,
};
const filterData = (req) => {
    const { id, uuid, executive_position, user_id, person_key, firstname, surname, citizen_id, phone, email, address, faculty_id, department_id, division_id, is_active } = req.query;

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
        ...(is_active && { is_active: Number(is_active) }),
    };

    return $where;
};

const schema = Joi.object({
    user_id: Joi.number().required(),
    person_key: Joi.string().allow(null, ""),
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
