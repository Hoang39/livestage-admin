import { useCallback } from "react";

import { Order as IOrder } from "@/interfaces/order";
import { Card, DatePicker, Flex, Input, Table } from "antd";
import { useEffect, useState } from "react";
import { useAppStore } from "@/hooks/useAppStore";
import { useTranslation } from "react-i18next";
import { OrderService } from "@/app/services/order";
import timeService from "@/libs/timeService";
import dayjs from "dayjs";
import { OrderDialog, useOrderDialog } from "./OrderDialog";
import ExportExcel from "@/components/file/exportExcel";
import { translateContent } from "@/utils/handleResponse";

const { Search } = Input;
const { RangePicker } = DatePicker;

export const Order = () => {
    const { t } = useTranslation("Order");
    const { t: tPage } = useTranslation("Route");

    const { currentCompany, currentPlace } = useAppStore((state) => state);

    const [dataSource, setDataSource] = useState<IOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [dates, setDates] = useState<string[]>(() => {
        const today = new Date();
        return [
            new Date(today.getFullYear(), today.getMonth(), 1)
                .toISOString()
                .split("T")[0],
            today.toISOString().split("T")[0],
        ];
    });

    const handleChange = (_dates: any, dateStrings: string[]) => {
        setDates(dateStrings);
    };

    const { openDialog } = useOrderDialog();

    const fetchData = useCallback(async () => {
        if (
            currentCompany?.COMID == undefined ||
            currentPlace?.PLACEID == undefined
        ) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await OrderService.fetchOrder({
                COMID: currentCompany?.COMID || 0,
                PLACEID: currentPlace?.PLACEID || 0,
                ORDERID: "",
                MEMID: "",
                GOODSID: "",
                START_ORDERDATE: dates?.[0] ?? "",
                END_ORDERDATE: dates?.[1] ?? "",
                ORDERSTATE: "",
            });

            setDataSource(response?.RESULT_DATA);
        } catch (error) {
            console.log("🚀 ~ fetchData ~ error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentCompany, currentPlace, dates]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
        <Card
            title={tPage("Order")}
            extra={
                <Flex gap="middle">
                    <Search
                        placeholder={t("ORDER_GRID_1_SEARCH")}
                        allowClear
                        onSearch={(value) => {
                            setSearchTerm(value);
                        }}
                        style={{ width: 200 }}
                    />

                    <RangePicker
                        defaultValue={[dayjs(dates[0]), dayjs(dates[1])]}
                        onChange={handleChange}
                        format="YYYY-MM-DD"
                    />

                    <ExportExcel data={dataSource} fileName="order" />
                </Flex>
            }
        >
            <Table
                rowKey={"ORDERID"}
                scroll={{ x: "max-content" }}
                loading={isLoading}
                dataSource={dataSource?.filter((item) =>
                    item.MEMNAME.toLowerCase().includes(
                        searchTerm.toLowerCase()
                    )
                )}
                columns={columns}
                onRow={(record) => ({
                    onClick: () => openDialog(record),
                })}
            />
            <OrderDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchData();
                    }
                }}
            />
        </Card>
    );
};
