import { Card, DatePicker, Flex, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import timeService from "@/libs/timeService";
import { StatisticsService } from "@/app/services/statistic";
import { useAppStore } from "@/hooks/useAppStore";
import { RevenueCompany, RevenueShop } from "@/interfaces/statistic";
import dayjs from "dayjs";
import ExportExcel from "@/components/file/exportExcel";
import SalesBarChart from "./BarChart";
import { ShopDialog, useShopDialog } from "./ShopDialog";

const { Search } = Input;

export const ShopStatistic = () => {
    const { t } = useTranslation("Statistics");
    const { t: tCommon } = useTranslation("Common");
    const { t: tGoods } = useTranslation("Goods");
    const { t: tCompany } = useTranslation("Company");
    const { t: tMembership } = useTranslation("Membership");
    const { t: tBroadcast } = useTranslation("Broadcast");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<RevenueCompany[]>([]);
    const [dataChart, setDataChart] = useState<RevenueShop[]>([]);
    const [childrenData, setChildrenData] = useState<{
        [key: number]: RevenueShop[];
    }>({});
    const [isChildLoading, setIsChildLoading] = useState<{
        [key: number]: boolean;
    }>({});

    const [searchTerm, setSearchTerm] = useState("");
    const [date, setDate] = useState(dayjs());

    const { currentCompany } = useAppStore((state) => state);

    const { openDialog } = useShopDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await StatisticsService.fetchRevenueCompany({
                COMID: currentCompany?.COMID || 0,
                FROM_DATE: date.startOf("month").format("YYYY-MM-DD"),
                TO_DATE: date.endOf("month").format("YYYY-MM-DD"),
            });

            const list = getDataFromPayloadRestful(payload);
            setDataList(list);

            const response = await StatisticsService.fetchRevenueShop({
                COMID: list[0].COMID,
                PLACEID: list[0].PLACEID,
                PAY_STATUS: "",
                FROM_DATE: date.startOf("year").format("YYYY-MM-DD"),
                TO_DATE: date.endOf("year").format("YYYY-MM-DD"),
            });

            setDataChart(getDataFromPayloadRestful(response));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [currentCompany, date]);

    useEffect(() => {
        fetchDataList();
    }, [fetchDataList]);

    const columns: any = [
        {
            title: tGoods("GOODS_SHOPID"),
            dataIndex: "SHOP_ID",
            key: "SHOP_ID",
            align: "center",
        },
        {
            title: tCompany("COM_GRID_1_COMNAME"),
            dataIndex: "COM_NAME",
            key: "COM_NAME",
        },
        {
            title: tCompany("COM_GRID_2_PLACENAME"),
            dataIndex: "PLACE_NAME",
            key: "PLACE_NAME",
        },
        {
            title: tMembership("MEM_RQ_BANKACCOUNT"),
            dataIndex: "BANK_INFO",
            key: "BANK_INFO",
        },
        {
            title: t("STATISTICS_ORDERS_COUNT"),
            dataIndex: "COUNT_ORDERS",
            key: "COUNT_ORDERS",
            align: "center",
        },
        {
            title: t("STATISTICS_GROSS_SALES_AMOUNT"),
            dataIndex: "GROSS_AMOUNT",
            key: "GROSS_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_NET_SALES_AMOUNT"),
            dataIndex: "NET_SALES_AMOUNT",
            key: "NET_SALES_AMOUNT",
            align: "center",
        },
        {
            title: t("VAT"),
            dataIndex: "VAT",
            key: "VAT",
            align: "center",
        },
        {
            title: tCompany("COM_GRID_1_REVSHARE"),
            dataIndex: "REV_SHARE",
            key: "REV_SHARE",
            align: "center",
        },
        {
            title: t("STATISTICS_NET_PROFIT_AMOUNT"),
            dataIndex: "NET_AMOUNT",
            key: "NET_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_LAST_BALANCE"),
            dataIndex: "BE_AMOUNT",
            key: "BE_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_TOTAL_RECEIVED"),
            dataIndex: "TOTAL_AMOUNT",
            key: "TOTAL_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_TOTAL_PAID"),
            dataIndex: "PAY_AMOUNT",
            key: "PAY_AMOUNT",
            align: "center",
        },
        {
            title: tBroadcast("BROADCAST_GRID_1_STATE"),
            dataIndex: "PAY_STATUS",
            key: "PAY_STATUS",
            align: "center",
            render: (key: string) =>
                key == "S"
                    ? t("STATISTICS_PAYSTATUS_S")
                    : key == "W"
                    ? t("STATISTICS_PAYSTATUS_W")
                    : key == "I"
                    ? t("STATISTICS_PAYSTATUS_I")
                    : "",
        },
        {
            title: t("STATISTICS_PAYMENT_DATE"),
            dataIndex: "PAY_DATE",
            key: "PAY_DATE",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
        {
            title: t("STATISTICS_TRANSFER_DATE"),
            dataIndex: "STATEMENT_DATE",
            key: "STATEMENT_DATE",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
        {
            title: t("STATISTICS_NET_PROFIT_AMOUNT"),
            dataIndex: "NET_AMOUNT",
            key: "NET_AMOUNT",
            align: "center",
        },
    ];

    const childColumns: any = [
        {
            title: tCommon("CM_MONTH"),
            dataIndex: "FROM_DATE",
            key: "FROM_DATE",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
        {
            title: t("STATISTICS_TRANSFER_DATE"),
            dataIndex: "STATEMENT_DATE",
            key: "STATEMENT_DATE",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
        {
            title: t("STATISTICS_GROSS_SALES_AMOUNT"),
            dataIndex: "GROSS_AMOUNT",
            key: "GROSS_AMOUNT",
            align: "center",
        },
        {
            title: t("VAT"),
            dataIndex: "VAT",
            key: "VAT",
            align: "center",
        },
        {
            title: tCompany("COM_GRID_1_REVSHARE"),
            dataIndex: "REV_SHARE",
            key: "REV_SHARE",
            align: "center",
        },
        {
            title: t("STATISTICS_NET_SALES_AMOUNT"),
            dataIndex: "NET_SALES_AMOUNT",
            key: "NET_SALES_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_LAST_BALANCE"),
            dataIndex: "BE_AMOUNT",
            key: "BE_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_TOTAL_RECEIVED"),
            dataIndex: "TOTAL_AMOUNT",
            key: "TOTAL_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_TOTAL_PAID"),
            dataIndex: "PAY_AMOUNT",
            key: "PAY_AMOUNT",
            align: "center",
        },
        {
            title: tBroadcast("BROADCAST_GRID_1_STATE"),
            dataIndex: "PAY_STATUS",
            key: "PAY_STATUS",
            align: "center",
            render: (key: string) =>
                key == "S"
                    ? t("STATISTICS_PAYSTATUS_S")
                    : key == "W"
                    ? t("STATISTICS_PAYSTATUS_W")
                    : key == "I"
                    ? t("STATISTICS_PAYSTATUS_I")
                    : "",
        },
        {
            title: t("STATISTICS_PAYMENT_DATE"),
            dataIndex: "PAY_DATE",
            key: "PAY_DATE",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
    ];

    const fetchShop = useCallback(
        async (record: RevenueCompany) => {
            setIsChildLoading((prev) => ({ ...prev, [record.ID]: true }));
            try {
                const response = await StatisticsService.fetchRevenueShop({
                    COMID: record.COMID,
                    PLACEID: record.PLACEID,
                    PAY_STATUS: "",
                    FROM_DATE: date.startOf("year").format("YYYY-MM-DD"),
                    TO_DATE: date.endOf("year").format("YYYY-MM-DD"),
                });
                const data: RevenueShop[] =
                    getDataFromPayloadRestful(response) || [];

                setDataChart(getDataFromPayloadRestful(response));

                setChildrenData((prev) => ({
                    ...prev,
                    [record.ID]: data,
                }));
            } catch (error) {
                console.log("Error fetchShop: ", error);
            } finally {
                setIsChildLoading((prev) => ({ ...prev, [record.ID]: false }));
            }
        },
        [date]
    );

    const handleExpand = useCallback(
        async (expanded: boolean, record: RevenueCompany) => {
            if (
                expanded &&
                (!childrenData[record.ID] ||
                    childrenData[record.ID].length === 0)
            ) {
                await fetchShop(record);
            }
        },
        [childrenData, fetchShop]
    );

    return (
        <>
            <Card
                title={t("STATISTICS_SHOP_LIST_TITLE")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("STATISTICS_MEM_SEARCH_TITLE")}
                            allowClear
                            onSearch={(value) => {
                                setSearchTerm(value);
                            }}
                            style={{ width: 200 }}
                        />

                        <DatePicker
                            picker="month"
                            onChange={(value) => setDate(value)}
                        />

                        <ExportExcel
                            data={dataList}
                            fileName="shop-statistic"
                        />
                    </Flex>
                }
                style={{ maxHeight: "50vh", overflowY: "auto" }}
            >
                <Table
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList.filter((item) =>
                        item.COM_NAME.toLowerCase().includes(
                            searchTerm.toLowerCase()
                        )
                    )}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog(record),
                    })}
                    expandable={{
                        expandedRowRender: (record) => (
                            <Table
                                rowKey="ID"
                                loading={isChildLoading[record.ID] || false}
                                columns={childColumns}
                                dataSource={childrenData[record.ID] || []}
                                pagination={false}
                            />
                        ),
                        onExpand: handleExpand,
                    }}
                />
            </Card>

            <Card
                title={t("STATISTICS_REVENUE_CHART")}
                style={{ height: "max-content", marginTop: "20px" }}
            >
                <SalesBarChart
                    data={dataChart}
                    yLabel={["NET_SALES_AMOUNT", "NET_AMOUNT"]}
                    yTitle={[
                        t("STATISTICS_NET_SALES_AMOUNT"),
                        t("STATISTICS_NET_PROFIT_AMOUNT"),
                    ]}
                />
            </Card>

            <ShopDialog />
        </>
    );
};
