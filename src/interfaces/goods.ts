import { Response } from "./common";

export interface GoodImage {
    PATH: string;
    GOODSID: number;
    PLACEID: number;
    THUMYN: string;
    IMGID: number;
    COMID: number;
    ORDERSEQ: number;
    URL: string;
    IMGKIND?: string;
}
export interface Good {
    MODID: any;
    ORDERSEQ: any;
    DES_IMAGES: (File | GoodImage)[];
    VARIATIONS: never[];
    OPTIONS: never[];
    THUMURL: string;
    IMAGES: (File | GoodImage)[];
    GSHOWEND: string;
    RETURNREFUNDPOLICYINFO: string;
    PLACENAME: string;
    DISCOUNTPER: number;
    PLACETEL: string;
    BARCODE: string;
    DISCOUNTPRICE: number;
    FREESHIPPINGFEE: number;
    GTYPE: string;
    TOTSELLPRICE: number;
    OUTBINDINGURL: string;
    PLACEID: number;
    COUNTRY: string;
    QRCODE: string;
    DANGA: number;
    LIVEPRICE: number;
    SHIPPINGFEE: number;
    EXCHANGESHIPPINGFEE: number;
    GTYPE_NM: string;
    COMNAME: string;
    RETURNSHIPPINGFEE: number;
    THUMPATH: string;
    SELLPRICE3: number;
    GSHOWSTART: string;
    STAMPADD: number;
    BASICINFO: string;
    SIZE: string;
    USEYN: string;
    COMID: number;
    GOODSYN: string;
    SHOPID: string;
    REFID: number | string;
    NAME: string;
    SELLPRICE: number;
    SELLFLAG: string;
    GOODSID: number;
    SIZEPERPRICE: string;
    ADDSHIPPINGFEE: number;
    STOCKS: number;
    GSHORTINFO: string;
    VODURL: string;
    GINFO: string;
}

export type GoodsInsertParamsReq = {
    COMID: number;
    PLACEID: number;
    REFID: string | number;
    ORDERSEQ: number;
    NAME: string;
    DANGA: number;
    SELLPRICE: number;
    GINFO: string;
    SELLFLAG: string;
    USEYN: string;
    GTYPE: string;
    THUMURL: string;
    THUMPATH: string;
    STOCKS: number;
    SIZE: string;
    SIZEPERPRICE: string;
    COUNTRY: string;
    GSHORTINFO: string;
    GSHOWSTART: string;
    GSHOWEND: string;
    BARCODE: string;
    QRCODE: string;
    GOODSYN: string;
    STAMPADD: number;
    DISCOUNTPER: number;
    TOTSELLPRICE: number;
    VODURL: string;
    CRTID: string;
    OUTBINDINGURL: string;
    LIVEPRICE: number;
};

export type GoodsImagesInsertParamsReq = {
    COMID: number;
    PLACEID: number;
    GOODSID: number;
    ORDERSEQ: number;
    URL: string;
    PATH: string;
    THUMYN: string;
};

export type GoodsUpdateParamsReq = Omit<GoodsInsertParamsReq, "ORDERSEQ"> & {
    GOODSID: number;
};

export type GoodsIdParamsReq = {
    COMID: number;
    PLACEID: number;
    GOODSID: number;
};

export type GoodOptions = {
    COMID: number;
    GOODSID: number;
    MULTISELECTYN: string;
    OPTIONCD: number;
    OPTIONNAME: string;
    OPTTYPE: string;
    ORDERSEQ: number;
    PLACEID: number;
    REQUIREDYN: string;
    USEYN: string;
    subOptions?: any;
};

export type GoodVariations = {
    TOTSELLPRICE: number;
    OPTIONSCODE: string;
    OPTIONGOODSCODE: string;
    GOODSID: number;
    PLACEID: number;
    OPTIONGOODSID: number;
    DANGA: number;
    COMID: number;
    STOCKS: number;
    SELLPRICE: number;
};

export type GoodsOptionsIParamsReq = {
    COMID: number;
    PLACEID: number;
    GOODSID: number;
    OPTIONNAME: string;
    ORDERSEQ: number;
    OPTTYPE: string;
    USEYN: string;
    MULTISELECTYN: string;
    REQUIREDYN: string;
};

export type GoodsOptionsUParamsReq = GoodsOptionsIParamsReq & {
    OPTIONCD: number;
};

export type GoodsOptionsDParamsReq = GoodsIdParamsReq & { OPTIONCD: number };

export type GoodsOptionsAttbReq = GoodsOptionsDParamsReq;

