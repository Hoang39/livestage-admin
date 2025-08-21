export interface PersonalSale {
    APPROVALSTATUS: string;
    IDPHOTOS: string;
    ROWNUM: number;
    PHONE: string;
    REJECTREASON: string;
    PAGE: number;
    FIRSTNAME: string;
    EMAIL: string;
    INVALID_PHOTO_YN: string;
    MEMID: number;
    IDNUM: string;
    LASTNAME: string;
    USERID: string;
    BANKACCOUNT: string;
    APPROVEYN: string;
    CRTDATE: string;
}

export type PersonalSaleReq = {
    EMAIL: string;
    APPROVALSTATUS: string;
    PAGE_NUM: number;
    PAGE_SIZE: number;
};

export type PersonalSaleUReq = {
    MEMID: number;
    APPREOVEYN: string;
    REJECTID: number;
};

export type GrantUserPersonalReq = {
    COMID: number;
    PLACEID: number;
    USER_ID: string;
    LINK_USER: number;
    TYPE: string;
    REJECTID?: string | number;
    REJECTREASON?: string;
};

export interface GoodsSale {
    GSHOWEND: string;
    RETURNREFUNDPOLICYINFO: string;
    PLACENAME: string;
    SELLER_YN: string;
    MEMTYPE: string;
    GTYPE: string;
    TOTSELLPRICE: number;
    PLACEID: number;
    IMAGES: {
        THUMYN: string;
        URL: string;
    }[];
    LIVEPRICE: number;
    COMNAME: string;
    CRTDATE: string;
    THUMPATH: string;
    WAREHOUSEID: number;
    SHOPID: string;
    NAME: string;
    SELLFLAG: string;
    REASONCODE: string;
    APPROVE_YN: string;
    ADDSHIPPINGFEE: number;
    VIDEOS: {
        THUMBURL: string;
        URL: string;
    }[];
    STATUSNAME: string;
    WAREHOUSENAME: string;
    DISCOUNTPER: number;
    PLACETEL: string;
    REASONNAME: string;
    WAREHOUSETEL2: string;
    DISCOUNTPRICE: number;
    WAREHOUSETEL1: string;
    MEMID: number;
    WAREHOUSEADDR2: string;
    FREESHIPPINGFEE: number;
    APPROVALID: number;
    OUTBINDINGURL: string;
    GROUPNAME: string;
    SELLSTATUSNAME: string;
    DANGA: number;
    GSELLSTATUSID: number;
    SHIPPINGFEE: number;
    EXCHANGESHIPPINGFEE: number;
    GTYPE_NM: string;
    MEMBERSHIP_YN: string;
    RETURNSHIPPINGFEE: number;
    SELLPRICE3: number;
    GSHOWSTART: string;
    BASICINFO: string;
    USEYN: string;
    COMID: number;
    ORDERSEQ: number;
    GOODSYN: string;
    APPROVALSTATE: string;
    REFID: number;
    GSTATUSID: number;
    SELLPRICE: number;
    SELLER_ALIAS: string;
    GOODSID: number;
    THUMURL: string;
    WAREHOUSEZIP: string;
    STOCKS: number;
    MODDATE: string;
    WAREHOUSEADDR: string;
    VODURL: string;
    SHOP_YN: string;
    GINFO: string;
}

export type GoodsSaleReq = {
    NAME: string;
    APPROVALSTATUS: string;
    USERID: string;
    PAGE_NUM: number;
    PAGE_SIZE: number;
};

export type GoodsSaleUReq = {
    GOODSID: number;
    STATE: string;
    MODBY: string;
    REJECTID?: string;
    REJECTREASON?: string;
};

export type SellerListReq = {
    APPROVALSTATUS: string;
    PAGENUM: number;
    PAGESIZE: number;
};

