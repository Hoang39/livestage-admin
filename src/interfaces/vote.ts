export type VoteReq = {
    PAGE: number;
    SIZE: number;
    COMID: number;
    PLACEID: number;
};

export type VoteDetailReq = VoteReq & {
    FILTER: string;
    EVENT_PID: number;
};

export type RankReq = {
    FILTER: string;
    EVENT_PID: number;
};

export interface Vote {
    START_TIME: string;
    CREATED_AT: string;
    NOW_TIME: string;
    VOTE_CONFIG_NAME: string;
    AMOUNT_PER_VOTE: number;
    STATUS_NAME: string;
    VOTE_CONFIG_PID: number;
    ARTIST_TYPE: string;
    STATUS: string;
    USE_YN: string;
    END_TIME: string;
    PLACEID: number;
    DESCRIPTION: string;
    WINNING_ALIAS_KR: string;
    THUMB_DEFAULT: string;
    MAX_DAILY_VOTE: number;
    COM_NAME: string;
    EXPIRED_WEIGHT: string;
    FAVORITE_COUNT: number;
    REMAINING_TIME: number;
    UPDATED_AT: string;
    CONTENT: string;
    SORT_BY_EXPIRED: number;
    CREATED_BY: string;
    ROULETTE_YN: string;
    THUMB_URL: string;
    COMID: number;
    PID: number;
    PLACE_NAME: string;
    WINNING_ALIAS: string;
    TOTAL_VOTE_USER: number;
    WINNING_OPTION: string;
    THUMB_IMAGE: string;
    TITLE: string;
    EXPIRED_YN: string;
    DATE_LABEL: string;
}

export interface VoteDetail {
    START_TIME: string;
    ROULETTE_YN: string;
    PLACENAME: string;
    THUMB_URL: string;
    COMID: number;
    EDIT_YN: string;
    NOW_TIME: string;
    PID: number;
    AMOUNT_PER_VOTE: number;
    TOTAL_CANDIDATE: number;
    ARTIST_TYPE: string;
    USE_YN: string;
    END_TIME: string;
    PLACEID: number;
    THUMB_IMAGE: string;
    DESCRIPTION: string;
    THUMB_DEFAULT: string;
    MAX_DAILY_VOTE: number;
    TITLE: string;
    REMAINING_TIME: number;
    CONTENT: string;
    COMNAME: string;
    EXPIRED_YN: string;
    DATE_LABEL: string;
}

export interface Rank {
    FIRST_VOTE_AT: string;
    IDOL_PID: number;
    ALIAS_KR: string;
    ALIAS: string;
    VOTE_TIME: number;
    THUMB_URL: string;
    PROFILE_PID: string;
    RANK_NO: number;
    VOTE_YN: string;
    VOTE_AMOUNT: number;
    GROUP_NAME_KR: string;
    GROUP_NAME: string;
    ARTIST_TYPE: string;
    TOTAL_VOTE_TIME: number;
    VOTE_PERCENTAGE: number;
    IDOL_USER_PID: string;
    DOB: string;
    VOTE_PID: number;
    DOD: string;
}

export type VoteIReq = Partial<Vote>;

export type VoteUReq = Partial<Vote>;

export type VoteDReq = Partial<Vote> & {
    EVENT_PID: number;
    CONFIRM_YN: string;
    UPDATED_BY: string;
};

export type VoteAccountReq = {
    EVENT_PID: number;
    IDOL_PIDS: string;
};
