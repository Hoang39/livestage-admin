import { Card, Flex, Input, Select, Table, Image } from "antd";
import { useCallback, useEffect, useState } from "react";
import { GoodsReport } from "@/interfaces/report";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { ReportService } from "@/app/services/report";
import { ReportGoodsDialog, useReportGoodsDialog } from "./ReportGoodsDialog";

const { Search } = Input;

export const ReportGoods = () => {
    const { t } = useTranslation("Report");
    const { t: tCommon } = useTranslation("Common");
    const { t: tGoods } = useTranslation("Goods");

    const [dataSource, setDataSource] = useState<GoodsReport[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState("R");

    const { openDialog } = useReportGoodsDialog();

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await ReportService.fetchGoodsReport({
                KEYWORD: "",
                STATUS: status,
                PAGE_NUM: 1,
                PAGE_SIZE: 1000,
            });
            setDataSource(getDataFromPayloadRestful(response));
        } catch (error) {
            console.log("Error getCompanyList: ", error);
        }

        setIsLoading(false);
    }, [status]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: any = [
        {
            title: "",
            dataIndex: "THUMURL",
            key: "THUMURL",
            render: (text: string) => (
                <Image
                    onClick={(e) => e.stopPropagation()}
                    width={60}
                    preview={false}
                    src={text}
                    fallback="data:image/png;base64,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"
                />
            ),
        },
        {
            title: tGoods("GOODS_NAME"),
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
            title: tGoods("GOODS_GINFO"),
            dataIndex: "GINFO",
            key: "GINFO",
            maxWidth: 300,
            render: (text: string) => (
                <p
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 300,
                    }}
                >
                    {translateContent(text)}
                </p>
            ),
        },
        {
            title: t("RP_STATUS"),
            dataIndex: "REPORT_STATUS",
            key: "REPORT_STATUS",
            align: "center",
            render: (text: string) =>
                text == "P"
                    ? t("RP_STATUS_COMPLAIN")
                    : text == "I"
                    ? t("RP_STATUS_BLOCKED")
                    : text == "R"
                    ? t("RP_STATUS_REPORTING")
                    : "",
        },
        {
            title: "MEM_ID",
            dataIndex: "LINK_USER",
            key: "LINK_USER",
        },
        {
            title: "GOOD_ID",
            dataIndex: "PID",
            key: "PID",
        },
    ];

    return (
        <Card
            title={t("RP_GOODS_TITLE")}
            extra={
                <Flex gap="middle">
                    <Search
                        placeholder={t("RP_PLH_ENTER_TITLE")}
                        allowClear
                        onSearch={(value) => {
                            setSearchTerm(value);
                        }}
                        style={{ width: 200 }}
                    />

                    <Select
                        style={{ width: 200 }}
                        value={status}
                        onChange={(value) => setStatus(value)}
                        options={[
                            {
                                label: tCommon("CM_ENTIRE"),
                                value: "",
                            },
                            {
                                label: t("RP_STATUS_REPORTING"),
                                value: "R",
                            },
                            {
                                label: t("RP_STATUS_BLOCKED"),
                                value: "I",
                            },
                            {
                                label: t("RP_STATUS_COMPLAIN"),
                                value: "P",
                            },
                        ]}
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
                onRow={(record) => ({
                    onClick: () => openDialog(record),
                })}
            />
            <ReportGoodsDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchData();
                    }
                }}
            />
        </Card>
    );
};
