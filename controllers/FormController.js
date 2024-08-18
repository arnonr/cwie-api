const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");

const prisma = new PrismaClient();
const $table = "form";

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    uuid: true,
    student_id: true,
    student_detail: {
        
    },
    company_id: true,
    company_detail: {
        
    },
    semester_id: true,
    semester_detail: {
        
    },
    visitor_id: true,
    visitor_detail: {
        
    },
    division_head_id: true,
    division_head_detail: {
        
    },
    faculty_head_id: true,
    faculty_head_detail: {
        
    },
    form_status_id: true,
    form_status_detail: {
        
    },
    start_date: true,
    end_date: true,
    co_name: true,
    co_position: true,
    co_phone: true,
    co_email: true,
    request_name: true,
    request_position: true,
    request_document_date: true,
    request_document_number: true,
    max_respone_date: true,
    send_document_date: true,
    send_document_number: true,
    response_document_file: true,
    response_send_at: true,
    response_result: true,
    response_province_id: true,
    response_province_detail: {
        
    },
    confirm_response_at: true,
    workplace_address: true,
    workplace_province_id: true,
    workplace_province_detail: {
        
    },
    workplace_district_id: true,
    workplace_district_detail: {
        
    },
    workplace_sub_district_id: true,
    workplace_sub_district_detail: {
        
    },
    workplace_googlemap_url: true,
    workplace_googlemap_file: true,
    plan_send_at: true,
    plan_accept_at: true,
    advisor_verified_at: true,
    division_head_approved_at: true,
    faculty_head_approved_at: true,
    staff_confirmed_at: true,
    namecard_file: true,
    province_id: true,
    province_detail: {
        
    },
    district_id: true,
    district_detail: {
        
    },
    sub_district_id: true,
    sub_district_detail: {
        
    },
    is_pass_coop_subject: true,
    is_pass_general_subject: true,
    is_pass_gpa: true,
    is_pass_suspend: true,
    is_pass_punishment: true,
    is_pass_disease: true,
    ppt_report_file: true,
    poster_report_file: true,
    send_at: true,
    reject_status_id: true,
    reject_status_detail: {
        
    },
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    is_active: true,
};

const filterData = (req) => {
    const { id, uuid, student_id, company_id, semester_id, visitor_id, division_head_id, faculty_head_id, form_status_id, start_date, end_date, co_name, co_position, co_phone, co_email, request_name, request_position, request_document_date, request_document_number, max_respone_date, send_document_date, send_document_number, response_send_at, response_result, response_province_id, confirm_response_at, workplace_address, workplace_province_id, workplace_district_id, workplace_sub_district_id, plan_send_at, plan_accept_at, advisor_verified_at, division_head_approved_at, faculty_head_approved_at, staff_confirmed_at, province_id, district_id, sub_district_id, is_pass_coop_subject, is_pass_general_subject, is_pass_gpa, is_pass_suspend, is_pass_punishment, is_pass_disease, send_at, reject_status_id, is_active } = req.query;

    // id && เป็นการใช้การประเมินแบบ short-circuit ซึ่งหมายความว่าถ้า id มีค่าเป็น truthy (เช่น ไม่ใช่ null, undefined, 0, false, หรือ "" เป็นต้น) จะดำเนินการด้านหลัง &&
    let $where = {
        deleted_at: null,
        ...(id && { id: Number(id) }),
        ...(uuid && { uuid: { contains: uuid } }),
        ...(student_id && { student_id: Number(student_id) }),
        ...(company_id && { company_id: Number(company_id) }),
        ...(semester_id && { semester_id: Number(semester_id) }),
        ...(visitor_id && { visitor_id: Number(visitor_id) }),
        ...(division_head_id && { division_head_id: Number(division_head_id) }),
        ...(faculty_head_id && { faculty_head_id: Number(faculty_head_id) }),
        ...(form_status_id && { form_status_id: Number(form_status_id) }),
        ...(start_date && { start_date: { gte: new Date(start_date) } }),
        ...(end_date && { end_date: { lte: new Date(end_date) } }),
        ...(co_name && { co_name: { contains: co_name } }),
        ...(co_position && { co_position: { contains: co_position } }),
        ...(co_phone && { co_phone: { contains: co_phone } }),
        ...(co_email && { co_email: { contains: co_email } }),
        ...(request_name && { request_name: { contains: request_name } }),
        ...(request_position && { request_position: { contains: request_position } }),
        ...(request_document_date && { request_document_date: { gte: new Date(request_document_date) } }),
        ...(request_document_number && { request_document_number: { contains: request_document_number } }),
        ...(max_respone_date && { max_respone_date: { gte: new Date(max_respone_date) } }),
        ...(send_document_date && { send_document_date: { gte: new Date(send_document_date) } }),
        ...(send_document_number && { send_document_number: { contains: send_document_number } }),
        ...(response_send_at && { response_send_at: { gte: new Date(response_send_at) } }),
        ...(response_result && { response_result: { contains: response_result } }),
        ...(response_province_id && { response_province_id: Number(response_province_id) }),
        ...(confirm_response_at && { confirm_response_at: { gte: new Date(confirm_response_at) } }),
        ...(workplace_address && { workplace_address: { contains: workplace_address } }),
        ...(workplace_province_id && { workplace_province_id: Number(workplace_province_id) }),
        ...(workplace_district_id && { workplace_district_id: Number(workplace_district_id) }),
        ...(workplace_sub_district_id && { workplace_sub_district_id: Number(workplace_sub_district_id) }),
        ...(plan_send_at && { plan_send_at: { gte: new Date(plan_send_at) } }),
        ...(plan_accept_at && { plan_accept_at: { gte: new Date(plan_accept_at) } }),
        ...(advisor_verified_at && { advisor_verified_at: { gte: new Date(advisor_verified_at) } }),
        ...(advisor_verified_at && { advisor_verified_at: { gte: new Date(advisor_verified_at) } }),
        ...(division_head_approved_at && { division_head_approved_at: { gte: new Date(division_head_approved_at) } }),
        ...(faculty_head_approved_at && { faculty_head_approved_at: { gte: new Date(faculty_head_approved_at) } }),
        ...(staff_confirmed_at && { staff_confirmed_at: { gte: new Date(staff_confirmed_at) } }),
        ...(province_id && { province_id: Number(province_id) }),
        ...(district_id && { district_id: Number(district_id) }),
        ...(sub_district_id && { sub_district_id: Number(sub_district_id) }),
        ...(is_pass_coop_subject && { is_pass_coop_subject: Number(is_pass_coop_subject) }),
        ...(is_pass_general_subject && { is_pass_general_subject: Number(is_pass_general_subject) }),
        ...(is_pass_gpa && { is_pass_gpa: Number(is_pass_gpa) }),
        ...(is_pass_suspend && { is_pass_suspend: Number(is_pass_suspend) }),
        ...(is_pass_punishment && { is_pass_punishment: Number(is_pass_punishment) }),
        ...(is_pass_disease && { is_pass_disease: Number(is_pass_disease) }),
        ...(send_at && { send_at: { gte: new Date(send_at) } }),
        ...(reject_status_id && { reject_status_id: Number(reject_status_id) }),
        ...(is_active && { is_active: Number(is_active) }),
    };

    return $where;
};

