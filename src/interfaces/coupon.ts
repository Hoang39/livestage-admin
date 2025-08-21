export interface Coupon {
    CP_CODE: string;
    PLACE_ID: number;
    THUMBNAIL_URL: string;
    CLAIMED_COUNT: number;
    QUALITY: number;
    ACTIVE_YN: string;
    END_DATE: string;
    THUMBNAIL: string;
    START_DATE: string;
    COM_ID: number;
    VALUE: number;
    MAX_VALUE: number;
    UPDATE_TIME: string;
    MIN_VALUE: number;
    NAME: string;
    PAYMENT_TYPE: string;
    STATUS: string;
    DESCRIPTION: string;
    CP_ID: number;
    TOTAL_QUALITY: number;
    APPLICABLE_GROUP_GOODS_ID: string;
    CREATE_TIME: string;
    TYPE: string;
    USAGE_LIMIT_PER_USER: number;
}

export interface CouponStatistics {
    PLACE_ID: number;
    QUALITY: number;
    END_DATE: string;
    TOTAL_EXPIRED: number;
    VALUE: number;
    MAX_VALUE: number;
    STATUS: string;
    DESCRIPTION: string;
    TOTAL_USED: number;
    CREATE_TIME: string;
    TYPE: string;
    USAGE_LIMIT_PER_USER: number;
    CP_CODE: string;
    TOTAL_ACTIVE: number;
    ACTIVE_YN: "Y" | "N";
    TOTAL_DISCOUNT_AMOUNT: number;
    TOTAL_CLAIMED: number;
    START_DATE: string;
    COM_ID: number;
    UPDATE_TIME: string;
    MIN_VALUE: number;
    LAST_COLLECTED_DATE: string;
    NAME: string;
    PAYMENT_TYPE: string;
    USAGE_RATE_PERCENT: number;
    CP_ID: number;
    TOTAL_QUALITY: number;
    APPLICABLE_GROUP_GOODS_ID: string;
}

export type CouponReq = {
    COM_ID: string;
    PLACE_ID: string;
    CODE: string;
    NAME: string;
    TYPE: string;
    PAYMENT_TYPE: string;
    ACTIVE_YN: string;
    PAGE: number;
    LIMIT: number;
};

export type CouponStatisticsReq = CouponReq;

export type CouponIReq = {
    CP_CODE: string;
    NAME: string;
    COM_ID: number;
    PLACE_ID: number;
    TYPE: string;
    DESCRIPTION: string;
    VALUE: number;
    MAX_VALUE: number;
    MIN_VALUE: number;
    QUALITY: number;
    PAYMENT_TYPE: string;
    APPLICABLE_GROUP_GOODS_ID: string;
    USAGE_LIMIT_PER_USER: number;
    START_DATE: string;
    ACTIVE_YN: string;
    END_DATE: string;
};

export type CouponUReq = CouponIReq & CouponDReq;

export type CouponDReq = { CP_ID: number };
