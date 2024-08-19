const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");

const prisma = new PrismaClient();
const $table = "user";

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    uuid: true,
    group_id: true,
    type_id: true,
    status_id: true,
    username: true,
    name: true,
    citizen_id: true,
    phone: true,
    email: true,
    account_type: true,
    is_active: true,
    created_at: true,
    updated_at: true,
    blocked_at: true,
    group_detail: {
        select: {
            name: true,
        },
    },
    status_detail: {
        select: {
            name: true,
        },
    },
    permissions: {
        select: {
            name: true,
            action: true,
        },
    },
    teacher_profile: {

    },
    staff_profile: {

    },
    student_profile: {

    },
};

const filterData = (req) => {
    const { id, uuid, group_id, type_id, status_id, username, name, citizen_id, phone, email, account_type, is_active } = req.query;

    // id && เป็นการใช้การประเมินแบบ short-circuit ซึ่งหมายความว่าถ้า id มีค่าเป็น truthy (เช่น ไม่ใช่ null, undefined, 0, false, หรือ "" เป็นต้น) จะดำเนินการด้านหลัง &&
    let $where = {
        deleted_at: null,
        ...(id && { id: Number(id) }),
        ...(uuid && { uuid: uuid }),
        ...(group_id && { group_id: Number(group_id) }),
        ...(type_id && { type_id: Number(type_id) }),
        ...(status_id && { status_id: Number(status_id) }),
        ...(username && { username: username } ),
        ...(name && { name: { contains: name } }),
        ...(citizen_id && { citizen_id: { contains: citizen_id } }),
        ...(phone && { phone: { contains: phone } }),
        ...(email && { email: { contains: email } }),
        ...(account_type && { account_type: account_type }),
        ...(is_active && { is_active: Number(is_active) }),
    };

    return $where;
};

const schema = Joi.object({
    username: Joi.string().required(),
    name: Joi.string().required(),
    citizen_id: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    email: Joi.string().allow(null, ""),
    account_type: Joi.string().allow(null, ""),
    group_id: Joi.number().required(),
    type_id: Joi.number().required(),
    status_id: Joi.number().required(),
    is_active: Joi.boolean().default(true),
    password: Joi.string().allow(null, ""),
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
            if (error.code === "P2025") {
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
            if (error.code === "P2002") {
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

            // if(value.password) {
            //     value.password = encryptPassword(value.password);
            // }

            const item = await prisma[$table].update({
                where: {
                    uuid: req.params.uuid,
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

    async onDelete(req, res) {
        try {
            const { uuid } = req.params;

            if (!uuid) {
                return res.status(400).json({ msg: "uuid is required" });
            }

            await prisma[$table].update({
                where: {
                    uuid: uuid,
                },
                data: {
                    deleted_at: new Date(),
                    updated_by: req.user?.name,
                },
            });

            res.status(200).json({ msg: "success" });
        } catch (error) {
            console.error("Error deleting item:", error);
            if (error.code === "P2025") {
                return res.status(404).json({ msg: "Item not found" });
            }
            res.status(400).json({ msg: error.message });
        }
    },

    async onGetByUUID(req, res) {
        try {
            const uuid = req.params.uuid;

            if (!uuid) {
                return res.status(400).json({ msg: "Invalid UUID format" });
            }

            const item = await prisma[$table].findUnique({
                select: selectField,
                where: {
                    uuid: uuid,
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
            console.error("Error fetching item by uuID:", error);
            res.status(404).json({ msg: error.message });
        }
    },

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


};

module.exports = { ...methods };
