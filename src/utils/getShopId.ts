export const getShopId = (comId: number, placeId: number) => {
    return (
        "S" + String(comId).padStart(5, "0") + String(placeId).padStart(6, "0")
    );
};