export type GoodsOptionsAttbIReq = GoodsOptionsAttbReq & {
    ATTBNAME: string;
    ORDERSEQ: number;
    ATTBVALUE: string;
    ADDTIONALPRICE: number;
    STOCKS: number;
};

export type GoodsOptionsAttbUReq = GoodsOptionsAttbIReq & { ATTBCD: number };

export type GoodsOptionsAttbDReq = GoodsOptionsAttbReq & { ATTBCD: number };

export type GoodsListParamsReq = {
    COMID: number;
    PLACEID: number;
    USEYN: string;
    SELLFLAG: string;
    REFID: string | number;
    USERID?: string;
};

export type GoodsLiveParamsReq = {
    ADDSHIPPINGFEE: number;
    BARCODE: string;
    BASICINFO: string;
    COMID: number;
    COMNAME: string;
    COUNTRY: string;
    DANGA: number;
    DELIVERYPERIOD: string;
    DISCOUNTPER: number;
    DISCOUNTPRICE: number;
    EXCHANGESHIPPINGFEE: number;
    FREESHIPPINGFEE: number;
    GINFO: string;
    GOODSID: number;
    GOODSYN: string;
    GSHORTINFO: string;
    GSHOWEND: string;
    GSHOWSTART: string;
    GTYPE: string;
    GTYPE_NM: string;
    IMAGES: Array<any>;
    LIVEPRICE: number;
    MODID: string;
    NAME: string;
    OPTGOODS: Array<any>;
    OPTIONS: Array<any>;
    OUTBINDINGURL: string;
    PLACEID: number;
    PLACENAME: string;
    PLACETEL: string;
    QRCODE: string;
    REFID: number | string;
    RETURNREFUNDPOLICYINFO: string;
    RETURNSHIPPINGFEE: number;
    SELLFLAG: string;
    SELLPRICE: number;
    SELLPRICE3: number;
    SHIPPINGFEE: number;
    SHOPID: string;
    SIZE: string;
    SIZEPERPRICE: string;
    STAMPADD: number;
    STOCKS: number;
    THUMPATH: string;
    THUMURL: string;
    TOTSELLPRICE: number;
    USEYN: string;
    VODURL: string;
    rowStatus: string;
};

export type GoodsGroupParamsReq = {
    COMID: number;
    PLACEID: number;
    GPTYPE: string;
};
export interface GoodGroup {
    NO: number;
    VIEWAREA: string;
    VIEWTYPE: string;
    GROUPCD: string;
    USEYN: string;
    COMID: string;
    ORDERSEQ: number;
    LEVEL: number;
    REFID: number | string;
    GPTYPE_NM: string;
    GROUPID: number;
    THUMBURL: string;
    PLACEID: string;
    PARENTID: number;
    GROUPNAME: string;
    GPTYPE: string;
    ISBRENCH: string;
    THUMB: string;
    REMARK: string;
    children?: GoodGroup[];
}

export interface GoodsGroupIReq {
    COMID: string;
    PLACEID: string;
    GROUPID: string;
    GROUPCD: string;
    ORDERSEQ: number;
    REFID: string | number;
    GROUPNAME: string;
    LEVEL: number;
    REMARK: string;
    ISBRENCH: string;
    USEYN: string;
    GPTYPE: string;
    VIEWTYPE: string;
    VIEWAREA: string;
    GOODSCNTPERROW: string;
    PARENTID: number;
}

export interface GoodsGroupUReq {
    COMID: string;
    PLACEID: string;
    GROUPID: number;
    GROUPCD: string;
    ORDERSEQ: number;
    REFID: number | string;
    GROUPNAME: string;
    LEVEL: number;
    REMARK: string;
    ISBRENCH: string;
    USEYN: string;
    GPTYPE: string;
    VIEWTYPE: string;
    VIEWAREA: string;
    THUMB: string;
}

export interface GoodsGroupDReq {
    COMID: string;
    PLACEID: string;
    REFID: number | string;
}

export interface GoodLog {
    THUMPATH: string;
    GSHOWEND: string;
    LOGDATE: string;
    GSHOWSTART: string;
    SIZE: string;
    USEYN: string;
    BARCODE: string;
    NAME: string;
    SELLPRICE: number;
    SELLFLAG: string;
    GTYPE: string;
    COUNTRY: string;
    QRCODE: string;
    DANGA: number;
    SIZEPERPRICE: string;
    THUMURL: string;
    GSHORTINFO: string;
    GINFO: string;
}

export type GoodsLogParamsReq = {
    COMID: number;
    PLACEID: number;
    STARTDATE: string;
    ENDDATE: string;
};

export type GoodsListDataRes = Response<Good[]>;

export type GoodsGroupListDataRes = Response<GoodGroup[]>;
