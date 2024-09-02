const countDataAndOrder = async (prisma, req, $where, $table) => {
    //   Order
    let $orderBy = {};
    if (req.query.orderBy) {
        $orderBy[req.query.orderBy] = req.query.order;
    } else {
        $orderBy = { created_at: "asc" };
    }

    // Count
    let $count = await prisma[$table].count({
        where: $where,
    });

    let $perPage = req.query.perPage ? Number(req.query.perPage) : undefined;
    let $currentPage = req.query.currentPage
        ? Number(req.query.currentPage)
        : 1;
    let $totalPage =
        Math.ceil($count / $perPage) == 0 ? 1 : Math.ceil($count / $perPage);

    let $offset = req.query.perPage ? $perPage * ($currentPage - 1) : undefined;

    if (isNaN($totalPage) || $totalPage === 0) {
        $totalPage = 1;
    }

    return {
        $orderBy: $orderBy,
        $offset: $offset,
        $perPage: $perPage,
        $count: $count,
        $totalPage: $totalPage,
        $currentPage: $currentPage,
    };
};

const countData = async(prisma, $table, $where) => {
    // Count
    let $count = await prisma[$table].count({
        where: $where,
    });

    return $count;
};

module.exports = { countDataAndOrder, countData };
