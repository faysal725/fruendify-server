const prepareCommonQueryParams = (data) => {
    const { sortDirection, sortOn, query } = data || {};

    const page = Number(data.page || 1);
    const perPage = Number(data.perPage || 10);

    const skip = (page - 1) * perPage;
    // let orderBy: Record<string, "asc" | "desc"> = { id: "desc" };
    let orderBy = { createdAt: -1 };

    if (sortDirection && sortOn) {
        orderBy = {
            [sortOn]: sortDirection,
        };
    }

    return {
        ...data,
        skip,
        perPage,
        page,
        orderBy,
        searchKey: data?.searchKey || query,
    };
};

module.exports = {
    prepareCommonQueryParams,
};
