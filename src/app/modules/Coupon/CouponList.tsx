import { Card, Flex, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import timeService from "@/libs/timeService";
import { CouponStatistics } from "@/interfaces/coupon";
import { CouponService } from "@/app/services/coupon";

const { Search } = Input;

export const CouponList = () => {
    const { t } = useTranslation("Coupon");
    const { t: tCommon } = useTranslation("Common");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<CouponStatistics[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await CouponService.fetchCouponStatistics({
                COM_ID: "",
                PLACE_ID: "",
                CODE: "",
                NAME: "",
                TYPE: "",
                PAYMENT_TYPE: "",
                ACTIVE_YN: "",
                PAGE: 1,
                LIMIT: 1000,
            });
            setDataList(getDataFromPayloadRestful(payload));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDataList();
    }, [fetchDataList]);

    const columns: any = [
        {
            title: t("COUPON_GRID_CODE"),
            dataIndex: "CP_CODE",
            key: "CP_CODE",
        },
        {
            title: t("COUPON_GRID_NAME"),
            dataIndex: "NAME",
            key: "NAME",
        },
        {
            title: t("COUPON_GRID_DESCRIPTION"),
            dataIndex: "DESCRIPTION",
            key: "DESCRIPTION",
        },
        {
            title: t("COUPON_GRID_STATUS"),
            dataIndex: "STATUS",
            key: "STATUS",
            render: (text: string) =>
                text == "UPCOMING"
                    ? t("COUPON_GRID_STATUS_0")
                    : text == "FINISHED"
                    ? t("COUPON_GRID_STATUS_1")
                    : text == "ONGOING"
                    ? t("COUPON_GRID_STATUS_2")
                    : "",
        },
        {
            title: t("COUPON_GRID_VALUE") + " (%)",
            dataIndex: "VALUE",
            key: "VALUE",
            align: "center",
        },
        {
            title: t("COUPON_GRID_MAX_VALUE") + " (won)",
            dataIndex: "MAX_VALUE",
            key: "MAX_VALUE",
            align: "center",
        },
        {
            title: t("COUPON_GRID_MIN_VALUE"),
            dataIndex: "MIN_VALUE",
            key: "MIN_VALUE",
            align: "center",
        },
        {
            title: t("COUPON_GRID_TOTAL_QUALITY"),
            dataIndex: "QUALITY",
            key: "QUALITY",
            align: "center",
        },
        {
            title: t("COUPON_GRID_TOTAL_USED"),
            dataIndex: "TOTAL_USED",
            key: "TOTAL_USED",
            align: "center",
        },
        {
            title: t("COUPON_GRID_TOTAL_CLAIMED"),
            dataIndex: "TOTAL_CLAIMED",
            key: "TOTAL_CLAIMED",
            align: "center",
        },
        {
            title: t("COUPON_GRID_TOTAL_ACTIVE"),
            dataIndex: "TOTAL_ACTIVE",
            key: "TOTAL_ACTIVE",
            align: "center",
        },
        {
            title: t("COUPON_GRID_TOTAL_EXPIRED"),
            dataIndex: "TOTAL_EXPIRED",
            key: "TOTAL_EXPIRED",
            align: "center",
        },
        {
            title: t("COUPON_GRID_TOTAL_DISCOUNT_AMOUNT"),
            dataIndex: "TOTAL_DISCOUNT_AMOUNT",
            key: "TOTAL_DISCOUNT_AMOUNT",
            align: "center",
        },
        {
            title: t("COUPON_GRID_USAGE_RATE_PERCENT"),
            dataIndex: "USAGE_RATE_PERCENT",
            key: "USAGE_RATE_PERCENT",
            align: "center",
        },
        {
            title: t("COUPON_GRID_LAST_COLLECTED_DATE"),
            dataIndex: "LAST_COLLECTED_DATE",
            key: "LAST_COLLECTED_DATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("COUPON_GRID_PAYMENT_TYPE"),
            dataIndex: "PAYMENT_TYPE",
            key: "PAYMENT_TYPE",
            align: "center",
            render: () => tCommon("CM_ENTIRE"),
        },
        {
            title: tCommon("CM_ACTIVE"),
            dataIndex: "ACTIVE_YN",
            key: "ACTIVE_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: t("COUPON_GRID_START_DATE"),
            dataIndex: "START_DATE",
            key: "START_DATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("COUPON_GRID_END_DATE"),
            dataIndex: "END_DATE",
            key: "END_DATE",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("COUPON_GRID_CREATE_DATE"),
            dataIndex: "CREATE_TIME",
            key: "CREATE_TIME",
            align: "center",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
    ];

    return (
        <>
            <Card
                title={t("CREATE_COUPON_GRID_TITLE")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("CREATE_COUPON_SEARCH_PHL")}
                            allowClear
                            onSearch={(value) => {
                                setSearchTerm(value);
                            }}
                            style={{ width: 200 }}
                        />
                    </Flex>
                }
            >
                <Table
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList.filter((item: CouponStatistics) =>
                        item.NAME.toLowerCase().includes(
                            searchTerm.toLowerCase()
                        )
                    )}
                    columns={columns}
                />
            </Card>
        </>
    );
};
