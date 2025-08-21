import { Button, Card, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TemplateService } from "@/app/services/template";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { Template } from "@/interfaces/template";
import { AppTemplateDialog, useAppTemplateDialog } from "./AppTemplateDialog";

export const AppTemplate = () => {
    const { t: tCommon } = useTranslation("Common");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<Template[]>([]);

    const { openDialog } = useAppTemplateDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await TemplateService.fetchAllAppTemplate({});
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
            title: tCommon("CM_TITLE"),
            dataIndex: "TITLE",
            key: "TITLE",
        },
        {
            title: tCommon("CM_KEY"),
            dataIndex: "KEYNAME",
            key: "KEYNAME",
            align: "center",
        },
    ];

    const handleAddItem = () => {
        console.log("handleAddItem");
        openDialog();
    };

    return (
        <>
            <Card
                title={tCommon("CM_APP_TEMPLATE")}
                extra={
                    <Button type="primary" onClick={handleAddItem}>
                        {tCommon("CM_ADD")}
                    </Button>
                }
            >
                <Table
                    rowKey={"PID"}
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList.reduce((acc: Template[], item) => {
                        if (!acc.some((e) => e.KEYNAME == item.KEYNAME))
                            acc.push(item);
                        return acc;
                    }, [])}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog({ record, list: dataList }),
                    })}
                />
            </Card>

            <AppTemplateDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchDataList();
                    }
                }}
            />
        </>
    );
};
