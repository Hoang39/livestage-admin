import { Button, Card, Flex, Input, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { CommonService } from "@/app/services/common";
import { CommonCode as ICommonCode } from "@/interfaces/common";
import { CommonCodeDialog, useCommonCodeDialog } from "./CommonCodeDialog";

const { Search } = Input;

export const CommonCode = () => {
    const { t } = useTranslation("CommonCode");
    const { t: tCommon } = useTranslation("Common");

    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState<ICommonCode[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useCommonCodeDialog();

    const fetchDataList = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload = await CommonService.fetchCommonCodeGroup({
                CODE_ID: "",
                CODE_NAME: "",
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
            title: t("CMC_CODE_ID"),
            dataIndex: "CODE_ID",
            key: "CODE_ID",
        },
        {
            title: t("CMC_CODE_NAME"),
            dataIndex: "CODE_NAME",
            key: "CODE_NAME",
        },
        {
            title: t("CMC_REMARK"),
            dataIndex: "REMARK",
            key: "REMARK",
        },
        {
            title: t("CMC_OPEN_TAG"),
            dataIndex: "OPEN_TAG",
            key: "OPEN_TAG",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
    ];

    const handleAddItem = () => {
        console.log("handleAddItem");
        openDialog();
    };

    return (
        <>
            <Card
                title={t("CMC_GRID_1_TITLE")}
                extra={
                    <Flex gap="middle">
                        <Search
                            placeholder={t("CMC_SEARCH_1_TITLE")}
                            allowClear
                            onSearch={(value) => {
                                setSearchTerm(value);
                            }}
                            style={{ width: 200 }}
                        />

                        <Button type="primary" onClick={handleAddItem}>
                            {tCommon("CM_ADD")}
                        </Button>
                    </Flex>
                }
            >
                <Table
                    rowKey={"CODE_NO"}
                    scroll={{ x: "max-content" }}
                    loading={isLoading}
                    dataSource={dataList.filter((item: ICommonCode) =>
                        item.CODE_NAME.toLowerCase().includes(
                            searchTerm.toLowerCase()
                        )
                    )}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog(record),
                    })}
                />
            </Card>

            <CommonCodeDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchDataList();
                    }
                }}
            />
        </>
    );
};
