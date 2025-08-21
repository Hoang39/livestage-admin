export interface Review {
    SELLER_DISP_YN: string;
    DELIVERY_RATING: number;
    FAV_CNT: number;
    TARGET_PID: string;
    PHOTO_LIST: {
        PHOTO_URL: string;
    }[];
    ALIAS: string;
    SELLER_PID: string;
    FAVORITE_TF: string;
    PRODUCT_RATING: number;
    ROWNO: number;
    USE_YN: string;
    SELLER_MEMID: string;
    TYPE: string;
    USER_PID: string;
    SELLER_USE_YN: string;
    DISP_YN: string;
    AVG_RATING: number;
    SELLER_RATING: number;
    PROFILE_IMAGE_URL: string;
    AVATAR_URL?: string;
    PID: string;
    SELLER_ALIAS: string;
    REPLY_TEXT?: string;
    CRT_DATE: string;
    REV_TEXT: string;
    VIDEO_LIST: {
        VIDEO_THUMB_URL: string;
        VIDEO_URL: string;
    }[];
}

export interface GoodReview {
    REVIEWS: Review[];
    DELIVERY_RATING: number;
    PRODUCT_RATING: number;
    MEDIA_URL: string;
    AVG_RATING: number;
    PAGE_NUM: number;
    TOTAL_PAGE: number;
    SELLER_RATING: number;
    PAGE_SIZE: number;
    TOTAL_CNT: number;
}

export interface GoodReviewReq {
    TARGET: number;
    USER: string;
    TYPE: string;
    PD_RATE: string;
    SL_RATE: string;
    DL_RATE: string;
    PAGE?: string;
    SIZE?: string;
}

export interface GoodReviewIReq {
    REF_PID: string;
    USER_PID: number;
    TARGET_PID: string;
    TYPE: string;
    REV_TEXT: string;
    REV_VIDEOS: string;
    REV_PHOTOS: string;
}