export type SellerList = {
    ZIP: string;
    ROWNUM: number;
    ALIAS: string;
    SELLER_YN: string;
    EMAIL: string;
    INVALID_PHOTO_YN: string;
    MEMID: number;
    MEMTYPE: string;
    ADDR2: string;
    USERID: string;
    GENDER: string;
    AVATAR_URL: string;
    APPROVEYN: string;
    CRTDATE: string;
    BIRTHDAY: string;
    MEMNAME: string;
    APPROVALSTATUS: string;
    IDPHOTOS: string;
    SELLER_EMAIL: string;
    SELLER_IDNUM: string;
    USEYN: string;
    REJECTREASON: string;
    REPORT_LEVEL: number;
    SELLER_BANKACCOUNT: string;
    ADDR: string;
    SELLER_LASTNAME: string;
    TEL: string;
    SELLER_FIRSTNAME: string;
    MOBILE: string;
    SELLER_PHONE: string;
};

export type SellerReviewListReq = {
    MEMID: number;
    PAGENUM: number;
    PAGESIZE: number;
};

export type SellerReviewList = {
    USER_PID: string;
    DISP_YN: string;
    TARGET_PID: string;
    PHOTO_LIST: { PHOTO_URL: string }[];
    AVG_RATING: number;
    SELLER_RATING: number;
    ALIAS: string;
    ROWNO: number;
    USE_YN: string;
    MOD_CNT: number;
    CRT_DATE: string;
    REV_TEXT: string;
    VIDEO_LIST: { VIDEO_THUMB_URL: string; VIDEO_URL: string }[];
    REVIEW_PID: string;
    AVATAR_URL: string;
    TYPE: string;
};

export type SellerReviewListRes = {
    TOTAL_PAGE: number;
    PAGE_NUM: number;
    PAGE_SIZE: number;
    TOTAL_CNT: number;
    AVG_RATING: number;
    MEDIA_URL: string;
    REVIEWS: SellerReviewList[];
};

export type SellerGoodsListReq = {
    MEMID: number;
    PAGENUM: number;
    PAGESIZE: number;
};

export type SellerGoodsList = {
    SELLCNT: number;
    RETURNREFUNDPOLICYINFO: string;
    PLACENAME: string;
    REPORT_YN: string;
    WAREHOUSE_ADDR2: string;
    SELLER_YN: string;
    MEMTYPE: string;
    GTYPE: string;
    PLACEID: number;
    IMAGES: string;
    LIVEPRICE: number;
    COMNAME: string;
    CRTDATE: string;
    THUMPATH: string;
    WAREHOUSEID: number;
    REPORT_CNT: number;
    SHOPID: string;
    DISCOUNTPERCENT2: number;
    NAME: string;
    SELLFLAG: string;
    REASONCODE: string;
    COSTSELLPRICE2: number;
    APPROVE_YN: string;
    VIDEOS: string;
    COSTSELLPRICE: number;
    STATUSNAME: string;
    DISCOUNTPERCENT: number;
    NOWTS: string;
    PLACETEL: string;
    REASONNAME: string;
    GROUPCD: string;
    DISCOUNTPRICE: number;
    WAREHOUSE_TEL1: string;
    MEMID: number;
    WAREHOUSE_TEL2: string;
    APPROVALID: number;
    OUTBINDINGURL: string;
    GROUPNAME: string;
    SELLSTATUSNAME: string;
    DANGA: number;
    OPTGOODS: string;
    GSELLSTATUSID: number;
    WAREHOUSE_NAME: string;
    MEMBERSHIP_YN: string;
    WAREHOUSE_COUNTRYCODE: string;
    SELLPRICE3: number;
    SELLPRICE2: number;
    BASICINFO: string;
    USEYN: string;
    COMID: number;
    APPROVALSTATE: string;
    REFID: number;
    GSTATUSID: number;
    SELLPRICE: number;
    BOOST_YN: string;
    GROUPID: number;
    GOODSID: number;
    THUMURL: string;
    WAREHOUSE_ADDR: string;
    MODDATE: string;
    SHOP_YN: string;
    GINFO: string;
};

export type SellerGoodsListRes = {
    TOTAL_PAGE: number;
    PAGE_NUM: number;
    PAGE_SIZE: number;
    TOTAL_CNT: number;
    GOODS: SellerGoodsList[];
};
