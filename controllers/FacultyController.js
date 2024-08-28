const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");
const axios = require('axios');
const prisma = new PrismaClient();
const $table = "faculty";

const filterData = (req) => {
    const { id, code, name, phone, email, campus_id, is_active } = req.query;

    // id && เป็นการใช้การประเมินแบบ short-circuit ซึ่งหมายความว่าถ้า id มีค่าเป็น truthy (เช่น ไม่ใช่ null, undefined, 0, false, หรือ "" เป็นต้น) จะดำเนินการด้านหลัง &&
    let $where = {
        deleted_at: null,
        ...(id && { id: Number(id) }),
        ...(code && { code: code }),
        ...(name && { name: { contains: name } }),
        ...(phone && { phone: { contains: phone } }),
        ...(email && { email: { contains: email } }),
        ...(campus_id && { id: Number(campus_id) }),
        ...(is_active && { is_active: JSON.parse(is_active) }),
    };

    return $where;
};

const schema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    name_short: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    email: Joi.string().allow(null, ""),
    campus_id: Joi.number().required(),
    is_active: Joi.boolean().required(),
});

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    code: true,
    name: true,
    name_short: true,
    phone: true,
    email: true,
    campus_id: true,
    is_active: true,
    campus_detail: {
        select: {
            name: true,
        },
    },
};

const hrisFaculty = async () => {
    try {

        dataParams = {}

        const config = {
            method: "post",
            url: "https://api.hris.kmutnb.ac.th/api/masterdata-api/list-faculty",
            headers: { Authorization: "Bearer " + process.env.HRIS_TOKEN },
            data: dataParams,
        };

        const response = await axios(config);
        // console.log(response);
        if (response.status === 404) {
            return null;
        }

        return response.data.data;

    }catch (error) {
        // console.log(error);
        throw error;
    }
};

const getIdByCode = async (code) => {

    const item = await prisma[$table].findUnique({
        where: {
            code,
        },
    });
    return item?.id;
};

const getIdByCreate = async (code, name) => {
    const item = await prisma[$table].upsert({
        where: {
            code: code
        },
        update: {
            // name: name
        },
        create: {
            code: code,
            name: name
        }
    })
    return item.id;
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

            await prisma[$table].update({
                where: {
                    id: Number(id),
                },
                data: {
                    deleted_at: new Date(),
                    deleted_at_by: req.user?.name,
                },
            });

            res.status(200).json({ msg: "success" });
        } catch (error) {
            console.error("Error deleting item:", error);
            if(error.code === "P2025") {
                return res.status(404).json({ msg: "Item not found" });
            }
            res.status(400).json({ msg: error.message });
        }
    },

    async onHrisSyncFaculty(req, res) {
        try {
            const data = await hrisFaculty(req.query);
            // console.log(data);
            for (const faculty of data) {
                const faculty_code = faculty.faculty_code;
                const faculty_name_th = faculty.faculty_name_th;

                const fac_id = await getIdByCreate(faculty_code, faculty_name_th);
            }

            res.status(200).json({data: data, msg: "success" });
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

};

module.exports = { ...methods, getIdByCreate, getIdByCode };
