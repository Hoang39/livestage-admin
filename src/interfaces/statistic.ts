export type RevenueCompanyReq = {
    COMID: number;
    FROM_DATE: string;
    TO_DATE: string;
};

export interface RevenueCompany {
    FROM_DATE: string;
    SHOP_ID: string;
    TO_DATE: string;
    BE_AMOUNT: number;
    REV_SHARE: number;
    PAY_DATE: string;
    VAT: number;
    GROSS_AMOUNT: number;
    DIS_AMOUNT: number;
    USE_YN: string;
    PLACEID: number;
    COM_NAME: string;
    ID: number;
    CRTDATE: string;
    BANK_INFO: string;
    VAT_AMOUNT: number;
    PAY_STATUS: string;
    COUNT_ORDERS: number;
    NET_AMOUNT: number;
    COMID: number;
    STATEMENT_DATE: string;
    PLACE_NAME: string;
    NET_SALES_AMOUNT: number;
    PAY_AMOUNT: number;
    MODDATE: string;
    REV_SHARE_AMOUNT: number;
    TOTAL_AMOUNT: number;
}

export type RevenueShopReq = {
    COMID: number;
    PLACEID: number;
    PAY_STATUS: string;
    FROM_DATE: string;
    TO_DATE: string;
};

export interface RevenueShop {
    FROM_DATE: string;
    VAT_AMOUNT: number;
    PAY_STATUS: string;
    TO_DATE: string;
    BE_AMOUNT: number;
    REV_SHARE: number;
    COUNT_ORDERS: number;
    NET_AMOUNT: number;
    PAY_DATE: string;
    VAT: number;
    COMID: number;
    STATEMENT_DATE: string;
    GROSS_AMOUNT: number;
    DIS_AMOUNT: number;
    NET_SALES_AMOUNT: number;
    USE_YN: string;
    PLACEID: number;
    PAY_AMOUNT: number;
    ID: number;
    MODDATE: string;
    REV_SHARE_AMOUNT: number;
    CRTDATE: string;
    BANK_INFO: string;
    TOTAL_AMOUNT: number;
}

export type RevenueShopIReq = {
    COMID: number;
    PLACEID: number;
    STATEMENT_DATE: string;
    FROM_DATE: string;
    TO_DATE: string;
};

export type TicketRevenueReq = {
    SHOP_ID: string;
    USER_PID: string;
    FROM_DATE: string;
    TO_DATE: string;
    PAGE_NUM: string;
    PAGE_SIZE: string;
};

export type TicketRevenue = {
    FROM_DATE: string;
    SHOP_ID: string;
    TO_DATE: string;
    REV_SHARE: number;
    ALIAS: string;
    VAT: number;
    USER_ID: string;
    PIT_AMOUNT: number;
    GROSS_AMOUNT: number;
    DIS_AMOUNT: number;
    REV_AMOUNT: number;
    PAYMENT_LIMIT_RATE: number;
    NOTE: string;
    USER_PID: string;
    VAT_AMOUNT: number;
    REV_DATE: string;
    BEGIN_AMOUNT: number;
    NET_AMOUNT: number;
    DEPOSIT_DATE: string;
    MEM_ID: string;
    PAY_AMOUNT: number;
    PROVISIONAL_YN: string;
    PIT: number;
    REV_SHARE_AMOUNT: number;
    DEPOSIT_AMOUNT: number;
};

export type TicketRevenueChartReq = {
    USER_PID: string;
    YEAR: string;
};

export type TicketRevenueChart = {
    USER_PID: string;
    "SHOP_ID≈": string;
    FROM_DATE: string;
    VAT_AMOUNT: number;
    REV_DATE: string;
    BEGIN_AMOUNT: number;
    TO_DATE: string;
    REV_SHARE: number;
    NET_AMOUNT: number;
    VAT: number;
    PIT_AMOUNT: number;
    GROSS_AMOUNT: number;
    DIS_AMOUNT: number;
    REV_AMOUNT: number;
    PAYMENT_LIMIT_RATE: number;
    DEPOSIT_DATE: string;
    PAY_AMOUNT: number;
    NOTE: string;
    PROVISIONAL_YN: string;
    PIT: number;
    REV_SHARE_AMOUNT: number;
    DEPOSIT_AMOUNT: number;
};

export type TicketRevenueLiveReq = {
    SHOP_ID: string;
    USER_PID: string;
    DATE: string;
    SORT_TYPE: string;
    SORT_DIR: string;
    PAGE_NUM: string;
    PAGE_SIZE: string;
};

export type TicketRevenueLive = {
    PAY_PRICE: number;
    USE_YN: string;
    TOTAL_SUCCESS_ORDER: number;
    TOT_PRICE: number;
    PID: string;
    TITLE: string;
    DIS_PRICE: number;
    TICKET_PRICE: number;
    OPEN_DATE: string;
};

export type TicketRevenueOrderReq = {
    SHOP_ID: string;
    USER_PID: string;
    DATE: string;
    SORT_TYPE: string;
    SORT_DIR: string;
    PAGE_NUM: string;
    PAGE_SIZE: string;
    LIVE_PID: string;
    PAYMENT_TYPE: string;
};

export type TicketRevenueOrder = {
    USER_PID: string;
    LIVE_PID: string;
    PRICE: number;
    ALIAS: string;
    CRT_DATE: string;
    TICKET_ORDER_PID: string;
    TITLE: string;
};

export type CloseTicketRevenueReq = {
    USER_PID: string;
    TYPE: string;
    REV_DATE: string;
    FROM_DATE: string;
    TO_DATE: string;
};
