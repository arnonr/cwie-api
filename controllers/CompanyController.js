const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");
const $table = "company";

const prisma = new PrismaClient().$extends({
    result: {
        company: {
            namecard_file: {
                needs: { namecard_file: true },
                compute: (company) =>
                    company.namecard_file
                        ? `${process.env.PATH_UPLOAD}${company.namecard_file}`
                        : null,
            },
        },
    },
});

const filterData = (req) => {
    const {
        id,
        uuID,
        name,
        phone,
        email,
        blacklist,
        address,
        province_id,
        district_id,
        sub_district_id,
        is_active,
    } = req.query;

    let $where = {
        deleted_at: null,
        ...(id && { id: Number(id) }),
        ...(uuID && { uuID: uuID }),
        ...(name && { name: { contains: name } }),
        ...(phone && { phone: { contains: phone } }),
        ...(email && { email: { contains: email } }),
        ...(blacklist && { blacklist: blacklist }),
        ...(address && { address: { contains: address } }),
        ...(province_id && { id: Number(province_id) }),
        ...(district_id && { id: Number(district_id) }),
        ...(sub_district_id && { id: Number(sub_district_id) }),
        ...(is_active && { is_active: Number(is_active) }),
    };

    return $where;
};

const schema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().allow(null, ""),
    email: Joi.string().allow(null, ""),
    website: Joi.string().allow(null, ""),
    blacklist: Joi.bool().allow(null, ""),
    comment: Joi.string().allow(null, ""),
    namecard_file: Joi.string().allow(null, ""),
    address: Joi.string().allow(null, ""),
    province_id: Joi.number().required(),
    district_id: Joi.number().required(),
    sub_district_id: Joi.number().required(),
    is_active: Joi.boolean().required(),
});

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    uuID: true,
    name: true,
    phone: true,
    email: true,
    website: true,
    blacklist: true,
    comment: true,
    namecard_file: true,
    address: true,
    province_id: true,
    district_id: true,
    sub_district_id: true,
    is_active: true,
    province_detail: {
        select: {
            name_th: true,
        },
    },
    district_detail: {
        select: {
            name_th: true,
        },
    },
    sub_district_detail: {
        select: {
            name_th: true,
        },
    },
};

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
            res.status(404).json({ msg: error.message });
        }
    },

    async onGetByuuID(req, res) {
        try {
            const uuID = Number(req.params.uuID);
            
            if (isNaN(uuID)) {
                return res.status(400).json({ msg: "Invalid uuID format" });
            }

            const item = await prisma[$table].findUnique({
                select: selectField,
                where: {
                    uuID,
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

            await prisma[$table].update({
                where: {
                    id: Number(id),
                },
                data: {
                    deleted_at: new Date(),
                },
            });

            res.status(200).json({ msg: "success" });
        } catch (error) {
            console.error("Error deleting item:", error);
            res.status(400).json({ msg: error.message });
        }
    },
};

module.exports = { ...methods };
