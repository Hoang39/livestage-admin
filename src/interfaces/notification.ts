export interface Notification {
    SEND_STATUS: string;
    CUR_DATE: string;
    DESC: string;
    OVERDUE_MIN: string;
    SCH_DATE: string;
    EVENT_SOURCE: string;
    TOTAL_READ: string;
    PUSH_PID: string;
    ROWNO: string;
    NDATA: string;
    CRT_DATE: string;
    TITLE: string;
    BODY: string;
    CONFIG_DATA?: string;
    PUSH_YN: string;
}

export interface ScheduleNotification {
    SENDER_NAME: string;
    TO_GROUP: string;
    MOD_DATE: string;
    TAS_ID: string;
    SENDER: string;
    USER_NAME: string;
    DELETED: string;
    SCH_DATE: string;
    USER_EMAILS: string;
    MAP_CONTENT: string;
    STATUS: string;
    NOTE: string;
    CRT_DATE: string;
    SUBJECT: string;
    USER_MOD: string;
    ID: number;
    TYPE: string;
}

export type ScheduleNotificationIReq = {
    TYPE: string;
    TAS_ID: string;
    TO_GROUP: string;
    USER_NAME: string;
    USER_EMAILS: string;
    MAP_CONTENT: string;
    SENDER: string;
    SENDER_NAME: string;
    SUBJECT: string;
    NOTE: string;
    SCH_DATE: string;
    USER_MOD: string;
};

export type ScheduleNotificationUReq = ScheduleNotificationIReq & {
    ID: number;
};

export type ScheduleNotificationDReq = {
    ID: number;
    USER_MOD: string;
};
