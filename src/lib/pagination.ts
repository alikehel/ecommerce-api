export const calculatePagesCount = (total: number, perPage: number): number => {
    return Math.ceil(total / perPage) || 1;
};

export const calculateOffset = (page: number, perPage: number): number => {
    return (page - 1) * perPage;
};
