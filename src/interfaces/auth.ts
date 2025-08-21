import { Response } from "./common";

export type LoginParamsReq = {
    USERID: string;
    PWD: string;
    REMARK: string;
};

export type LoginDataRes = Response<
    {
        ROWNUM: number;
        PLACENAME: string;
        COMID: number;
        PAGE: number;
        AUTH_KEY: string;
        PLACEID: number;
        DEPID: string;
        MAJORID: string;
        USERID: string;
        TRACKINGAPIKEY: string;
        USERLEVEL: string;
        COMNAME: string;
        MEMNAME: string;
    }[]
>;
