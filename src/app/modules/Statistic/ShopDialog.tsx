import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Space, Table } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import timeService from "@/libs/timeService";
import { RevenueCompany } from "@/interfaces/statistic";
import { OrderService } from "@/app/services/order";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { Order } from "@/interfaces/order";
import dayjs from "dayjs";

export const useShopDialog = dialogStore<RevenueCompany>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

export const ShopDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Order");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useShopDialog();
    const [dataList, setDataList] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                if (item) {
                    const response = await OrderService.fetchOrder({
                        COMID: item.COMID,
                        PLACEID: item.PLACEID,
                        ORDERID: "",
                        MEMID: "",
                        GOODSID: "",
                        START_ORDERDATE: dayjs(item.FROM_DATE).format(
                            "YYYY-MM-DD"
                        ),
                        END_ORDERDATE: dayjs(item.TO_DATE).format("YYYY-MM-DD"),
                        ORDERSTATE: "",
                    });

                    setDataList(getDataFromPayloadRestful(response));
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
    }, [item, openNotification]);

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

    const columns: any = [
        {
            title: t("ORDER_GRID_1_PLACEORDERID"),
            dataIndex: "PLACEORDERID",
            key: "PLACEORDERID",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_ORDERID"),
            dataIndex: "ORDERID",
            key: "ORDERID",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_ORDERDATE"),
            dataIndex: "ORDERDATE",
            key: "ORDERDATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("ORDER_GRID_1_MEMNAME"),
            dataIndex: "MEMNAME",
            key: "MEMNAME",
        },
        {
            title: t("ORDER_GRID_1_TOTORDERPRICE"),
            dataIndex: "TOTORDERPRICE",
            key: "TOTORDERPRICE",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_DISPRICE"),
            dataIndex: "DISPRICE",
            key: "DISPRICE",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_PAYPRICE"),
            dataIndex: "PAYPRICE",
            key: "PAYPRICE",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_ORDERSTATE"),
            dataIndex: "ORDERSTATE",
            key: "ORDERSTATE",
            align: "center",
            render: (text: string) => t(`ORDER_STATE_${text}`),
        },
        {
            title: t("ORDER_GRID_1_PAYTYPENAME"),
            dataIndex: "PAYTYPENAME",
            key: "PAYTYPENAME",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_SCOMID"),
            dataIndex: "SCOMID",
            key: "SCOMID",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_SCOMNAME"),
            dataIndex: "SCOMNAME",
            key: "SCOMNAME",
        },
        {
            title: t("ORDER_GRID_1_INVOICENO"),
            dataIndex: "INVOICENO",
            key: "INVOICENO",
        },
        {
            title: t("ORDER_GRID_1_REFUNDPRICE"),
            dataIndex: "REFUNDPRICE",
            key: "REFUNDPRICE",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_ACTIONDETAIL"),
            dataIndex: "ACTIONDETAIL",
            key: "ACTIONDETAIL",
            align: "center",
            render: (text: string) => (text ? translateContent(text) : text),
        },
        {
            title: t("ORDER_GRID_1_ACTIONDATE"),
            dataIndex: "ACTIONDATE",
            key: "ACTIONDATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("ORDER_GRID_1_REFUNDPOINT"),
            dataIndex: "REFUNDPOINT",
            key: "REFUNDPOINT",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_SHIPPINGFEE"),
            dataIndex: "SHIPPINGFEE",
            key: "SHIPPINGFEE",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_EXTRAFEE"),
            dataIndex: "EXTRAFEE",
            key: "EXTRAFEE",
            align: "center",
        },
        {
            title: t("ORDER_GRID_1_DELIVERYDATE"),
            dataIndex: "DELIVERYDATE",
            key: "DELIVERYDATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("ORDER_GRID_1_RECVNAME"),
            dataIndex: "RECVNAME",
            key: "RECVNAME",
        },
        {
            title: t("ORDER_GRID_1_RECVTEL1"),
            dataIndex: "RECVTEL1",
            key: "RECVTEL1",
        },
        {
            title: t("ORDER_GRID_1_RECVTEL2"),
            dataIndex: "RECVTEL2",
            key: "RECVTEL2",
        },
        {
            title: t("ORDER_GRID_1_RECVZIP"),
            dataIndex: "RECVZIP",
            key: "RECVZIP",
        },
        {
            title: t("ORDER_GRID_1_RECVADDR"),
            dataIndex: "RECVADDR",
            key: "RECVADDR",
        },
        {
            title: t("ORDER_GRID_1_RECVADDR2"),
            dataIndex: "RECVADDR2",
            key: "RECVADDR2",
        },
        {
            title: t("ORDER_GRID_1_CRTDATE"),
            dataIndex: "CRTDATE",
            key: "CRTDATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("ORDER_GRID_1_REQSHIPNAME"),
            dataIndex: "REQSHIPNAME",
            key: "REQSHIPNAME",
        },
        {
            title: t("ORDER_GRID_1_REQSHIPINFO"),
            dataIndex: "REQSHIPINFO",
            key: "REQSHIPINFO",
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
                        </Space>
                    )
                }
            >
                <Table
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList}
                    columns={columns}
                />
            </Drawer>
        </>
    );
};
