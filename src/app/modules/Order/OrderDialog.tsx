import { useState, useEffect, useMemo, useCallback } from "react";
import { Order as IOrder, OrderGoods } from "@/interfaces/order";
import { dialogStore } from "@/store/dialogStore";
import {
    Button,
    Drawer,
    Form,
    Space,
    Row,
    Col,
    Table,
    Flex,
    Image,
} from "antd";
import { useTranslation } from "react-i18next";
import { translateContent } from "@/utils/handleResponse";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { useAppStore } from "@/hooks/useAppStore";
import { OrderService } from "@/app/services/order";
import { CommonService } from "@/app/services/common";
import timeService from "@/libs/timeService";
import { Postcode, useDaumPostcode } from "@/hooks/useDaumPostcode";
import { TrackingCompany } from "@/interfaces/business";

export const useOrderDialog = dialogStore<IOrder>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormOrderValues = {
    PLACEORDERID: number;
    ORDERID: number;
    ORDERDATE: string;
    MEMNAME: string;
    TOTORDERPRICE: number;
    DISPRICE: number;
    PAYPRICE: number;
    PAYTYPENAME: string;
    ORDERSTATE: string;
    SCOMID: string;
    INVOICENO: string;
    REFUNDPRICE: number;
    ACTIONDETAIL: string;
    ACTIONDATE: string;
    REFUNDPOINT: number;
    SHIPPINGFEE: number;
    EXTRAFEE: number;
    DELIVERYDATE: string;
    RECVNAME: string;
    RECVTEL1: string;
    RECVTEL2: string;
    RECVZIP: string;
    RECVADDR: string;
    CRTDATE: string;
    REQSHIPNAME: string;
    REQSHIPINFO: string;
};

