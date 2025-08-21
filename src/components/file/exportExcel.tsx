import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface ExportExcelProps {
    data: any[];
    fileName?: string;
}

const ExportExcel: React.FC<ExportExcelProps> = ({ data, fileName }) => {
    const exportToExcel = () => {
        const defaultFileName = `${fileName ?? ""}_${dayjs().format(
            "YYYYMMDD_HHmm"
        )}`;
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const blob = new Blob([excelBuffer], {
            type: "application/octet-stream",
        });
        saveAs(blob, `${defaultFileName}.xlsx`);
    };

    return <Button icon={<FileExcelOutlined />} onClick={exportToExcel} />;
};

export default ExportExcel;
