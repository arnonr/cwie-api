const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { countDataAndOrder } = require("../utils/pagination");
const uploadController = require("./UploadsController");
// const prisma = new PrismaClient();
const $table = "document";

const prisma = new PrismaClient().$extends({
    result: {
        document: {
            //extend Model name
            document_file: {
                // the name of the new computed field
                needs: {
                    /* field */ document_file: true,
                },
                compute(model) {
                    let document_file = null;

                    if (model.document_file != null) {
                        document_file =
                            process.env.PATH_UPLOAD + model.document_file;
                    }

                    return document_file;
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
    student_detail: {
        select: {
            id: true,
            prefix: true,
            firstname: true,
            surname: true,
            student_code: true,
        },
    },
    document_name: true,
    document_file: true,
    document_type_id: true,
    document_type_detail: {
        select: {
            id: true,
            name: true,
        },
    },
};

const filterData = (req) => {
    const {
        id,
        uuid,
        student_id,
        document_name,
        document_file,
        document_type_id,
        is_active,
    } = req.query;

    // id && เป็นการใช้การประเมินแบบ short-circuit ซึ่งหมายความว่าถ้า id มีค่าเป็น truthy (เช่น ไม่ใช่ null, undefined, 0, false, หรือ "" เป็นต้น) จะดำเนินการด้านหลัง &&
    let $where = {
        deleted_at: null,
        ...(id && { id: Number(id) }),
        ...(uuid && { uuid: uuid }),
        ...(student_id && { student_id: Number(student_id) }),
        ...(document_name && { document_name: { contains: document_name } }),
        ...(document_file && { document_file: { contains: document_file } }),
        ...(document_type_id && { document_type_id: Number(document_type_id) }),
        ...(is_active && { is_active: JSON.parse(is_active) }),
    };

    return $where;
};

const baseSchema = {
    uuid: Joi.string().uuid(),
    student_id: Joi.number(),
    document_name: Joi.string(),
    document_file: Joi.string().max(255).allow(null, ""),
    document_type_id: Joi.number(),
    is_active: Joi.boolean(),
};

const createSchema = Joi.object({
    ...baseSchema,
    student_id: baseSchema.student_id.required(),
    document_name: baseSchema.document_name.required(),
    // document_file: baseSchema.document_file.required(),
    document_type_id: baseSchema.document_type_id.required(),
});

const updateSchema = Joi.object(baseSchema);

const validateCreate = (data) => createSchema.validate(data);
const validateUpdate = (data) => updateSchema.validate(data);

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
            const { error, value } = validateCreate(req.body);

            if (error) {
                return res.status(400).json({ msg: error.details[0].message });
            }

            let documentPath = await uploadController.onUploadFile(
                req,
                "/document/",
                "document_file"
            );

            if (documentPath == "error") {
                return res.status(500).send("document_file error");
            }

            if (documentPath) {
                value.document_file = documentPath;
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
            const { error, value } = validateUpdate(req.body);

            if (error) {
                return res.status(400).json({ msg: error.details[0].message });
            }

            let photoFile = await uploadController.onUploadFile(
                req,
                "/document/",
                "document_file"
            );

            if (photoFile == "error") {
                return res.status(500).send("document_file error");
            }

            if (photoFile) {
                value.document_file = photoFile;
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
};

module.exports = { ...methods };
