const { PrismaClient } = require("@prisma/client");
const { countDataAndOrder } = require("../utils/pagination");
const prisma = new PrismaClient();
const $table = "login_log";

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    user_id: true,
    user_detail: {
        select: {
            username: true,
            name: true,
        },
    },
    ip_address: true,
    user_agent: true,
    status: true,
    created_at: true,
};
const filterData = (req) => {
    const { id, user_id, ip_address, user_agent, status} = req.query;

    // id && เป็นการใช้การประเมินแบบ short-circuit ซึ่งหมายความว่าถ้า id มีค่าเป็น truthy (เช่น ไม่ใช่ null, undefined, 0, false, หรือ "" เป็นต้น) จะดำเนินการด้านหลัง &&
    let $where = {
        deleted_at: null,
        ...(id && { id: Number(id) }),
        ...(user_id && { user_id: Number(user_id) }),
        ...(ip_address && { ip_address: { contains: ip_address } }),
        ...(user_agent && { user_agent: { contains: user_agent } }),
        ...(status && { status: { contains: status } }),
    };

    return $where;
};

const saveLog = async (user_id, username, status = null, ip_address = null, user_agent = null) => {
    try{
        const item = await prisma[$table].create({
            data: {
                user_id: Number(user_id),
                ip_address: ip_address,
                user_agent: user_agent,
                status: status,
                created_by: username,
            },
        });
    }catch(error){
        console.log(error);
    }
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

    async onGetAllByUserId (req, res) {
        try {
            const { user_id } = req.params;
            if(!user_id) {
                return res.status(400).json({ msg: "user_id is required" });
            }

            let $where = filterData(req);
            $where.user_id = Number(user_id);

            const other = await countDataAndOrder(prisma, req, $where, $table);

            const items = await prisma[$table].findMany({
                select: selectField,
                where: $where,
                orderBy: other.$orderBy,
                skip: other.$offset,
                take: other.$perPage,
            });

            res.status(200).json({
                totalData: other.$count,
                totalPage: other.$totalPage,
                currentPage: other.$currentPage,
                msg: "success",
                data: items,
            });
        } catch (error) {
            console.error("Error fetching data:", error); // Log error for debugging
            res.status(500).json({ msg: error.message });
        }
    }
};

module.exports = { ...methods, saveLog };
