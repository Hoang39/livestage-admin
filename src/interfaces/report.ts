export type BroadcastReportReq = {
    KEYWORD?: string;
    TARGET_USER_PID?: string;
    REPORT_TYPE?: string;
    STATUS: string;
    PAGE_SIZE: number;
    PAGE_NUM: number;
};

export type UserClaimReportReq = {
    USER_PID: string;
    STATUS: string;
};

export type UserChatReportReq = {
    TARGET_USER_PID: string;
    STATUS: string;
    ACTION_TYPE: string;
    REPORT_PID: string;
};

export interface UserClaimReport {
    USER_PID: string;
    COMPLAIN_INFO: string;
    STATUS: string;
    REASON_NAME: string;
    REASON_CODE: string;
    ALIAS: string;
    CRT_DATE: string;
    LINK_USER: string;
    REPORT_PID: string;
    CHAT_ROOM_ID: string;
    RESULT_PID: number;
}

export interface UserChatReport {
    TARGET_USER_PID: string;
    TARGET_MEM_ID: string;
    USER_PID: string;
    TARGET_PID: string;
    ALIAS: string;
    REASON_CODE: string;
    TARGET_USER_ALIAS: string;
    CHAT_ROOM_NAME: string;
    STATUS: string;
    REASON_NAME: string;
    CRT_DATE: string;
    REPORT_PID: number;
    REPORT_ACTION: string;
    CHAT_ROOM_ID: string;
}

export interface BroadcastReport {
    CATEGORY_ID: string;
    SHOP_ID: string;
    ALIAS: string;
    REPORT_STATUS: string;
    STATE: string;
    USER_ID: string;
    END_DATE: string;
    USER_COUNT: number;
    USE_YN: string;
    REASON_NAME: string;
    SCH_START_DATE: string;
    REPORT_COUNT: number;
    USER_PID: string;
    UPLOAD_YN: string;
    TEST_YN: string;
    SCH_END_DATE: string;
    DISP_YN: string;
    PRICE: number;
    REASON_CODE: string;
    PAGE: number;
    PID: string;
    START_DATE: string;
    USER_NAME: string;
    FILE_PATH: string;
    DIV: string;
    COMPLAIN_INFO: string;
    RNUM: number;
    SUB_TITLE: string;
    START_SEC: number;
    LINK_USER: string;
    TITLE: string;
    VOD_DURATION: string;
    REPORT_PID: string;
    OPEN_DATE: string;
}

export interface GoodsReport {
    USER_PID: string;
    ALIAS: string;
    REASON_CODE: string;
    REPORT_STATUS: string;
    USEYN: string;
    USER_ID: string;
    PID: string;
    USER_NAME: string;
    NAME: string;
    REPORT_RESULT_PID: string;
    COMPLAIN_INFO: string;
    GTYPE: string;
    RNUM: number;
    REASON_NAME: string;
    VALID_YN: string;
    THUMURL: string;
    LINK_USER: string;
    REPORT_COUNT: number;
    GINFO: string;
}

export interface ChatReport {
    TARGET_MEM_ID: string;
    TARGET_USER_PID: string;
    LAST_REPORT_DATE: string;
    WAIT_COMPLAIN_COUNT: number;
    COMPLETE_REPORT_COUNT: number;
    ALIAS: string;
    CHAT_REPORT_COUNT: number;
    WAIT_APPROVAL_COUNT: number;
    AVATAR_URL: string;
    REPORT_LEVEL: number;
    REPORT_STATUS?: string;
}

export type ReportReq = {
    TARGET_PID: string;
    REPORT_TYPE: string;
};

export interface Report {
    USER_PID: string;
    REPORT_TYPE: string;
    MOD_DATE: string;
    STATUS: string;
    TARGET_PID: string;
    USE_YN: string;
    REASON_NAME: string;
    REASON_CODE: string;
    CRT_DATE: string;
    PID: number;
}

export type ReportIReq = {
    REASON_CODE: string;
    REASON_NAME: string;
    TARGET_PID?: string;
    REPORT_TYPE?: string;
    USER_PID: string;
    USER_ID?: string;
    LINK_USER: string;
    REPORT_PID?: string;
};

export type ReportUReq = {
    REASON_CODE: string;
    REASON_NAME: string;
    TARGET_PID?: string;
    REPORT_TYPE?: string;
    USER_PID: string;
    USER_ID?: string;
    LINK_USER: string;
    REPORT_PID?: string;
    COMPLAIN_INFO?: string;
    STATUS?: string;
    RESULT_PID?: string;
};

export type ReportDReq = {
    TARGET_PID?: string;
    REPORT_TYPE?: string;
    USER_PID?: string;
    USER_ID?: string;
    LINK_USER?: string;
    REPORT_PID?: string;
    RESULT_PID?: string;
};

export type ReportListDReq = {
    LIST_PID: string;
};