export const OrderDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Order");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const [trackingCompanySource, setTrackingCompanySource] = useState<
        TrackingCompany[]
    >([]);
    const [orderGoodsSource, setOrderGoodsSource] = useState<OrderGoods[]>([]);

    const { open, item, readonly, closeDialog } = useOrderDialog();
    const [isLoading, setIsLoading] = useState(false);

    const [orderState, setOrderState] = useState("");

    const { currentCompany, currentPlace, userInfo } = useAppStore(
        (state) => state
    );

    const [form] = Form.useForm<FormOrderValues>();

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    const { openDaumPostcode, DaumPostcodeModal } = useDaumPostcode();

    const handleSearchAddress = useCallback(() => {
        openDaumPostcode((address: Postcode) => {
            form.setFieldValue("RECVZIP", address.zonecode);
            form.setFieldValue("RECVADDR", address.fullAddress);
        });
    }, [form, openDaumPostcode]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                if (item) {
                    const trackingCompanyResponse =
                        await CommonService.getTrackingCompanyList({
                            t_key: userInfo?.TRACKINGAPIKEY,
                        });
                    setTrackingCompanySource(
                        trackingCompanyResponse?.data?.Company
                    );
                }

                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                console.log("Error trackingCompanyResponse: ", error);
            }
        })();
    }, [item, openNotification, userInfo]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                if (item) {
                    const response = await OrderService.fetchOrderGoods({
                        COMID: currentCompany?.COMID || 0,
                        PLACEID: currentPlace?.PLACEID || 0,
                        ORDERID: item?.ORDERID,
                        MEMID: item?.MEMID,
                        GOODSID: "",
                    });

                    setOrderGoodsSource(response?.RESULT_DATA);

                    form.setFieldsValue({
                        ...item,
                        ACTIONDETAIL: item.ACTIONDETAIL
                            ? translateContent(item.ACTIONDETAIL)
                            : item.ACTIONDETAIL,
                        ACTIONDATE: timeService.getStrDateParseFromUTC(
                            item.ACTIONDATE
                        ),
                        DELIVERYDATE: timeService.getStrDateParseFromUTC(
                            item.DELIVERYDATE
                        ),
                        CRTDATE: timeService.getStrDateParseFromUTC(
                            item.CRTDATE
                        ),
                    });

                    setOrderState(item.ORDERSTATE);
                }

                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);

                openNotification("error", "", undefined, {
                    showProgress: true,
                    pauseOnHover: true,
                });

                console.log("Init form values: ", error);
            }
        })();
    }, [currentCompany, currentPlace, form, item, openNotification]);

    const onValuesChange = (
        changedValues: Partial<FormOrderValues>,
        _allValues: FormOrderValues
    ) => {
        console.log({ changedValues });
        if (changedValues.ORDERSTATE) {
            setOrderState(changedValues.ORDERSTATE);
        }
    };

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            let status: string | undefined;

            if (typeof e === "string") {
                status = e;
            }

            onClose(status);
            closeDialog();
        },
        [closeDialog, onClose]
    );

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            console.log({ values });
            setIsLoading(true);

            if (item) {
                const {
                    ORDERID,
                    PLACEORDERID,
                    MEMID,
                    ORDERZIP,
                    ORDERADDR,
                    ORDERDATE,
                    ORDERNAME,
                    RECVNAME,
                    RECVTEL1,
                    RECVTEL2,
                    ORDERTEL1,
                    ORDERTEL2,
                    REQSHIPINFO,
                    ORDEREMAIL,
                    REQORDERINFO,
                    TOTORDERPRICE,
                    DISPRICE,
                    PAYTYPE,
                    PAYPRICE,
                    SHIPPINGFEE,
                    DELIVERYDATE,
                    RECVADDR2,
                    INVOICENOINPUTDATE,
                    DELIVERYNO,
                } = item;

                await OrderService.saveOrder({
                    COMID: currentCompany?.COMID || 0,
                    PLACEID: currentPlace?.PLACEID || 0,
                    RECVZIP: values.RECVZIP,
                    RECVADDR: values.RECVADDR,
                    SCOMID: values.SCOMID,
                    SCOMNAME:
                        trackingCompanySource.find(
                            (item: TrackingCompany) =>
                                item?.Code == values.SCOMID
                        )?.Name ?? "",
                    ORDERSTATE: values.ORDERSTATE,
                    INVOICENO: values.INVOICENO,
                    INVOICENOINPUTDATE,
                    ORDERID,
                    PLACEORDERID,
                    MEMID,
                    ORDERZIP,
                    ORDERADDR,
                    ORDERDATE,
                    ORDERNAME,
                    RECVNAME,
                    RECVTEL1,
                    RECVTEL2,
                    ORDERTEL1,
                    ORDERTEL2,
                    REQSHIPINFO,
                    ORDEREMAIL,
                    REQORDERINFO,
                    TOTORDERPRICE,
                    DISPRICE,
                    PAYTYPE,
                    PAYPRICE,
                    MODID: userInfo?.USERID ?? "",
                    SHIPPINGFEE,
                    DELIVERYDATE,
                    RECVADDR2,
                    DELIVERYNO,
                    CHANGEORDERGOODSID:
                        orderGoodsSource
                            ?.map((item) => item.ORDERGOODSID)
                            .join(",") ?? "",
                    CHANGEQUANTITY:
                        orderGoodsSource?.map((item) => item.QTY).join(",") ??
                        "",
                    RETURNSHIPPINGFEEYN: "Y",
                });
            }

            openNotification(
                "success",
                tCommon(item ? "update-successful" : "create-successful"),
                undefined,
                {
                    showProgress: true,
                    pauseOnHover: true,
                }
            );

            handleClose("success");
        } catch (error) {
            openNotification(
                "error",
                tCommon(item ? "update-failed" : "create-failed"),
                undefined,
                {
                    showProgress: true,
                    pauseOnHover: true,
                }
            );

            console.error("Validation or save error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const orderStateList = useMemo(() => {
        switch (orderState) {
            //Outstanding payment
            case "A": {
                return [
                    { value: "A", label: t("ORDER_STATE_A") },
                    { value: "H", label: t("ORDER_STATE_H") },
                    { value: "G", label: t("ORDER_STATE_G") },
                ];
            }
            //Preparing product
            case "B": {
                return [
                    { value: "B", label: t("ORDER_STATE_B") },
                    { value: "H", label: t("ORDER_STATE_H") },
                    { value: "C", label: t("ORDER_STATE_C") },
                    { value: "G", label: t("ORDER_STATE_G") },
                ];
            }
            //shipping
            case "C": {
                return [
                    { value: "C", label: t("ORDER_STATE_C") },
                    { value: "B", label: t("ORDER_STATE_B") },
                    { value: "D", label: t("ORDER_STATE_D") },
                    { value: "L", label: t("ORDER_STATE_L") },
                ];
            }
            //Delivery completed
            case "D": {
                return [
                    { value: "D", label: t("ORDER_STATE_D") },
                    { value: "C", label: t("ORDER_STATE_C") },
                    { value: "K", label: t("ORDER_STATE_K") },
                    { value: "I", label: t("ORDER_STATE_I") },
                ];
            }
            //Exchange completed
            case "E": {
                return [
                    { value: "E", label: t("ORDER_STATE_E") },
                    { value: "L", label: t("ORDER_STATE_L") },
                ];
            }
            //Return completed
            case "F": {
                return [
                    { value: "F", label: t("ORDER_STATE_F") },
                    { value: "J", label: t("ORDER_STATE_J") },
                ];
            }
            //Cancellation complete
            case "G": {
                return [
                    { value: "A", label: t("ORDER_STATE_A") },
                    { value: "B", label: t("ORDER_STATE_B") },
                    { value: "C", label: t("ORDER_STATE_C") },
                    { value: "D", label: t("ORDER_STATE_D") },
                    { value: "E", label: t("ORDER_STATE_E") },
                    { value: "F", label: t("ORDER_STATE_F") },
                    { value: "G", label: t("ORDER_STATE_G") },
                    { value: "H", label: t("ORDER_STATE_H") },
                    { value: "I", label: t("ORDER_STATE_I") },
                    { value: "J", label: t("ORDER_STATE_J") },
                    { value: "K", label: t("ORDER_STATE_K") },
                    { value: "L", label: t("ORDER_STATE_L") },
                ];
            }
            //Complete payment
            case "H": {
                return [
                    { value: "H", label: t("ORDER_STATE_H") },
                    { value: "B", label: t("ORDER_STATE_B") },
                    { value: "G", label: t("ORDER_STATE_G") },
                ];
            }
            //Return request
            case "I": {
                return [
                    { value: "I", label: t("ORDER_STATE_I") },
                    { value: "J", label: t("ORDER_STATE_J") },
                ];
            }
            //Processing return
            case "J": {
                return [
                    { value: "J", label: t("ORDER_STATE_J") },
                    { value: "I", label: t("ORDER_STATE_I") },
                    { value: "F", label: t("ORDER_STATE_F") },
                ];
            }
            //Exchange Request
            case "K": {
                return [
                    { value: "K", label: t("ORDER_STATE_K") },
                    { value: "D", label: t("ORDER_STATE_D") },
                    { value: "L", label: t("ORDER_STATE_L") },
                ];
            }
            //Exchange processing
            case "L": {
                return [
                    { value: "L", label: t("ORDER_STATE_L") },
                    { value: "K", label: t("ORDER_STATE_K") },
                    { value: "E", label: t("ORDER_STATE_E") },
                    { value: "C", label: t("ORDER_STATE_C") },
                ];
            }
        }
        return [];
    }, [orderState, t]);

    const fields: Field[] = useMemo(
        () => [
            {
                name: "PLACEORDERID",
                label: "ORDER_GRID_1_PLACEORDERID",
                type: "display",
                placeholder: "ORDER_GRID_1_PLACEORDERID",
                colSpan: 12,
            },
            {
                name: "ORDERID",
                label: "ORDER_GRID_1_ORDERID",
                type: "display",
                placeholder: "ORDER_GRID_1_ORDERID",
                colSpan: 12,
            },
            {
                name: "ORDERDATE",
                label: "ORDER_GRID_1_ORDERDATE",
                type: "display",
                placeholder: "ORDER_GRID_1_ORDERDATE",
                colSpan: 12,
            },
            {
                name: "MEMNAME",
                label: "ORDER_GRID_1_MEMNAME",
                type: "display",
                placeholder: "ORDER_GRID_1_MEMNAME",
                colSpan: 12,
            },
            {
                name: "TOTORDERPRICE",
                label: "ORDER_GRID_1_TOTORDERPRICE",
                type: "display",
                placeholder: "ORDER_GRID_1_TOTORDERPRICE",
                colSpan: 12,
            },
            {
                name: "DISPRICE",
                label: "ORDER_GRID_1_DISPRICE",
                type: "display",
                placeholder: "ORDER_GRID_1_DISPRICE",
                colSpan: 12,
            },
            {
                name: "PAYPRICE",
                label: "ORDER_GRID_1_PAYPRICE",
                type: "display",
                placeholder: "ORDER_GRID_1_PAYPRICE",
                colSpan: 12,
            },
            {
                name: "PAYTYPENAME",
                label: "ORDER_GRID_1_PAYTYPENAME",
                type: "display",
                placeholder: "ORDER_GRID_1_PAYTYPENAME",
                colSpan: 12,
            },
            {
                name: "ORDERSTATE",
                label: "ORDER_GRID_1_ORDERSTATE",
                type: "select",
                placeholder: "ORDER_GRID_1_ORDERSTATE",
                colSpan: 12,
                required: true,
                options: orderStateList,
            },
            {
                name: "SCOMID",
                label: "ORDER_GRID_1_SCOMID",
                type: "select",
                placeholder: "ORDER_GRID_1_SCOMID",
                colSpan: 12,
                disable: orderState != "B" && orderState != "L",
                options: trackingCompanySource?.map((item: any) => ({
                    value: item.Code,
                    label: item.Name,
                })),
            },
            {
                name: "INVOICENO",
                label: "ORDER_GRID_1_INVOICENO",
                type: "input",
                disable: orderState != "B" && orderState != "L",
                placeholder: "ORDER_GRID_1_INVOICENO",
                colSpan: 12,
            },
            {
                name: "REFUNDPRICE",
                label: "ORDER_GRID_1_REFUNDPRICE",
                type: "display",
                placeholder: "ORDER_GRID_1_REFUNDPRICE",
                colSpan: 12,
            },
            {
                name: "ACTIONDETAIL",
                label: "ORDER_GRID_1_ACTIONDETAIL",
                type: "display",
                placeholder: "ORDER_GRID_1_ACTIONDETAIL",
                colSpan: 24,
            },
            {
                name: "ACTIONDATE",
                label: "ORDER_GRID_1_ACTIONDATE",
                type: "display",
                placeholder: "ORDER_GRID_1_ACTIONDATE",
                colSpan: 12,
            },
            {
                name: "REFUNDPOINT",
                label: "ORDER_GRID_1_REFUNDPOINT",
                type: "display",
                placeholder: "ORDER_GRID_1_REFUNDPOINT",
                colSpan: 12,
            },
            {
                name: "SHIPPINGFEE",
                label: "ORDER_GRID_1_SHIPPINGFEE",
                type: "display",
                placeholder: "ORDER_GRID_1_SHIPPINGFEE",
                colSpan: 12,
            },
            {
                name: "EXTRAFEE",
                label: "ORDER_GRID_1_EXTRAFEE",
                type: "display",
                placeholder: "ORDER_GRID_1_EXTRAFEE",
                colSpan: 12,
            },
            {
                name: "DELIVERYDATE",
                label: "ORDER_GRID_1_DELIVERYDATE",
                type: "display",
                placeholder: "ORDER_GRID_1_DELIVERYDATE",
                colSpan: 12,
            },
            {
                name: "RECVNAME",
                label: "ORDER_GRID_1_RECVNAME",
                type: "display",
                placeholder: "ORDER_GRID_1_RECVNAME",
                colSpan: 12,
            },
            {
                name: "RECVTEL1",
                label: "ORDER_GRID_1_RECVTEL1",
                type: "display",
                placeholder: "ORDER_GRID_1_RECVTEL1",
                colSpan: 12,
            },
            {
                name: "RECVTEL2",
                label: "ORDER_GRID_1_RECVTEL2",
                type: "display",
                placeholder: "ORDER_GRID_1_RECVTEL2",
                colSpan: 12,
            },
            {
                name: "RECVZIP",
                label: "ORDER_GRID_1_RECVZIP",
                type: "button",
                placeholder: "ORDER_GRID_1_RECVZIP",
                colSpan: 12,
                onClick: handleSearchAddress,
            },
            {
                name: "RECVADDR",
                label: "ORDER_GRID_1_RECVADDR",
                type: "button",
                placeholder: "ORDER_GRID_1_RECVADDR",
                colSpan: 12,
                onClick: handleSearchAddress,
            },
            {
                name: "CRTDATE",
                label: "ORDER_GRID_1_CRTDATE",
                type: "display",
                placeholder: "ORDER_GRID_1_CRTDATE",
                colSpan: 12,
            },
            {
                name: "REQSHIPNAME",
                label: "ORDER_GRID_1_REQSHIPNAME",
                type: "display",
                placeholder: "ORDER_GRID_1_REQSHIPNAME",
                colSpan: 12,
            },
            {
                name: "REQSHIPINFO",
                label: "ORDER_GRID_1_REQSHIPINFO",
                type: "display",
                placeholder: "ORDER_GRID_1_REQSHIPINFO",
                colSpan: 12,
            },
        ],
        [orderStateList, orderState, trackingCompanySource, handleSearchAddress]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Order",
    });

    const columns: any = [
        {
            title: "",
            dataIndex: "THUMURL",
            key: "THUMURL",
            render: (text: string) => (
                <Image
                    width={60}
                    src={text}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                />
            ),
        },
        {
            title: t("ORDER_GRID_2_COMNAME"),
            dataIndex: "COMNAME",
            key: "COMNAME",
        },
        {
            title: t("ORDER_GRID_2_PLACENAME"),
            dataIndex: "PLACENAME",
            key: "PLACENAME",
        },
        {
            title: t("ORDER_GRID_2_NAME"),
            dataIndex: "NAME",
            key: "NAME",
            render: (text: string) => (
                <p
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                    }}
                >
                    {translateContent(text)}
                </p>
            ),
        },
        {
            title: t("ORDER_GRID_2_DANGA"),
            dataIndex: "DANGA",
            key: "DANGA",
        },
        {
            title: t("ORDER_GRID_2_SELLPRICE"),
            dataIndex: "SELLPRICE",
            key: "SELLPRICE",
        },
        {
            title: t("ORDER_GRID_2_QTY"),
            dataIndex: "QTY",
            key: "QTY",
        },
        {
            title: t("ORDER_GRID_2_TOTSELLPRICE"),
            dataIndex: "TOTSELLPRICE",
            key: "TOTSELLPRICE",
        },
        {
            title: t("ORDER_GRID_2_OPTIONNAME"),
            dataIndex: "OPTIONNAME",
            key: "OPTIONNAME",
        },
        {
            title: t("ORDER_GRID_2_GTYPE_NM"),
            dataIndex: "GTYPE_NM",
            key: "GTYPE_NM",
        },
        {
            title: t("ORDER_GRID_2_GINFO"),
            dataIndex: "GINFO",
            key: "GINFO",
            render: (text: string) => (
                <p
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                    }}
                >
                    {translateContent(text)}
                </p>
            ),
        },
    ];

    return (
        <>
            <Drawer
                closable
                destroyOnClose
                title={dialogTitle}
                placement="right"
                open={open}
                loading={isLoading}
                onClose={handleClose}
                width="60%"
                style={{ zIndex: 999 }}
                footer={
                    !readonly && (
                        <Space
                            style={{
                                width: "100%",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button onClick={handleClose}>
                                {tCommon("CM_CANCEL")}
                            </Button>

                            <Button
                                type="primary"
                                onClick={handleSave}
                                loading={isLoading}
                            >
                                {tCommon("CM_SAVE")}
                            </Button>
                        </Space>
                    )
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    onValuesChange={onValuesChange}
                    disabled={readonly}
                >
                    <Row gutter={[16, 0]}>
                        {fields.map((field, index) => (
                            <Col span={field.colSpan} key={index}>
                                {render(field)}
                            </Col>
                        ))}
                    </Row>
                </Form>

                <Flex
                    align="center"
                    gap="middle"
                    justify="space-between"
                    style={{ marginTop: 16, fontWeight: 600 }}
                >
                    {`${t("ORDER_GRID_2_TITLE")} - ${
                        orderGoodsSource.length
                    } ${tCommon("CM_CASE")} /
				${orderGoodsSource.reduce(
                    (acc, item) =>
                        item.ORDERGOODSID > 0
                            ? acc + item?.TOTSELLPRICE
                            : acc + item?.PAYPRICE,
                    0
                )} ${tCommon("CM_WON")}`}
                </Flex>

                <Table
                    dataSource={orderGoodsSource}
                    columns={columns}
                    pagination={false}
                    bordered
                    style={{ marginTop: 16 }}
                    scroll={{ x: "max-content" }}
                />
            </Drawer>

            <DaumPostcodeModal />
        </>
    );
};
