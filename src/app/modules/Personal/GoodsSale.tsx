import { Card, Flex, Input, Select, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { GoodsSale as IGoodsSale } from "@/interfaces/personal";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { PersonalService } from "@/app/services/personal";
import { GoodsSaleDialog, useGoodsSaleDialog } from "./GoodsSaleDialog";

const { Search } = Input;

export const GoodsSale = () => {
    const { t } = useTranslation("Membership");
    const { t: tCommon } = useTranslation("Common");
    const { t: tRoute } = useTranslation("Route");

    const [dataSource, setDataSource] = useState<IGoodsSale[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState("");

    const { openDialog } = useGoodsSaleDialog();

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await PersonalService.fetchGoodsSale({
                NAME: "",
                APPROVALSTATUS: status,
                USERID: "",
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
            title: t("MEM_RQ_MEMID"),
            dataIndex: "MEMID",
            key: "MEMID",
        },
        {
            title: t("MEM_RQ_SELLER_ALIAS"),
            dataIndex: "SELLER_ALIAS",
            key: "SELLER_ALIAS",
        },
        {
            title: t("MEM_RQ_NAME"),
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
            title: t("MEM_RQ_GINFO"),
            dataIndex: "GINFO",
            key: "GINFO",
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
            title: t("MEM_RQ_GROUPNAME"),
            dataIndex: "GROUPNAME",
            key: "GROUPNAME",
            render: (text: string) => translateContent(text),
        },
        {
            title: t("MEM_RQ_STATUSNAME"),
            dataIndex: "STATUSNAME",
            key: "STATUSNAME",
        },
        {
            title: t("MEM_RQ_SELLPRICE"),
            dataIndex: "SELLPRICE",
            key: "SELLPRICE",
        },
        {
            title: t("MEM_RQ_WAREHOUSEADDR"),
            dataIndex: "WAREHOUSEADDRESS",
            key: "WAREHOUSEADDRESS",
            width: 200,
            render: (_: string, record: any) => (
                <p
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                    }}
                >
                    {record.WAREHOUSEADDR + " " + record.WAREHOUSEADDR2}
                </p>
            ),
        },
        {
            title: t("MEM_RQ_WAREHOUSETEL1"),
            dataIndex: "WAREHOUSETEL1",
            key: "WAREHOUSETEL1",
        },
        {
            title: t("MEM_RQ_STATUS"),
            dataIndex: "APPROVALSTATE",
            key: "APPROVALSTATE",
            align: "center",
            render: (text: string) =>
                text == "P"
                    ? t("MEM_RQ_PENDING")
                    : text == "A"
                    ? t("MEM_RQ_APPROVED")
                    : t("MEM_RQ_REJECTED"),
        },
    ];

    return (
        <Card
            title={tRoute("GoodsSale")}
            extra={
                <Flex gap="middle">
                    <Search
                        placeholder={t("MEM_PK_MEMNAME")}
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
                                label: t("MEM_RQ_PENDING"),
                                value: "P",
                            },
                            {
                                label: t("MEM_RQ_APPROVED"),
                                value: "A",
                            },
                            {
                                label: t("MEM_RQ_REJECTED"),
                                value: "R",
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
            <GoodsSaleDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchData();
                    }
                }}
            />
        </Card>
    );
};
