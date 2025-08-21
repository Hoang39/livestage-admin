export interface Banner {
    LIVE_PID: string;
    LIVE_TITLE: string;
    END_DATE: string;
    GOODS_PID: string;
    PAGE: number;
    PID: string;
    START_DATE: string;
    FILE_PATH: string;
    DIV: string;
    RNUM: number;
    USE_YN: string;
    GOODS_NAME: string;
    TITLE: string;
    TYPE: string;
    IMAGE_URL: string;
    SORT_NO: number;
    MAIN_TF?: string;
    CATEGORY_ID?: string;
    METADATA?: string;
}

export type BannerReq = {
    PAGE_NUM: number;
    PAGE_SIZE: number;
    MAIN_TF: string;
};

export type BannerIReq = {
    TITLE: string;
    TYPE: string;
    USE_YN: string;
    START_DATE: string;
    END_DATE: string;
    MAIN_TF: string;
    SORT_NO: number;
    CATEGORY_ID?: string;
    LIVE_PID?: string;
    GOODS_PID?: string;
    METADATA?: string;
};

export type BannerUReq = BannerIReq & { BANNER_PID: string };

export type BannerUFileReq = {
    BANNER_PID: string;
    FILE_PATH: string;
    DIV: string;
    IMAGE_URL: string;
    MAIN_TF: string;
};

export type BannerDReq = { BANNER_PID: string; MAIN_TF: string };
