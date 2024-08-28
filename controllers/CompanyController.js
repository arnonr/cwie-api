const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");
const uploadController = require("./UploadsController");
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
        uuid,
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
        ...(uuid && { uuid: uuid }),
        ...(name && { name: { contains: name } }),
        ...(phone && { phone: { contains: phone } }),
        ...(email && { email: { contains: email } }),
        ...(blacklist && { blacklist: blacklist }),
        ...(address && { address: { contains: address } }),
        ...(province_id && { id: Number(province_id) }),
        ...(district_id && { id: Number(district_id) }),
        ...(sub_district_id && { id: Number(sub_district_id) }),
        ...(is_active && { is_active: JSON.parse(is_active) }),
    };

    return $where;
};

const baseSchema = {
    name: Joi.string(),
    phone: Joi.string().allow(null, ""),
    email: Joi.string().allow(null, ""),
    website: Joi.string().allow(null, ""),
    blacklist: Joi.bool().allow(null, ""),
    comment: Joi.string().allow(null, ""),
    namecard_file: Joi.string().allow(null, ""),
    address: Joi.string().allow(null, ""),
    province_id: Joi.number(),
    district_id: Joi.number(),
    sub_district_id: Joi.number(),
    is_active: Joi.boolean().default(true),
};

const createSchema = Joi.object({
    ...baseSchema,
    name: baseSchema.name.required(),
    province_id: baseSchema.province_id.required(),
    district_id: baseSchema.district_id.required(),
    sub_district_id: baseSchema.sub_district_id.required(),
});

const updateSchema = Joi.object(baseSchema);

const validateCreate = (data) => createSchema.validate(data);
const validateUpdate = (data) => updateSchema.validate(data);

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    uuid: true,
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
                select: req.query.selectField
                    ? JSON.parse(req.query.selectField)
                    : selectField,
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
            const uuid = req.params.uuid;

            if (!uuid) {
                return res.status(400).json({ msg: "uuid is required" });
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

    // สร้าง
    async onCreate(req, res) {
        try {
            const { error, value } = validateCreate(req.body);

            if (error) {
                return res.status(400).json({ msg: error.details[0].message });
            }

            let namecardPath = await uploadController.onUploadFile(
                req,
                "/company/",
                "namecard_file"
            );

            if (namecardPath == "error") {
                return res.status(500).send("namecard_file error");
            }

            if (namecardPath) {
                value.namecard_file = namecardPath;
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
            const { error, value } = validateUpdate(req.body);

            if (error) {
                return res.status(400).json({ msg: error.details[0].message });
            }

            let namecardPath = await uploadController.onUploadFile(
                req,
                "/company/",
                "namecard_file"
            );

            if (namecardPath == "error") {
                return res.status(500).send("namecard_file error");
            }

            if (namecardPath) {
                value.namecard_file = namecardPath;
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
                    updated_by: req.user?.name,
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
