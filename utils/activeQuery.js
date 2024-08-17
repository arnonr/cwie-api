const getById = async (model, selectField, id) => {
    try {
        const item = await prisma[$table].findUnique({
            select: selectField,
            where: {
                id,
            },
        });
        return item;
    } catch (error) {
        console.error("Error fetching item by ID:", error);
        return error;
    }
};
module.exports = { getById }