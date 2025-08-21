import { useCallback } from "react";

import { Card, Flex, Input, Table } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import timeService from "@/libs/timeService";
import { MembershipService } from "@/app/services/membership";
import { Member, MemberReport } from "@/interfaces/membership";

const { Search } = Input;

export const User = () => {
    const { t } = useTranslation("Membership");
    const { t: tCommon } = useTranslation("Common");
    const { t: tPage } = useTranslation("Route");
    const { t: tLocale } = useTranslation("Locale");

    const [dataSource, setDataSource] = useState<Member[]>([]);
    const [report, setReport] = useState<MemberReport>();

    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await MembershipService.fetchMemberUser({
                MEM_ID: "",
                USE_YN: "",
                CR_FROMDATE: "",
                CR_TODATE: "",
                PAGE: 1,
                SIZE: 10000,
            });

            const reportResponse = await MembershipService.fetchReportMember();

            setDataSource(response?.RESULT_DATA);
            setReport(reportResponse?.RESULT_DATA?.[0]);
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
            title: t("MEM_GRID_ST_USERID"),
            dataIndex: "USERID",
            key: "USERID",
        },
        {
            title: t("MEM_GRID_ST_NICKNAME"),
            dataIndex: "NICKNAME",
            key: "NICKNAME",
        },
        {
            title: t("MEM_GRID_ST_MEMNAME"),
            dataIndex: "MEMNAME",
            key: "MEMNAME",
        },
        {
            title: t("MEM_GRID_ST_ADDR"),
            dataIndex: "ADDR",
            key: "ADDR",
        },
        {
            title: t("MEM_GRID_ST_MEMBERSHIP_YN"),
            dataIndex: "MEMBERSHIP_YN",
            key: "MEMBERSHIP_YN",
            align: "center",
            render: (text: string) =>
                text == "Y" ? tCommon("CM_YN_Y") : tCommon("CM_YN_N"),
        },
        {
            title: t("MEM_GRID_ST_TEL"),
            dataIndex: "TEL",
            key: "TEL",
        },
        {
            title: t("MEM_GRID_ST_MOBILE"),
            dataIndex: "MOBILE",
            key: "MOBILE",
        },
        {
            title: t("MEM_GRID_ST_BIRTHDAY"),
            dataIndex: "BIRTHDAY",
            key: "BIRTHDAY",
            align: "center",
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
            title: t("MEM_GRID_ST_VISITDATE"),
            dataIndex: "VISITDATE",
            key: "VISITDATE",
            render: (date: string) => timeService.getStrDateParseFromUTC(date),
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
            title={
                <span>
                    {tPage("User")} -{" "}
                    <span
                        style={{ fontSize: "14px", fontWeight: 500 }}
                    >{`${tLocale("USER_ACTIVE")} (${
                        report?.ACTIVE_COUNT ?? 0
                    }), ${tLocale("USER_INACTIVE")} (${
                        report?.INACTIVE_COUNT ?? 0
                    }), ${tLocale("VISIT_MONTH")} (${
                        report?.VISIT_MONTH ?? 0
                    }), ${tLocale("VISIT_TODAY")} (${
                        report?.VISIT_TODAY ?? 0
                    })`}</span>
                </span>
            }
            extra={
                <Flex gap="middle">
                    <Search
                        placeholder={t("MEM_GRID_ST_MEMNAME")}
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
                dataSource={dataSource?.filter((item) =>
                    item.MEMNAME.toLowerCase().includes(
                        searchTerm.toLowerCase()
                    )
                )}
                columns={columns}
            />
        </Card>
    );
};
