export interface Order {
    PLACEORDERID: number;
    PAYTYPENAME: string;
    RECVADDR: string;
    ORDERTEL2: string;
    SCOMID: string;
    SCOMNAME: string;
    ORDERTEL1: string;
    REQORDERINFO: string;
    MEMID: number;
    RECVZIP: string;
    ORDERID: number;
    RECVNAME: string;
    PLACEID: number;
    ORDERDATE: string;
    SHIPPINGFEE: number;
    ORDERADDR: string;
    RECVTEL1: string;
    ORDERSTATE: string;
    RECVTEL2: string;
    DISPRICE: number;
    ORDERSTATENAME: string;
    CRTDATE: string;
    ORDEREMAIL: string;
    MEMNAME: string;
    PAYPRICE: number;
    INVOICENO: string;
    REQSHIPID: string;
    DISPOINT: number;
    COMID: number;
    PAYTYPE: string;
    RECVADDR2: string;
    ORDERZIP: string;
    ORG_ORDERDATE: string;
    GOODSID: number;
    ORDERNAME: string;
    EXTRAFEE: number;
    REQSHIPINFO: string;
    TOTORDERPRICE: number;
    ACTIONDETAIL: string;
    ACTIONDATE: string;
    DELIVERYDATE: string;
    DELIVERYNO: string;
    INVOICENOINPUTDATE: string;
}

export interface OrderGoods {
    GSHOWEND: string;
    PLACENAME: string;
    MEMID: number;
    ORDERID: number;
    GTYPE: string;
    TOTSELLPRICE: number;
    PLACEID: number;
    COUNTRY: string;
    OPTIONNAME: string;
    DANGA: number;
    QTY: number;
    GTYPE_NM: string;
    COMNAME: string;
    THUMPATH: string;
    GSHOWSTART: string;
    STAMPADD: number;
    SIZE: string;
    COMID: number;
    ORDERGOODSID: number;
    GOPTIONINFO: string;
    NAME: string;
    SELLPRICE: number;
    USERCODE: string;
    GROUPID: number;
    GOODSID: number;
    SIZEPERPRICE: string;
    THUMURL: string;
    GSHORTINFO: string;
    GINFO: string;
    PAYPRICE: number;
}

export interface OrderReq {
    COMID: number;
    PLACEID: number;
    ORDERID: string;
    MEMID: string;
    GOODSID: string;
    START_ORDERDATE: string;
    END_ORDERDATE: string;
    ORDERSTATE: string;
}

export interface OrderGoodsReq {
    COMID: number;
    PLACEID: number;
    ORDERID: number;
    MEMID: number;
    GOODSID: string;
}

export interface OrderUReq {
    COMID: number;
    PLACEID: number;
    ORDERID: number;
    PLACEORDERID: number;
    MEMID: number;
    ORDERZIP: string;
    ORDERADDR: string;
    ORDERDATE: string;
    ORDERNAME: string;
    RECVNAME: string;
    RECVZIP: string;
    RECVADDR: string;
    RECVTEL1: string;
    RECVTEL2: string;
    ORDERTEL1: string;
    ORDERTEL2: string;
    REQSHIPINFO: string;
    SCOMID: string;
    SCOMNAME: string;
    ORDEREMAIL: string;
    REQORDERINFO: string;
    TOTORDERPRICE: number;
    DISPRICE: number;
    ORDERSTATE: string;
    PAYTYPE: string;
    PAYPRICE: number;
    MODID: number;
    SHIPPINGFEE: number;
    INVOICENO: string;
    INVOICENOINPUTDATE: string;
    DELIVERYDATE: string;
    DELIVERYNO: string;
    RECVADDR2: string;
    CHANGEORDERGOODSID: string;
    CHANGEQUANTITY: string;
    RETURNSHIPPINGFEEYN: string;
}
