import { Button, Card, Popconfirm, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { GoodsReport, Report } from "@/interfaces/report";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { ReportService } from "@/app/services/report";
import timeService from "@/libs/timeService";
import { DeleteOutlined } from "@ant-design/icons";

export const ReportGoodsList = ({ item }: { item: GoodsReport }) => {
    const { t } = useTranslation("Report");
    const { t: tCommon } = useTranslation("Common");

    const [dataSource, setDataSource] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await ReportService.fetchAllReport({
                TARGET_PID: item.PID ?? "",
                REPORT_TYPE: "GOODS",
            });

            setDataSource(getDataFromPayloadRestful(response));
        } catch (error) {
            console.log("Error getCompanyList: ", error);
        }

        setIsLoading(false);
    }, [item]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = useCallback(
        async (data: Report) => {
            try {
                await ReportService.deleteListReports({
                    LIST_PID: `${data.PID}`,
                });

                await fetchData();
            } catch (error) {
                console.log("Error handleDelete: ", error);
            }
        },
        [fetchData]
    );

    const columns: any = [
        {
            title: t("RP_DATE"),
            dataIndex: "CRT_DATE",
            key: "CRT_DATE",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
        {
            title: t("RP_PERSON_REPORT"),
            dataIndex: "USER_PID",
            key: "USER_PID",
        },
        {
            title: t("PR_CONTENT_REPORT"),
            dataIndex: "REASON_NAME",
            key: "REASON_NAME",
            render: (text: string) => translateContent(text),
        },
        {
            title: "",
            dataIndex: "",
            key: "",
            render: (_: any, record: any) => (
                <Popconfirm
                    title={tCommon("CM_REMOVE")}
                    placement="topLeft"
                    onConfirm={async () => {
                        await handleDelete(record);
                    }}
                    okText={tCommon("CM_YN_Y")}
                    cancelText={tCommon("CM_CANCEL")}
                >
                    <Button icon={<DeleteOutlined />} size="small" danger />
                </Popconfirm>
            ),
        },
    ];

    return (
        <Card title={t("RP_LIST_REPORT_TITLE")}>
            <Table
                scroll={{ x: "max-content" }}
                loading={isLoading}
                dataSource={dataSource}
                columns={columns}
            />
        </Card>
    );
};
