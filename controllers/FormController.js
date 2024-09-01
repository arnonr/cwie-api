const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");
const uploadController = require("./UploadsController");
const helperController = require("./HelperController");
// const prisma = new PrismaClient();
const $table = "form";

const prisma = new PrismaClient().$extends({
    result: {
        form: {
            //extend Model name
            response_document_file: {
                // the name of the new computed field
                needs: {
                    /* field */ response_document_file: true,
                },
                compute(model) {
                    let response_document_file = null;

                    if (model.response_document_file != null) {
                        response_document_file =
                            process.env.PATH_UPLOAD +
                            model.response_document_file;
                    }

                    return response_document_file;
                },
            },
            workplace_googlemap_file: {
                // the name of the new computed field
                needs: {
                    /* field */ workplace_googlemap_file: true,
                },
                compute(model) {
                    let workplace_googlemap_file = null;

                    if (model.workplace_googlemap_file != null) {
                        workplace_googlemap_file =
                            process.env.PATH_UPLOAD +
                            model.workplace_googlemap_file;
                    }

                    return workplace_googlemap_file;
                },
            },
            plan_document_file: {
                // the name of the new computed field
                needs: {
                    /* field */ plan_document_file: true,
                },
                compute(model) {
                    let plan_document_file = null;

                    if (model.plan_document_file != null) {
                        plan_document_file =
                            process.env.PATH_UPLOAD + model.plan_document_file;
                    }

                    return plan_document_file;
                },
            },
            namecard_file: {
                // the name of the new computed field
                needs: {
                    /* field */ namecard_file: true,
                },
                compute(model) {
                    let namecard_file = null;

                    if (model.namecard_file != null) {
                        namecard_file =
                            process.env.PATH_UPLOAD + model.namecard_file;
                    }

                    return namecard_file;
                },
            },
            ppt_report_file: {
                // the name of the new computed field
                needs: {
                    /* field */ ppt_report_file: true,
                },
                compute(model) {
                    let ppt_report_file = null;

                    if (model.ppt_report_file != null) {
                        ppt_report_file =
                            process.env.PATH_UPLOAD + model.ppt_report_file;
                    }

                    return ppt_report_file;
                },
            },
            poster_report_file: {
                // the name of the new computed field
                needs: {
                    /* field */ poster_report_file: true,
                },
                compute(model) {
                    let poster_report_file = null;

                    if (model.poster_report_file != null) {
                        poster_report_file =
                            process.env.PATH_UPLOAD + model.poster_report_file;
                    }

                    return poster_report_file;
                },
            },
            report_file: {
                // the name of the new computed field
                needs: {
                    /* field */ report_file: true,
                },
                compute(model) {
                    let report_file = null;

                    if (model.report_file != null) {
                        report_file =
                            process.env.PATH_UPLOAD + model.report_file;
                    }

                    return report_file;
                },
            },
        },
    },
});

// ฟิลด์ที่ต้องการ Select รวมถึง join
const selectField = {
    id: true,
    uuid: true,
    student_id: true,
    student_detail: {},
    company_id: true,
    company_detail: {},
    semester_id: true,
    semester_detail: {},
    visitor_id: true,
    visitor_detail: {},
    division_head_id: true,
    division_head_detail: {},
    faculty_head_id: true,
    faculty_head_detail: {},
    form_status_id: true,
    form_status_detail: {},
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
    max_response_date: true,
    send_document_date: true,
    send_document_number: true,
    response_document_file: true,
    response_send_at: true,
    response_result: true,
    response_province_id: true,
    response_province_detail: {},
    confirm_response_at: true,
    workplace_address: true,
    workplace_province_id: true,
    workplace_province_detail: {},
    workplace_district_id: true,
    workplace_district_detail: {},
    workplace_sub_district_id: true,
    workplace_sub_district_detail: {},
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
    province_detail: {},
    district_id: true,
    district_detail: {},
    sub_district_id: true,
    sub_district_detail: {},
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
    reject_status_detail: {},
    report_file: true,
    report_send_at: true,
    report_accept_at: true,
    closed_at: true,
    send_at: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
    is_active: true,
};

