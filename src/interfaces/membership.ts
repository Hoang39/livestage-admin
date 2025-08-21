export interface Membership {
    APPROVALSTATUS: string;
    IDPHOTOS: string;
    ROWNUM: number;
    PHONE: string;
    REJECTREASON: string;
    PAGE: number;
    FIRSTNAME: string;
    EMAIL: string;
    MEMID: number;
    IDNUM: string;
    LASTNAME: string;
    USERID: string;
    BANKACCOUNT: string;
    APPROVEYN: string;
    CRTDATE: string;
    REJECTID: string;
}

export interface Member {
    ZIP: string;
    SEX: string;
    USEYN: string;
    COMID: number;
    EMAIL: string;
    MEMID: number;
    ADDR: string;
    LOGINTYPE: string;
    VISITDATE: string;
    NICKNAME: string;
    ADDR2: string;
    COUNTRYCODE: string;
    PLACEID: number;
    USERID: string;
    TEL: string;
    PWD: string;
    MEMBERSHIP_YN: string;
    CRTDATE: string;
    BIRTHDAY: string;
    MEMNAME: string;
    MOBILE: string;
}

export interface MemberReport {
    ACTIVE_COUNT: number;
    VISIT_MONTH: number;
    INACTIVE_COUNT: number;
    VISIT_TODAY: number;
}

export interface MembershipReq {
    EMAIL: string;
    APPROVALSTATUS: string;
    PAGE_NUM: number;
    PAGE_SIZE: number;
}

export interface MembershipUReq {
    MEMID: number;
    APPREOVEYN: string;
    REJECTID: number | string;
}

export interface MemberReq {
    MEM_ID: string;
    USE_YN: string;
    CR_FROMDATE: string;
    CR_TODATE: string;
    PAGE: number;
    SIZE: number;
}

export interface GrantUserMembershipReq {
    USER_ID: string;
    LINK_USER: number;
    TYPE: string;
    REJECTID: number | string;
    REJECTREASON: string;
}
