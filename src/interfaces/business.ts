import { Response } from "./common";
export interface Company {
    ZIP: string;
    OUTBINDINGYN: string;
    BANNERIMAGEURL: string;
    USEYN: string;
    SECTOR: string;
    VAT: number;
    COMID: number;
    LOGOIMAGEURL: string;
    LOGOIMAGEPATH: string;
    CEO: string;
    ADDR: string;
    BANNERIMAGEPATH: string;
    BANKINFO: string;
    CHARGEMOBILE: string;
    MOTEMPLATEFLAG: string;
    TEL: string;
    COMNAME: string;
    CRTDATE: string;
    CHARGE: string;
    REVSHARE: number;
    COMDESC: string;
}

export type Place = {
    PLACEID: number;
    COMID: number;
    PLACENAME: string;
    ZIP?: string;
    MNGMOBILE?: string;
    INDUSTRYTYPE?: string;
    CARDPAYNODISYN?: string;
    FREESHIPPINGFEE?: number;
    INDUSTRYTYPE_NM?: string;
    SEARCHKEYWORD?: string;
    DEPID?: number;
    MAJORID?: number;
    MOTEMPLATEFLAG?: string;
    SHIPPINGFEE?: number;
    DELIVERYPERIOD?: string;
    MANAGER?: string;
    MALLKIND?: string;
    EXCHANGESHIPPINGFEE?: number;
    COMNAME?: string;
    CRTDATE?: string;
    RETURNSHIPPINGFEE?: number;
    THUMPATH?: string;
    DEFAULTPAYTYPE?: string;
    STAMPADD?: number;
    GOODSDISPER?: number;
    USEYN?: string;
    ADDR?: string;
    STAMPUSEYN?: string;
    THUMURL?: string;
    ADDSHIPPINGFEE?: number;
    TEL?: string;
    USESTATIC?: string;
};

export type CompanyListParamsReq = {
    COMNAME: string;
    USERID: string;
};

export type CompanyListDataRes = Response<Company[]>;

export type PlaceListParamsReq = {
    COMID: number;
};

export type PlaceListDataRes = Response<
    {
        COMID: number;
        PLACEID: number;
        PLACENAME: string;
    }[]
>;

export type PlaceInfoReq = {
    COMID: number | string;
    PLACEID: number | string;
    PLACENAME: string;
};

export type PlaceInfoRes = Response<Place[]>;

export type TrackingCompany = {
    Code: string;
    International: string;
    Name: string;
};