const schema = Joi.object({
    student_id: Joi.number().required(),
    company_id: Joi.number().required(),
    semester_id: Joi.number().required(),
    visitor_id: Joi.number(),
    division_head_id: Joi.number(),
    faculty_head_id: Joi.number(),
    form_status_id: Joi.number().required(),
    start_date: Joi.date(),
    end_date: Joi.date(),
    co_name: Joi.string(),
    co_position: Joi.string(),
    co_phone: Joi.string(),
    co_email: Joi.string(),
    request_name: Joi.string(),
    request_position: Joi.string(),
    request_document_date: Joi.date(),
    request_document_number: Joi.string(),
    max_respone_date: Joi.date(),
    send_document_date: Joi.date(),
    send_document_number: Joi.string(),
    response_send_at: Joi.date(),
    response_result: Joi.string(),
    response_province_id: Joi.number(),
    confirm_response_at: Joi.date(),
    workplace_address: Joi.string(),
    workplace_province_id: Joi.number(),
    workplace_district_id: Joi.number(),
    workplace_sub_district_id: Joi.number(),
    workplace_googlemap_url: Joi.string(),
    workplace_googlemap_file: Joi.string(),
    plan_document_file: Joi.string(),
    plan_send_at: Joi.date(),
    plan_accept_at: Joi.date(),
    advisor_verified_at: Joi.date(),
    division_head_approved_at: Joi.date(),
    faculty_head_approved_at: Joi.date(),
    staff_confirmed_at: Joi.date(),
    namecard_file: Joi.string(),
    province_id: Joi.number(),
    district_id: Joi.number(),
    sub_district_id: Joi.number(),
    is_pass_coop_subject: Joi.boolean(),
    is_pass_general_subject: Joi.boolean(),
    is_pass_gpa: Joi.boolean(),
    is_pass_suspend: Joi.boolean(),
    is_pass_punishment: Joi.boolean(),
    is_pass_disease: Joi.boolean(),
    ppt_report_file: Joi.string(),
    poster_report_file: Joi.string(),
    send_at: Joi.date(),
    reject_status_id: Joi.number(),
    is_active: Joi.boolean(),
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
                    updated_by: req.user?.name,
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
};

module.exports = { ...methods };
