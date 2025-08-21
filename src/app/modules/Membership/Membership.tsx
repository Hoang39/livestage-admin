import { useCallback } from "react";

import { Card, Flex, Input, Table } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import timeService from "@/libs/timeService";
import { MembershipService } from "@/app/services/membership";
import { Membership as IMembership } from "@/interfaces/membership";
import { MembershipDialog, useMembershipDialog } from "./MembershipDialog";

const { Search } = Input;

export const Membership = () => {
    const { t } = useTranslation("Membership");
    const { t: tPage } = useTranslation("Route");

    const [dataSource, setDataSource] = useState<IMembership[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const { openDialog } = useMembershipDialog();

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await MembershipService.fetchMembershipReq({
                EMAIL: "",
                APPROVALSTATUS: "",
                PAGE_NUM: 1,
                PAGE_SIZE: 1000,
            });

            setDataSource(response?.RESULT_DATA);
        } catch (error) {
            console.log("🚀 ~ fetGoodsList ~ error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: any = [
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
            title: t("MEM_RQ_EMAIL"),
            dataIndex: "EMAIL",
            key: "EMAIL",
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
            title: t("MEM_APPROVALSTATUS"),
            dataIndex: "APPROVALSTATUS",
            key: "APPROVALSTATUS",
            align: "center",
            render: (text: string) =>
                text == "Pending"
                    ? t("MEM_RQ_PENDING")
                    : text == "Approved"
                    ? t("MEM_RQ_APPROVED")
                    : text == "Rejected"
                    ? t("MEM_RQ_REJECTED")
                    : text == "Approve"
                    ? t("MEM_RQ_APPROVE")
                    : t("MEM_RQ_REJECT"),
        },
        {
            title: t("MEM_GRID_ST_CRTDATE"),
            dataIndex: "CRTDATE",
            key: "CRTDATE",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
        },
    ];

    return (
        <Card
            title={tPage("Membership")}
            extra={
                <Flex gap="middle">
                    <Search
                        placeholder={t("MEM_GRID_EMAIL")}
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
                rowKey={"MEMID"}
                scroll={{ x: "max-content" }}
                loading={isLoading}
                dataSource={dataSource?.filter((item) =>
                    item.EMAIL.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                columns={columns}
                onRow={(record) => ({
                    onClick: () => openDialog(record, true),
                })}
            />
            <MembershipDialog
                onClose={async (status) => {
                    if (status === "success") {
                        await fetchData();
                    }
                }}
            />
        </Card>
    );
};
