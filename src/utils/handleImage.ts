export const getFolderPath = (folderFlag: string) => {
    switch (folderFlag) {
        case "G":
            return "UGOODS_IMAGE";
        case "T":
            return "UCONTENT_IMAGE";
        case "C":
            return "UCOUPON_IMAGE";
        case "B":
            return "UBANNER_IMAGE";
        case "A":
            return "UPLACE_IMAGE";
        case "M":
            return "UMEMBER_IMAGE";
        case "P":
            return "APP_IMAGE";
        case "O":
            return "UCOMPANY_IMAGE";
        case "N":
            return "UCOMPANYBANNER_IMAGE";
        default:
            return "UGOODS_IMAGE";
    }
};

export const handleImagePath = function (path: string) {
    if (path && path.indexOf("http") == -1) {
        path = __PHOTO_PATH__ + path;
    }
    if (!path) {
        return __NO_IMAGE_URL__;
    }
    return path;
};

export const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
};
