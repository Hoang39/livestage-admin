import { Card, DatePicker, Flex, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import timeService from "@/libs/timeService";
import { StatisticsService } from "@/app/services/statistic";
import { TicketRevenueChart } from "@/interfaces/statistic";
import dayjs from "dayjs";
import ExportExcel from "@/components/file/exportExcel";
import SalesBarChart from "./BarChart";
import { ArtistDialog, useArtistDialog } from "./ArtistDialog";
import { getShopId } from "@/utils/getShopId";
import { useAppStore } from "@/hooks/useAppStore";

export const ArtistStatistic = () => {
    const { t } = useTranslation("Statistics");
    const { t: tAuth } = useTranslation("AuthUser");
    const { t: tMembership } = useTranslation("Membership");
    const { t: tReport } = useTranslation("Report");
    const { t: tNoti } = useTranslation("Notification");
    const { t: tBroadcast } = useTranslation("Broadcast");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<any>([]);
    const [dataChart, setDataChart] = useState<TicketRevenueChart[]>([]);

    const [date, setDate] = useState(dayjs());

    const { currentCompany, currentPlace, companyList } = useAppStore(
        (state) => state
    );

    const { openDialog } = useArtistDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await StatisticsService.fetchTicketRevenueList({
                SHOP_ID: getShopId(
                    currentCompany?.COMID ?? 0,
                    currentPlace?.PLACEID ?? 0
                ),
                USER_PID: "",
                FROM_DATE: date.startOf("month").format("YYYY-MM-DD"),
                TO_DATE: date.endOf("month").format("YYYY-MM-DD"),
                PAGE_NUM: "1",
                PAGE_SIZE: "500",
            });

            const list = getDataFromPayloadRestful(payload).reduce(
                (acc: any[], curr: any) => {
                    if (curr.SHOP_ID.startsWith("S")) {
                        curr.VAT = curr.VAT + curr.PIT + curr.REV_SHARE;
                        curr.VAT += " %";

                        const shopInfo = companyList.find(
                            (item) => item.COMID == currentCompany?.COMID
                        );

                        if (shopInfo) {
                            curr.BANKACCOUNT = shopInfo.BANKINFO;
                        }

                        acc.push({ ...curr });
                    }
                    return acc;
                },
                []
            );
            setDataList(list);

            const response = await StatisticsService.fetchTicketRevenueChart({
                USER_PID: list?.[0].USER_PID,
                YEAR: date.format("YYYY"),
            });

            setDataChart(getDataFromPayloadRestful(response));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [companyList, currentCompany, currentPlace, date]);

    useEffect(() => {
        fetchDataList();
    }, [fetchDataList]);

    const columns: any = [
        {
            title: tBroadcast("BROADCAST_GRID_1_SHOP_ID"),
            dataIndex: "SHOP_ID",
            key: "SHOP_ID",
        },
        {
            title: tReport("RP_USER_ID"),
            dataIndex: "USER_PID",
            key: "USER_PID",
        },
        {
            title: tAuth("AUTH_USER_GRID_USERNAME"),
            dataIndex: "ALIAS",
            key: "ALIAS",
        },
        {
            title: tMembership("MEM_RQ_BANKACCOUNT"),
            dataIndex: "BANKACCOUNT",
            key: "BANKACCOUNT",
        },
        {
            title: t("STATISTICS_GROSS_SALES_AMOUNT"),
            dataIndex: "GROSS_AMOUNT",
            key: "GROSS_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_DIS_AMOUNT"),
            dataIndex: "DIS_AMOUNT",
            key: "DIS_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_NET_SALES_AMOUNT"),
            dataIndex: "PAY_AMOUNT",
            key: "PAY_AMOUNT",
            align: "center",
        },
        {
            title: t("VAT"),
            dataIndex: "VAT",
            key: "VAT",
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
            dataIndex: "BEGIN_AMOUNT",
            key: "BEGIN_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_AMOUNT_RECEIVED"),
            dataIndex: "REV_AMOUNT",
            key: "REV_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_TOTAL_PAID"),
            dataIndex: "DEPOSIT_AMOUNT",
            key: "DEPOSIT_AMOUNT",
            align: "center",
        },
        {
            title: t("STATISTICS_DATE_PAYMENT"),
            dataIndex: "DEPOSIT_DATE",
            key: "DEPOSIT_DATE",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
        {
            title: t("STATISTICS_TRANSFER_DATE"),
            dataIndex: "REV_DATE",
            key: "REV_DATE",
            align: "center",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date, "YYYY-MM-DD"),
        },
    ];

    return (
        <>
            <Card
                title={tNoti("NOTI_SCH_LIPSTAR")}
                extra={
                    <Flex gap="middle">
                        <DatePicker
                            picker="month"
                            onChange={(value) => setDate(value)}
                        />

                        <ExportExcel
                            data={dataList}
                            fileName="lipstar-ticket-statistic"
                        />
                    </Flex>
                }
                style={{ maxHeight: "50vh", overflowY: "auto" }}
            >
                <Table
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog(record),
                    })}
                />
            </Card>

            <Card
                title={t("STATISTICS_REVENUE_CHART")}
                style={{ height: "max-content", marginTop: "20px" }}
            >
                <SalesBarChart
                    data={dataChart}
                    yLabel={["PAY_AMOUNT", "NET_AMOUNT"]}
                    yTitle={[
                        t("STATISTICS_NET_SALES_AMOUNT"),
                        t("STATISTICS_NET_PROFIT_AMOUNT"),
                    ]}
                />
            </Card>

            <ArtistDialog />
        </>
    );
};
