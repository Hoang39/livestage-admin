import { Card, Table } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PolicyDialog, usePolicyDialog } from "./PolicyDialog";

export const Policy = () => {
    const { t: tCommon } = useTranslation("Common");

    const dataList = useMemo(() => {
        return [
            {
                NAME: "AccessTerms",
                KEYNAME: "AccessTerms",
                DESCRIPTION: "AccessTerms",
                ID: 1,
            },
            {
                NAME: "AppAccessTerms",
                KEYNAME: "AppAccessTerms",
                DESCRIPTION: "AppAccessTerms",
                ID: 2,
            },
            {
                NAME: "AppPrivacyTerms",
                KEYNAME: "AppPrivacyTerms",
                DESCRIPTION: "AppPrivacyTerms",
                ID: 3,
            },
            {
                NAME: "PrivacyTerms",
                KEYNAME: "PrivacyTerms",
                DESCRIPTION: "PrivacyTerms",
                ID: 4,
            },
            {
                NAME: "Intellectual Property Rights and Policies",
                KEYNAME: "IntellectualPropertyRightsAndPolicies",
                DESCRIPTION: "Intellectual Property Rights and Policies",
                ID: 5,
            },
            {
                NAME: "User Generated Content",
                KEYNAME: "UserGeneratedContent",
                DESCRIPTION: "User Generated Content",
                ID: 6,
            },
            {
                NAME: "Community Guidelines",
                KEYNAME: "CommunityGuidelines",
                DESCRIPTION: "Community Guidelines",
                ID: 7,
            },
            {
                NAME: "Virtual Items Policy",
                KEYNAME: "VirtualItemsPolicy",
                DESCRIPTION: "Virtual Items Policy",
                ID: 8,
            },
            {
                NAME: "Youth Protection Policy",
                KEYNAME: "YouthProtectionPolicy",
                DESCRIPTION: "Youth Protection Policy",
                ID: 9,
            },
        ];
    }, []);

    const { openDialog } = usePolicyDialog();

    const columns: any = [
        {
            title: tCommon("CM_FILENAME"),
            dataIndex: "KEYNAME",
            key: "KEYNAME",
            align: "center",
        },
    ];

    return (
        <>
            <Card title={tCommon("CM_TERMS")} extra={<></>}>
                <Table
                    rowKey={"ID"}
                    scroll={{ x: "max-content" }}
                    dataSource={dataList}
                    columns={columns}
                    onRow={(record) => ({
                        onClick: () => openDialog(record),
                    })}
                />
            </Card>

            <PolicyDialog
                onClose={async (status) => {
                    if (status === "success") {
                        // await fetchDataList();
                    }
                }}
            />
        </>
    );
};
