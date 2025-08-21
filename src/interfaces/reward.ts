export type HeartReq = {
    PKG_TYPE: string;
    HOT_YN: string;
    USE_YN: string;
    ACTIVE_YN: string;
};

export type Heart = {
    CONVERT_AMOUNT: number;
    MAX_BUY: number;
    CREATED_AT: string;
    EXPIRED_TIME: string;
    PRICE_KRW: number;
    USE_YN: string;
    DESCRIPTION: string;
    ORIGIN_KRW: number;
    REMAINING_TIME: number;
    UPDATED_AT: string;
    PAY_TYPES: string;
    ACTIVE_YN: string;
    LIMIT_YN: string;
    EFFECTIVE_TIME: string;
    THUMB_URL: string;
    PID: number;
    DISCOUNT_PC: number;
    NAME: string;
    BONUS_AMOUNT: number;
    CODE: string;
    PKG_TYPE: number;
    BUY_YN: string;
    HOT_YN: string;
    BONUS_PC: number;
    DATE_LABEL: string;
};

export type HeartIReq = {
    PKG_TYPE: string;
    PKG_NAME: string;
    PKG_CODE: string;
    PAY_TYPES: string;
    PKG_DESC: string;
    USE_YN: string;
    HOT_YN: string;
    MAX_BUY: number;
    PRICE_KRW: number;
    ORIGIN_KRW: number;
    DISCOUNT_PC: number;
    CONVERT_AMOUNT: number;
    BONUS_PC: number;
    BONUS_AMOUNT: number;
    EFFECTIVE_TIME: string;
    EXPIRED_TIME: string;
    THUMB_URL: string;
    THUMB_IMG_YN: string;
    CRUD_BY: string;
};

export type HeartUReq = HeartIReq & {
    PKG_PID: number;
};

export type MissionConfigReq = {
    CATEGORY: string;
};

export type MissionConfig = {
    CVAL: string;
    CKEY: string;
    CONFIG_YN: string;
    PID: number;
};

export type MissionReq = {
    PAGE: number;
    SIZE: number;
};

export type Mission = {
    STARTED_YN: string;
    MISSION_PID: number;
    CUR_TIME: string;
    CUR_DATE: string;
    EFFECTIVE_TIME: string;
    EXPIRED_TIME: string;
    MISSION_TYPE: string;
    USE_YN: string;
    DESCRIPTION: string;
    LIMIT_COUNT: number;
    REWARD_AMOUNT: number;
    REMAINING_TIME: number;
    REDIRECT_YN: string;
    RESET_TIME: string;
    MISSION_NAME: string;
};

export type MissionIReq = {
    MISSION_NAME: string;
    MISSION_TYPE: string;
    DESCRIPTION: string;
    USE_YN: string;
    RESET_TIME: string;
    LIMIT_COUNT: number;
    REDIRECT_YN: string;
    REWARD_AMOUNT: number;
    EFFECTIVE_TIME: string;
    EXPIRED_TIME: string;
};

export type MissionUReq = MissionIReq & { MISSION_PID: number };

export type PromotionReq = {
    PAGE: number;
    SIZE: number;
};

export type Promotion = {
    PROMO_PID: number;
    PROMO_NAME: string;
    USE_YN: string;
    CREATED_AT: string;
    PROMO_END_TIME: string;
    PROMO_TYPE: string;
    PRIZE_COUNT: number;
    PROMO_START_TIME: string;
    UPDATED_AT: string;
    WIN_RATE: number;
    TOTAL_PRIZE: number;
};

export type PromotionIReq = Partial<Promotion> & { CRUD_BY: string };

export type PromotionUReq = Partial<Promotion> & { CRUD_BY: string };

export type PrizeReq = {
    PROMO_PID: number;
    PAGE: number;
    SIZE: number;
};

export type Prize = {
    HEART_CONVERT: number;
    PROMO_PID: number;
    WIN_TO: number;
    DISPLAY_ORDER: number;
    CREATED_AT: string;
    QUANTITY: number;
    PROMO_TYPE: string;
    REMAINING: number;
    WIN_YN: string;
    PRIZE_PID: number;
    WIN_RATE: number;
    WIN_FROM: number;
    PROMO_NAME: string;
    UPDATED_AT: string;
    PRIZE_NAME: string;
    PRIZE_WIN_RATE: number;
};

export type PromotionPrizeUReq = {
    PROMO_PID: number;
    PRIZE_NAME: string;
    PRIZE_WIN_RATE: string;
    QUANTITY: string;
    HEART_CONVERT: string;
    WIN_YN: string;
    USE_YN: string;
    CRUD_BY: string;
};
