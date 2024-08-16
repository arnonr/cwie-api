const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");

const prisma = new PrismaClient();
const $table = "sub_district";

const filterData = (req) => {
    const { id, name_th, name_en, zip_code, district_id, is_active } =
        req.query;

    let $where = {
        deleted_at: null,
        ...(id && { id: Number(id) }),
        ...(name_th && { name_th: name_th }),
        ...(name_en && { name_en: name_en }),
        ...(zip_code && { zip_code: zip_code }),
        ...(district_id && { id: Number(district_id) }),
        ...(is_active && { is_active: Number(is_active) }),
    };

    return $where;
};

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    name_th: true,
    name_en: true,
    zip_code: true,
    district_id: true,
    is_active: true,
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
};

module.exports = { ...methods };
