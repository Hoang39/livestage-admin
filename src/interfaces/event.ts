export type EventReq = {
    USEYN: string;
};

export interface Event {
    STARTDATE: string;
    KEYNAME: string;
    BONUS: number;
    EVENTID: number;
    TITLE: string;
    RULES: string;
    MODDATE: string;
    CRTDATE: string;
    ENDDATE: string;
}

export type EventIReq = {
    TITLE: string;
    RULES: string;
    BONUS: number;
    KEY_NAME: string;
    START_DATE: string;
    END_DATE: string;
};

export type EventUReq = EventIReq & {
    EVENT_ID: number;
};

export type EventDReq = {
    EVENT_ID: number;
};

export type UserEventReq = {
    EVENT_TYPE: string;
    FILTER: string;
    PAGE: number;
    SIZE: number;
};

export type UserEventDetailReq = {
    FILTER: string;
    USER_EVENT_PID: number;
    PAGE: number;
    SIZE: number;
};

type EventOption = {
    THUMB_IMAGE: string;
    DESCRIPTION: string;
    VOTE_USER: number;
    OPTION_TITLE: string;
    THUMB_URL: string;
    PID: number;
    VOTE_AMOUNT: number;
    PERCENTAGE_VOTE: number;
};

export interface UserEvent {
    NEAR_EXPIRED_WEIGHT: string;
    START_TIME: string;
    EVENT_TYPE_NAME: string;
    CREATED_AT: string;
    SUM_VOTE: number;
    EVENT_TYPE: string;
    NOW_TIME: string;
    EVENT_STATE: string;
    USE_YN: string;
    END_TIME: string;
    DESCRIPTION: string;
    EXPIRED_WEIGHT: string;
    FAVORITE_COUNT: number;
    UPDATED_AT: string;
    REMAINING_TIME: number;
    SORT_TS: number;
    EVENT_OPTIONS: EventOption[];
    THUMB_URL_BLANK: string;
    VOTE_USER: number;
    PRIVATE_YN: string;
    PID: number;
    AUTHOR_NAME: string;
    AUTHOR_AVATAR: string;
    VOTE_COUNT: number;
    AUTHOR_PID: string;
    TITLE: string;
    DATE_LABEL: string;
    EXPIRED_YN: string;
}

type VoteOption = {
    THUMB_IMAGE: string | null;
    VOTE_COUNT: number;
    OPTION_TITLE: string;
    THUMB_URL: string;
    VOTE_USER_COUNT: number;
    PID: number;
    OPTION_TYPE: string | null;
    PERCENTAGE_VOTE: number;
};
export interface UserEventDetail {
    THUMB_URL_BLANK: string;
    START_TIME: string;
    EVENT_TYPE: string;
    PRIVATE_YN: string;
    NOW_TIME: string;
    PID: number;
    AUTHOR_NAME: string;
    AUTHOR_AVATAR: string;
    FREE_VOTE_COUNT: number;
    AMOUNT_PER_VOTE: number;
    TOTAL_VOTE_USER: number;
    USE_YN: string;
    END_TIME: string;
    DESCRIPTION: string;
    VOTE_COUNT: number;
    VOTE_OPTS: VoteOption[];
    AUTHOR_PID: string;
    TITLE: string;
    FAVORITE_COUNT: number;
    REMAINING_TIME: number;
    MULTIPLE_YN: string;
    DATE_LABEL: string;
}

export type UserEventUReq = {
    USER_EVENT_PID: number;
    PRIVATE_YN: string;
    UPDATED_BY: string;
};
