export type ArtistReq = {
    FILTER: string;
    SORTBY: string;
    SORTDIR: string;
    PAGENUM: string;
    PAGESIZE: string;
    COMID: number;
    PLACEID: number;
    ARTIST_TYPE: string;
};

export type CategoryArtistReq = {
    TYPE: string;
};

export interface Artist {
    ALIAS_KR: string;
    PLACENAME: string;
    ALIAS: string;
    USER_ID: string;
    GRANT_SHOP: string;
    ARTIST_TYPE: string;
    ROWNO: number;
    USE_YN: string;
    PLACEID: number;
    PARENT_NAME: string;
    DOB: string;
    DOD: string;
    FANCLUB_NAME: string;
    COMNAME: string;
    USER_PID: string;
    INS_URL: string;
    DISP_YN: string;
    IDOL_PID: number;
    NATIONAL: string;
    STATE_TEXT: string;
    REG_DATE: string;
    THUMB_URL: string;
    COMID: number;
    PARENT_PID: string;
    PARENT_NAME_KR: string;
    ARTIST_CATEGORY_ID: number;
    ARTIST_CATEGORY_NAME: string;
    FACE_URL: string;
    YOU_URL: string;
}

export interface CategoryArtist {
    IMAGE: string;
    DESCRIPTION: string;
    KEYNAME: string;
    CATEGORYID: number;
    ORDERSEQ: number;
    TYPE: string;
    NAME: string;
}

export type ArtistIReq = {
    COMID: number;
    PLACEID: number;
    ARTIST_CATEGORY_ID?: number;
    USER_ID: string;
    PARENT_PID: string;
    PWD: string;
    ALIAS: string;
    ALIAS_KR: string;
    PARENT_NAME: string;
    COMNAME: string;
    DOD: string;
    DOB: string;
    FANCLUB_NAME: string;
    NATIONAL: string;
    STATE_TEXT: string;
    FACE_URL: string;
    USE_YN: string;
    INS_URL: string;
    YOU_URL: string;
    REG_DATE: string;
    ARTIST_TYPE: string;
    BIRTHDAY: string;
    APPID?: string;
    LOGIN_TYPE?: string;
};

export type ArtistUReq = ArtistIReq & {
    IDOL_PID: number;
    PROFILE_IMG_YN: string;
    THUMB_URL?: string;
};
