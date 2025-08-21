export interface Category {
    IMAGE: string;
    DESCRIPTION: string;
    KEYNAME: string;
    CATEGORYID: number;
    USEYN: string;
    ORDERSEQ: number;
    MODDATE: string;
    CRTDATE: string;
    NAME: string;
}

export type CategoryParamsReq = {
    USEYN?: boolean;
};

export type CategoryParamsIReq = {
    IMAGE: string;
    DESCRIPTION: string;
    USEYN: string;
    ORDERSEQ: number;
    KEYNAME: string;
    NAME: string;
};

export type CategoryParamsUReq = CategoryParamsIReq & { CATEGORYID: number };

export type CategoryParamsDReq = {
    CATEGORYID: number;
};
