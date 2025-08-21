import React, { useEffect } from "react";
import { Select, Space } from "antd";
import { useAppStore } from "@/hooks/useAppStore";

export const BusinessControl: React.FC = () => {
    const {
        fetchCompanies,
        companyList,
        currentCompany,
        currentPlace,
        setCurrentPlace,
        placeList,
        setCurrentCompany,
        fetchCategories,
        fetchVoteConfig,
    } = useAppStore((state) => state);

    useEffect(() => {
        fetchCompanies();
        fetchCategories();
        fetchVoteConfig();
    }, [fetchCategories, fetchCompanies, fetchVoteConfig]);

    const handleCompanyChange = (value: number) => {
        setCurrentCompany(value);
    };

    const handlePlaceChange = (value: number) => {
        setCurrentPlace(value);
    };

    return (
        <Space wrap>
            <Select
                style={{ width: 200 }}
                value={currentCompany?.COMID}
                onChange={handleCompanyChange}
                options={companyList?.map((company) => ({
                    label: company.COMNAME,
                    value: company.COMID,
                }))}
            />
            <Select
                style={{ width: 200 }}
                value={currentPlace?.PLACEID}
                onChange={handlePlaceChange}
                options={placeList?.map((place) => ({
                    label: place.PLACENAME,
                    value: place.PLACEID,
                }))}
            />
        </Space>
    );
};
