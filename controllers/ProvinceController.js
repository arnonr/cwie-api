const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");

const subDistrictController = require("./SubDistrictController");
const prisma = new PrismaClient();
const $table = "province";

const filterData = (req) => {
    const { id, name_th, name_en, geography_id} =
        req.query;

    let $where = {
        deleted_at: null,
        ...(id && { id: Number(id) }),
        ...(name_th && { name_th: name_th }),
        ...(name_en && { name_en: name_en }),
        ...(geography_id && { geography_id: geography_id }),
    };

    return $where;
};

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    name_th: true,
    name_en: true,
    geography_id: true,
};

const transformPrismaResult = (items) => {
    return items.map(item => ({
        district: item.district.name_th,
        sub_district: item.name_th,
        province: item.district.province.name_th,
        post_code: item.zip_code,
        district_id: item.district.id,
        sub_district_id: item.id,
        province_id: item.district.province.id
    }));
};

const addresses_mapping = (addresses) => {
    return addresses.map((el) => {
        el.label = `${el.sub_district} > ${el.district} > ${el.province} > ${el.post_code}`;
        return el;
    });
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

    async onGetThailand(req, res) {
        try {
            const items = await prisma.sub_district.findMany({
                select: {
                    id: true,
                    name_th: true,
                    zip_code: true,
                    district: {
                        select: {
                        id: true,
                        name_th: true,
                        province: {
                            select: {
                            id: true,
                            name_th: true,
                            },
                        }
                        },
                    },
                },
                where: {

                },
            });

            const transformedAddresses = transformPrismaResult(items);
            const mappedAddresses = addresses_mapping(transformedAddresses);

            res.status(200).json({
                addresses: transformedAddresses,
                addresses_mapping: () => mappedAddresses,
            });
        } catch (error) {
            // console.error("Error fetching data:", error); // Log error for debugging
            res.status(500).json({ msg: error.message });
        }
    },
};

module.exports = { ...methods };
