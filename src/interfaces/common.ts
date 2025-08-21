export type Response<T> = {
    RESULT_CODE: string;
    RESULT_DATA: T;
    RESULT_MSG: string;
    RESULT_ID: string;
    REQUEST_ID: string;
    RESULT_PAGE_INFO: unknown[];
};

export type MenuItem = {
    UPCATEID: number;
    CONTROLLER: string;
    CATEID: number;
    CATEGORY: string;
    USEYN: string;
    TEMPLATE: string;
    CATELEVEL: number;
    ID: number;
    USERLEVEL: string;
    SORTSEQ: number;
    URL: string;
    NAME: string;
};

export type CommonCode = {
    CODE_ID: string;
    CODE_LIST_DISPLAY_NAME: string;
    CODE_LIST_ID: string;
    CODE_NAME: string;
    USE_FLAG: string;
    CODE_LIST_NAME: string;
    CODE_LIST_NO: number;
    CODE_NO: number;
};

export type CommonCodeGroup = {
    OPEN_TAG: string;
    CODE_ID: string;
    CODE_NAME: string;
    REMARK: string;
    CODE_NO: number;
};

export type CommonCodeReq = {
    CODE_ID: string;
};

export type CommonCodeIReq = {
    CODE_LIST_DISPLAY_NAME: string;
    CODE_LIST_ID: string;
    USE_FLAG: string;
    CODE_LIST_NAME: string;
    CODE_LIST_NO: number;
    CODE_NO: number;
};

export type CommonCodeUReq = CommonCodeIReq;

export type CommonCodeDReq = {
    CODE_NO: number;
    CODE_LIST_ID: string;
};

export type CommonCodeGroupReq = {
    CODE_ID: string;
    CODE_NAME: string;
};

export type CommonCodeGroupIReq = {
    CODE_ID: string;
    CODE_NAME: string;
    REMARK: string;
    OPEN_TAG: string;
};

export type CommonCodeGroupUReq = {
    CODE_ID: string;
    CODE_NAME: string;
    REMARK: string;
    OPEN_TAG: string;
    CODE_NO: number;
};

export type CommonCodeGroupDReq = {
    CODE_NO: number;
};

export type UserImageReq = {
    COMID: number;
    PLACEID: number;
    IMGKIND: string;
};

export type UserImageIReq = {
    COMID: number;
    PLACEID: number;
    IMGKIND: string;
    URL: string;
    PATH: string;
    IMGID?: number;
};

export type UserImage = {
    COMID: number;
    PLACEID: number;
    IMGID: number;
    PATH: string;
    URL: string;
};

export type AuthUserReq = {
    COMID: string;
    USERID: string;
};

export type AuthUser = {
    UPDATE_USERID: string;
    PLACEID: number;
    USERID: string;
    USERNAME: string;
    COMID: number;
    PWD: string;
    EMAIL: string;
    USERLEVEL: string;
    VIEWYN: string;
    CRTDATE: string;
    COMPLACENAME: string;
};

export type AuthUserUpdateReq = Partial<AuthUser> & {
    USERID: string;
    APP_ID: string;
};