const filterData = (req) => {
    const {
        id,
        uuid,
        student_id,
        company_id,
        semester_id,
        visitor_id,
        division_head_id,
        faculty_head_id,
        form_status_id,
        start_date,
        end_date,
        co_name,
        co_position,
        co_phone,
        co_email,
        request_name,
        request_position,
        request_document_date,
        request_document_number,
        max_response_date,
        send_document_date,
        send_document_number,
        response_send_at,
        response_result,
        response_province_id,
        confirm_response_at,
        workplace_address,
        workplace_province_id,
        workplace_district_id,
        workplace_sub_district_id,
        plan_send_at,
        plan_accept_at,
        advisor_verified_at,
        division_head_approved_at,
        faculty_head_approved_at,
        staff_confirmed_at,
        province_id,
        district_id,
        sub_district_id,
        is_pass_coop_subject,
        is_pass_general_subject,
        is_pass_gpa,
        is_pass_suspend,
        is_pass_punishment,
        is_pass_disease,
        send_at,
        reject_status_id,
        is_active,
        report_send_at,
        report_accept_at,
        closed_at,
        search_name,
        student_code,
        company_name,
        faculty_id,
        division_id,
        advisor_id,
    } = req.query;

    // id && เป็นการใช้การประเมินแบบ short-circuit ซึ่งหมายความว่าถ้า id มีค่าเป็น truthy (เช่น ไม่ใช่ null, undefined, 0, false, หรือ "" เป็นต้น) จะดำเนินการด้านหลัง &&
    const nameArray = search_name ? search_name.split(" ") : [];

    let $where = {
        deleted_at: null,
        ...(company_name && {
            company_detail: {
                name: { contains: company_name, mode: "insensitive" },
            },
        }),
        ...(student_code && {
            student_detail: { student_code: { contains: student_code } },
        }),
        ...(search_name && {
            student_detail: {
                OR: [
                    // Search for full name in firstname or lastname
                    {
                        firstname: {
                            contains: search_name,
                            mode: "insensitive",
                        },
                    },
                    { surname: { contains: search_name, mode: "insensitive" } },
                    // Search for first word in firstname and last word in lastname
                    {
                        AND: [
                            {
                                firstname: {
                                    contains: nameArray[0],
                                    mode: "insensitive",
                                },
                            },
                            {
                                surname: {
                                    contains: nameArray[nameArray.length - 1],
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    // Search for each word in either firstname or lastname
                    ...nameArray.map((name) => ({
                        OR: [
                            {
                                firstname: {
                                    contains: name,
                                    mode: "insensitive",
                                },
                            },
                            {
                                surname: {
                                    contains: name,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    })),
                ],
            },
        }),
        ...(faculty_id && {
            student_detail: { faculty_id: Number(faculty_id) },
        }),
        ...(division_id && {
            student_detail: { division_id: Number(division_id) },
        }),
        ...(advisor_id && {
            student_detail: { advisor_id: Number(advisor_id) },
        }),
        ...(id && { id: Number(id) }),
        ...(uuid && { uuid: { contains: uuid } }),
        ...(student_id && { student_id: Number(student_id) }),
        ...(company_id && { company_id: Number(company_id) }),
        ...(semester_id && { semester_id: Number(semester_id) }),
        ...(visitor_id && { visitor_id: Number(visitor_id) }),
        ...(division_head_id && { division_head_id: Number(division_head_id) }),
        ...(faculty_head_id && { faculty_head_id: Number(faculty_head_id) }),
        ...(form_status_id && {
            form_status_id: {
                in: form_status_id.split(",").map(Number),
            },
        }),
        ...(start_date && { start_date: { gte: new Date(start_date) } }),
        ...(end_date && { end_date: { lte: new Date(end_date) } }),
        ...(co_name && { co_name: { contains: co_name } }),
        ...(co_position && { co_position: { contains: co_position } }),
        ...(co_phone && { co_phone: { contains: co_phone } }),
        ...(co_email && { co_email: { contains: co_email } }),
        ...(request_name && { request_name: { contains: request_name } }),
        ...(request_position && {
            request_position: { contains: request_position },
        }),
        ...(request_document_date && {
            request_document_date: { gte: new Date(request_document_date) },
        }),
        ...(request_document_number && {
            request_document_number: { contains: request_document_number },
        }),
        ...(max_response_date && {
            max_response_date: { gte: new Date(max_response_date) },
        }),
        ...(send_document_date && {
            send_document_date: { gte: new Date(send_document_date) },
        }),
        ...(send_document_number && {
            send_document_number: { contains: send_document_number },
        }),
        ...(response_send_at && {
            response_send_at: { gte: new Date(response_send_at) },
        }),
        ...(response_result && {
            response_result: { contains: response_result },
        }),
        ...(response_province_id && {
            response_province_id: Number(response_province_id),
        }),
        ...(confirm_response_at && {
            confirm_response_at: { gte: new Date(confirm_response_at) },
        }),
        ...(workplace_address && {
            workplace_address: { contains: workplace_address },
        }),
        ...(workplace_province_id && {
            workplace_province_id: Number(workplace_province_id),
        }),
        ...(workplace_district_id && {
            workplace_district_id: Number(workplace_district_id),
        }),
        ...(workplace_sub_district_id && {
            workplace_sub_district_id: Number(workplace_sub_district_id),
        }),
        ...(plan_send_at && { plan_send_at: { gte: new Date(plan_send_at) } }),
        ...(plan_accept_at && {
            plan_accept_at: { gte: new Date(plan_accept_at) },
        }),
        ...(advisor_verified_at && {
            advisor_verified_at: { gte: new Date(advisor_verified_at) },
        }),
        ...(advisor_verified_at && {
            advisor_verified_at: { gte: new Date(advisor_verified_at) },
        }),
        ...(division_head_approved_at && {
            division_head_approved_at: {
                gte: new Date(division_head_approved_at),
            },
        }),
        ...(faculty_head_approved_at && {
            faculty_head_approved_at: {
                gte: new Date(faculty_head_approved_at),
            },
        }),
        ...(staff_confirmed_at && {
            staff_confirmed_at: { gte: new Date(staff_confirmed_at) },
        }),
        ...(province_id && { province_id: Number(province_id) }),
        ...(district_id && { district_id: Number(district_id) }),
        ...(sub_district_id && { sub_district_id: Number(sub_district_id) }),
        ...(is_pass_coop_subject && {
            is_pass_coop_subject: Number(is_pass_coop_subject),
        }),
        ...(is_pass_general_subject && {
            is_pass_general_subject: Number(is_pass_general_subject),
        }),
        ...(is_pass_gpa && { is_pass_gpa: Number(is_pass_gpa) }),
        ...(is_pass_suspend && { is_pass_suspend: Number(is_pass_suspend) }),
        ...(is_pass_punishment && {
            is_pass_punishment: Number(is_pass_punishment),
        }),
        ...(is_pass_disease && { is_pass_disease: Number(is_pass_disease) }),
        ...(send_at && { send_at: { gte: new Date(send_at) } }),
        ...(reject_status_id && { reject_status_id: Number(reject_status_id) }),
        ...(is_active && { is_active: JSON.parse(is_active) }),
        ...(report_send_at && {
            report_send_at: { gte: new Date(report_send_at) },
        }),
        ...(report_accept_at && {
            report_accept_at: { gte: new Date(report_accept_at) },
        }),
        ...(closed_at && { closed_at: { gte: new Date(closed_at) } }),
    };

    return $where;
};

const baseSchema = {
    student_id: Joi.number(),
    company_id: Joi.number(),
    semester_id: Joi.number(),
    visitor_id: Joi.number(),
    division_head_id: Joi.number(),
    faculty_head_id: Joi.number(),
    form_status_id: Joi.number(),
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
    max_response_date: Joi.date(),
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
    report_send_at: Joi.date(),
    report_accept_at: Joi.date(),
    closed_at: Joi.date(),
    report_file: Joi.string(),
};

const createSchema = Joi.object({
    ...baseSchema,
    student_id: baseSchema.student_id.required(),
    company_id: baseSchema.company_id.required(),
    semester_id: baseSchema.semester_id.required(),
    form_status_id: baseSchema.form_status_id.required(),
});

const updateSchema = Joi.object(baseSchema);

const validateCreate = (data) => createSchema.validate(data);
const validateUpdate = (data) => updateSchema.validate(data);

const generateFormNumber = async (id) => {
    try {
        const item = await prisma[$table].findUnique({
            select: {
                form_number: true,
                year_running: true,
            },
            where: {
                id: Number(id),
            },
        });

        if (item.form_number != null) {
            return null;
        }

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // Months are zero-based

        const maxRunning = await prisma[$table].aggregate({
            _max: {
                year_running: true,
            },
            where: {
                created_at: {
                    gte: new Date(`${currentYear}-01-01`),
                    lt: new Date(`${currentYear + 1}-01-01`),
                },
            },
        });

        const newRunningYear = maxRunning._max.year_running + 1;
        const newRunningCode = newRunningYear.toString().padStart(5, "0");
        const yearCode = (currentYear + 543).toString().substring(2, 4);
        const monthCode = currentMonth.toString().padStart(2, "0");

        const form_number = `${yearCode}${monthCode}${newRunningCode}`;

        if (item.jcoms_no == null) {
            await prisma[$table].update({
                where: {
                    id: Number(id),
                },
                data: {
                    form_number: form_number,
                    year_running: newRunningYear,
                },
            });
        }
        return { form_number, year_running: newRunningYear };
    } catch (error) {
        console.error("Error generating form number:", error); // Log error for debugging
        return null;
    }
};

const getNextRequestDocumentNumber = async (request_document_date) => {
    // Extract the year from the request_document_date
    const year = new Date(request_document_date).getFullYear();

    // Find the maximum request_document_number within the same year
    const maxDocumentNumber = await prisma[$table].aggregate({
        _max: {
            request_document_number: true
        },
        where: {
            request_document_date: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`)
            }
        }
    });

    // Calculate the next request_document_number
    const nextRequestDocumentNumber = maxDocumentNumber._max.request_document_number
        ? new Number(maxDocumentNumber._max.request_document_number) + 1
        : 1;

    return nextRequestDocumentNumber;
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
            if (error.code === "P2025") {
                return res.status(404).json({ msg: "Item not found" });
            }
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

            const errors_upload = [];

            const uploadFiles = async (req, fields) => {
                const paths = {};
                for (const field of fields) {
                    let filePath = await uploadController.onUploadFile(
                        req,
                        "/form/",
                        field
                    );
                    if (filePath === "error") {
                        errors_upload.push(field);
                    } else if (filePath !== null) {
                        paths[field] = filePath;
                    }
                }
                return paths;
            };

            const fileFields = [
                "response_document_file",
                "workplace_googlemap_file",
                "plan_document_file",
                "namecard_file",
                "ppt_report_file",
                "poster_report_file",
                "report_file",
            ];

            const uploadedPaths = await uploadFiles(req, fileFields);

            if (errors_upload.length > 0) {
                return res.status(500).json(errors_upload);
            }

            Object.assign(value, uploadedPaths);

            const item = await prisma[$table].create({
                data: { ...value, created_by: req.user?.name },
            });

            if (item) {
                const { form_number, year_running } = await generateFormNumber(
                    item.id
                );
                item.form_number = form_number;
                item.year_running = year_running;
            }

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
            const { error, value } = validateUpdate(req.body);

            if (error) {
                return res.status(400).json({ msg: error.details[0].message });
            }

            const errors_upload = [];

            const uploadFiles = async (req, fields) => {
                const paths = {};
                for (const field of fields) {
                    let filePath = await uploadController.onUploadFile(
                        req,
                        "/form/",
                        field
                    );
                    if (filePath === "error") {
                        errors_upload.push(field);
                    } else if (filePath !== null) {
                        paths[field] = filePath;
                    }
                }
                return paths;
            };

            const fileFields = [
                "response_document_file",
                "workplace_googlemap_file",
                "plan_document_file",
                "namecard_file",
                "ppt_report_file",
                "poster_report_file",
                "report_file",
            ];

            const uploadedPaths = await uploadFiles(req, fileFields);

            if (errors_upload.length > 0) {
                return res.status(500).json(errors_upload);
            }

            Object.assign(value, uploadedPaths);

            const item = await prisma[$table].update({
                where: {
                    id: Number(req.params.id),
                },
                data: { ...value, updated_by: req.user?.name },
            });

            if (item.form_number == null) {
                const { form_number, year_running } = await generateFormNumber(
                    item.id
                );
                item.form_number = form_number;
                item.year_running = year_running;
            }

            res.status(200).json({ ...item, msg: "success" });
        } catch (error) {
            console.error("Error updating item:", error);
            if (error.code === "P2025") {
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
            if (error.code === "P2025") {
                return res.status(404).json({ msg: "Item not found" });
            }
            res.status(400).json({ msg: error.message });
        }
    },
    // ยกเลิก
    async onCancel(req, res) {
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
                    form_status_id: 99,
                    is_active: false,
                    updated_by: req.user?.name,
                },
            });

            res.status(200).json({ msg: "success" });
        } catch (error) {
            console.error("Error Cancel item:", error);
            if (error.code === "P2025") {
                return res.status(404).json({ msg: "Item not found" });
            }
            res.status(400).json({ msg: error.message });
        }
    },

    async onMapTeacherStudent(req, res) {

        const students = req.body.students;
        const semester_id = req.body.semester_id;
        console.log(semester_id);
        let statusList = [];

        try {
            for (const student of students) {
                const { first_name, last_name, student_code } = student;
                let status = "error";
                let error_message = [];

                try {
                    const teacherItem = await prisma.teacher_profile.findFirst({
                        where: {
                            firstname: first_name,
                            surname: last_name,
                        },
                    });

                    if (!teacherItem) {
                        error_message.push("teacher_not_found");
                    }

                    const studentItem = await prisma.student_profile.findUnique({
                        where: {
                            student_code: student_code,
                        },
                    });

                    if (!studentItem) {
                        error_message.push("student_not_found");
                    }

                    if (teacherItem && studentItem) {
                        const formUpdate = await prisma.form.updateMany({
                            where: {
                                student_id: studentItem.id,
                                semester_id: semester_id,
                                is_active: true,
                            },
                            data: {
                                visitor_id: teacherItem.id,
                            },
                        });

                        if (formUpdate.count === 0) {
                            error_message.push("form_not_found");
                        } else {
                            status = "success";
                        }
                    }
                } catch (error) {
                    console.error(`Error processing student ${student_code}: ${error.message}`);
                    error_message.push("unexpected_error");
                }

                if (status === "success") {
                    statusList.push({ student_code, status });
                } else {
                    statusList.push({ student_code, status, error_message: error_message.join(", ") });
                }
            }

            return res.status(200).json({msg: "success", data:statusList});
        }catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    async onAddRequestBook(req, res) {

    //     $request->validate(["id as required"]);
    //     //
    //     $updateForm = Form::whereIn("id", $request->id)->update([
    //         "request_document_number" => $request->request_document_number,
    //         "request_document_date" => $request->request_document_date,
    //         "max_response_date" => $request->max_response_date,
    //         "updated_by" => "arnonr",
    //     ]);

    //     $check = Form::whereIn("id", $request->id)
    //         ->where("status_id", "<", "6")
    //         ->update([
    //             "status_id" => 6,
    //         ]);

    //     $student_id = [];

    //     $form = Form::whereIn("id", $request->id)->get();
    //     foreach ($form as $value) {
    //         array_push($student_id, $value->student_id);
    //     }
    //     // $student_id

    //     $check1 = Student::whereIn("id", $student_id)
    //         ->where("status_id", "<", "6")
    //         ->update([
    //             "status_id" => 6,
    //         ]);

    //     // รอส่งเมลแจ้งเตือนหนังสือขอความอนุเคราะห์
    //     if ($request->send_mail == 1) {
    //         $student_code = [];
    //         $students = Form::whereIn("id", $request->id)
    //             ->with("student")
    //             ->get();
    //         foreach ($students as $key => $value) {
    //             $student_code[] = $value->student->student_code;
    //         }

    //         $subject =
    //             "หนังสือขอความอนุเคราะห์รับนักศึกษาเข้าฝึกสหกิจศึกษา คณะบริหารธุรกิจ มจพ.ระยอง";
    //         $body =
    //             "ท่านได้รับการอนุมัติหนังสือขอความอนุเคราะห์รับนักศึกษาเข้าฝึกสหกิจศึกษา คณะบริหารธุรกิจ มจพ.ระยอง เรียบร้อยแล้ว กรุณาตรวจสอบที่ระบบสหกิจศึกษา";
    //         $this->sendStudentMail($student_code, $subject, $body);
    //     }
    //     // ส่งเมลแจ้งเตือนหนังสือส่งตัว

    //     $responseData = [
    //         "message" => "success",
    //     ];

    //     return response()->json($responseData, 200);
    // }

                // data input
            // request_document_date
            // max_response_date
            // form ids
            //request_document_number gen yea + 1
            // update form_status=7 where form_status_id < 1 ออกหนังสือขอความอนุเคราะห์
            // update student like form status = 7

        try{
            if(!req.body.ids) return res.status(400).json({msg: "ids is required"});
            if(!req.body.request_document_date) return res.status(400).json({msg: "request_document_date is required"});
            if(!req.body.max_response_date) return res.status(400).json({msg: "max_response_date is required"});

            const ids = req.body.ids.split(',').map(id => parseInt(id.trim(), 10));
            const requestDocumentDate = req.body.request_document_date;
            const maxResponseDate = req.body.max_response_date;
            const nextRequestDocumentNumber = await getNextRequestDocumentNumber(requestDocumentDate);

            const updateRequestDoc = await prisma.form.updateMany({
                where: {
                    id: { in: ids }
                },
                data: {
                    request_document_number: nextRequestDocumentNumber,
                    request_document_date: new Date(requestDocumentDate), // Convert to Date objectrequestDocumentDate,
                    max_response_date: new Date(maxResponseDate), // Convert to Date objectmaxResponseDate,
                }
            });

            const updateFormStatus = await prisma.form.updateMany({
                where: {
                    id: { in: ids },
                    form_status_id: {
                        lt: 7
                    }
                },
                data: {
                    form_status_id: 7
                }
            });

            // Fetch the student_ids from the form table based on the provided ids
            const studentIdsResult = await prisma.form.findMany({
                where: {
                    id: { in: ids }
                },
                    select: {
                    student_id: true
                }
            });

            // Extract the student_ids into an array
            const student_ids = studentIdsResult.map(form => form.student_id);

            const updateStudentStatus = await prisma.student_profile.updateMany({
                where: {
                    id: { in: student_ids },
                    status_id: {
                        lt: 7
                    }
                },
                data: {
                    status_id: 7
                }
            });

            const studentEmails = await prisma.student_profile.findMany({
                where: {
                    id: { in: student_ids }
                },
                    select: {
                    email: true
                }
            });

            studentEmails.forEach(student => {
                const email = student.email;
                const subject = "หนังสือขอความอนุเคราะห์รับนักศึกษาเข้าฝึกสหกิจศึกษา";
                const body = "ท่านได้รับการอนุมัติหนังสือขอความอนุเคราะห์รับนักศึกษาเข้าฝึกสหกิจศึกษาเรียบร้อยแล้ว กรุณาตรวจสอบที่ระบบสหกิจศึกษา อุทยานเทคโนโลยี มจพ.";
                helperController.sendEmail(email, subject, body);
            });

            res.status(200).json({ msg: "success" });

        }catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
};

module.exports = { ...methods };
