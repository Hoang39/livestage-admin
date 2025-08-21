import { useCallback } from "react";

import type { GoodLog } from "@/interfaces/goods";
import { Card, DatePicker, Flex, Image, Input, Table } from "antd";
import { useEffect, useState } from "react";
import { useAppStore } from "@/hooks/useAppStore";
import { useTranslation } from "react-i18next";
import { translateContent } from "@/utils/handleResponse";
import { GoodService } from "@/app/services/good";
import timeService from "@/libs/timeService";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Search } = Input;

export const GoodsLog = () => {
    const { t } = useTranslation("GoodsLog");
    const { t: tGoods } = useTranslation("Goods");
    const { t: tCommon } = useTranslation("Common");
    const { t: tPage } = useTranslation("Route");

    const { currentCompany, currentPlace } = useAppStore((state) => state);

    const [dataSource, setDataSource] = useState<GoodLog[]>([]);
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

    const fetchData = useCallback(async () => {
        if (
            currentCompany?.COMID == undefined ||
            currentPlace?.PLACEID == undefined
        ) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await GoodService.fetchGoodsInfoLog({
                COMID: currentCompany?.COMID || 0,
                PLACEID: currentPlace?.PLACEID || 0,
                STARTDATE: dates?.[0] ?? "",
                ENDDATE: dates?.[1] ?? "",
            });

            setDataSource(response?.RESULT_DATA);
        } catch (error) {
            console.log("🚀 ~ fetGoodsList ~ error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentCompany, currentPlace, dates]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: any = [
        {
            title: tGoods("GOODS_IMAGES"),
            dataIndex: "THUMURL",
            key: "THUMURL",
            render: (text: string) => (
                <Image
                    onClick={(e) => e.stopPropagation()}
                    // preview={false}
                    width={60}
                    src={text}
                    fallback="data:image/png;base64,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"
                />
            ),
        },
        {
            title: t("GOODS_LOG_NAME"),
            dataIndex: "NAME",
            key: "NAME",
            width: 200,
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
            title: t("GOODS_LOG_DANGA"),
            dataIndex: "DANGA",
            key: "DANGA",
            align: "center",
        },
        {
            title: t("GOODS_LOG_SELLPRICE"),
            dataIndex: "SELLPRICE",
            key: "SELLPRICE",
            align: "center",
        },
        {
            title: t("GOODS_LOG_GTYPE"),
            dataIndex: "GTYPE",
            key: "GTYPE",
            align: "center",
            render: (text: string) =>
                text == "S"
                    ? tGoods("GOODS_GTYPE_O_S")
                    : tGoods("GOODS_GTYPE_O_E"),
        },
        {
            title: t("GOODS_LOG_SELLFLAG"),
            dataIndex: "SELLFLAG",
            key: "SELLFLAG",
            align: "center",
            render: (text: string) =>
                text == "Y"
                    ? tGoods("GOODS_SELLFLAG_O_Y")
                    : tGoods("GOODS_SELLFLAG_O_N"),
        },
        {
            title: tCommon("CM_USEYN"),
            dataIndex: "USEYN",
            key: "USEYN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: t("GOODS_LOG_GINFO"),
            dataIndex: "GINFO",
            key: "GINFO",
            maxWidth: 400,
            render: (text: string) => (
                <p
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 400,
                    }}
                >
                    {translateContent(text)}
                </p>
            ),
        },
        {
            title: t("GOODS_LOG_SIZE"),
            dataIndex: "SIZE",
            key: "SIZE",
        },
        {
            title: t("GOODS_LOG_SIZEPERPRICE"),
            dataIndex: "SIZEPERPRICE",
            key: "SIZEPERPRICE",
        },
        {
            title: t("GOODS_LOG_GSHORTINFO"),
            dataIndex: "GSHORTINFO",
            key: "GSHORTINFO",
        },
        {
            title: t("GOODS_LOG_COUNTRY"),
            dataIndex: "COUNTRY",
            key: "COUNTRY",
        },
        {
            title: t("GOODS_LOG_GSHOWSTART"),
            dataIndex: "GSHOWSTART",
            key: "GSHOWSTART",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date)?.split(" ")[0],
        },
        {
            title: t("GOODS_LOG_GSHOWEND"),
            dataIndex: "GSHOWEND",
            key: "GSHOWEND",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date)?.split(" ")[0],
        },
        {
            title: t("GOODS_LOG_LOGDATE"),
            dataIndex: "LOGDATE",
            key: "LOGDATE",
            render: (date: string) =>
                timeService.getStrDateParseFromUTC(date)?.split(" ")[0],
        },
        {
            title: t("GOODS_LOG_BARCODE"),
            dataIndex: "BARCODE",
            key: "BARCODE",
        },
        {
            title: t("GOODS_LOG_QRCODE"),
            dataIndex: "QRCODE",
            key: "QRCODE",
        },
        {
            title: t("GOODS_LOG_USERID"),
            dataIndex: "USERID",
            key: "USERID",
        },
    ];

    return (
        <Card
            title={tPage("GoodsInfoLog")}
            extra={
                <Flex gap="middle">
                    <Search
                        placeholder={t("GOODS_LOG_NAME")}
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
                </Flex>
            }
        >
            <Table
                scroll={{ x: "max-content" }}
                loading={isLoading}
                dataSource={dataSource?.filter((item) =>
                    item.NAME.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                columns={columns}
            />
        </Card>
    );
};
