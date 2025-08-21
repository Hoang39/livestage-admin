import { Card, Flex, Input, Select, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { PersonalSale as IPersonalSale } from "@/interfaces/personal";
import { useTranslation } from "react-i18next";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { PersonalService } from "@/app/services/personal";
import {
    PersonalSaleDialog,
    usePersonalSaleDialog,
} from "./PersonalSaleDialog";

const { Search } = Input;

export const PersonalSale = () => {
    const { t } = useTranslation("Membership");
    const { t: tCommon } = useTranslation("Common");
    const { t: tRoute } = useTranslation("Route");

    const [dataSource, setDataSource] = useState<IPersonalSale[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState("");

    const { openDialog } = usePersonalSaleDialog();

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await PersonalService.fetchPersonalSale({
                EMAIL: "",
                APPROVALSTATUS: status,
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
            title: t("MEM_RQ_EMAIL"),
            dataIndex: "EMAIL",
            key: "EMAIL",
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
                    {text}
                </p>
            ),
        },
        {
            title: t("MEM_RQ_FIRSNAME"),
            dataIndex: "FIRSTNAME",
            key: "FIRSTNAME",
        },
        {
            title: t("MEM_RQ_LASTNAME"),
            dataIndex: "LASTNAME",
            key: "LASTNAME",
        },
        {
            title: t("MEM_RQ_CCCD"),
            dataIndex: "IDNUM",
            key: "IDNUM",
        },
        {
            title: t("MEM_RQ_MOBILE"),
            dataIndex: "PHONE",
            key: "PHONE",
        },
        {
            title: t("MEM_RQ_BANKACCOUNT"),
            dataIndex: "BANKACCOUNT",
            key: "BANKACCOUNT",
        },
        {
            title: t("MEM_RQ_STATUS"),
            dataIndex: "APPROVALSTATUS",
            key: "APPROVALSTATUS",
            align: "center",
            render: (text: string) =>
                text == "Pending"
                    ? t("MEM_RQ_PENDING")
                    : text == "Approved"
                    ? t("MEM_RQ_APPROVED")
                    : t("MEM_RQ_REJECTED"),
        },
    ];

    return (
        <Card
            title={tRoute("Personal")}
            extra={
                <Flex gap="middle">
                    <Search
                        placeholder={t("MEM_RQ_PLH")}
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
                                value: "Pending",
                            },
                            {
                                label: t("MEM_RQ_APPROVED"),
                                value: "Approved",
                            },
                            {
                                label: t("MEM_RQ_REJECTED"),
                                value: "Rejected",
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
                    item.EMAIL.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                columns={columns}
                onRow={(record) => ({
                    onClick: () => openDialog(record),
                })}
            />
            <PersonalSaleDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchData();
                    }
                }}
            />
        </Card>
    );
};
