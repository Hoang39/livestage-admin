import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Row, Col, Select, Space } from "antd";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { ChatReport } from "@/interfaces/report";
import { ReportService } from "@/app/services/report";
import { ReportChatList } from "./ReportChatList";

export const useReportChatDialog = dialogStore<ChatReport>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = any;

export const ReportChatDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Report");
    const { t: tCommon } = useTranslation("Common");

    const { open, item, readonly, closeDialog } = useReportChatDialog();
    const [isLoading, setIsLoading] = useState(false);

    const [status, setStatus] = useState("");

    const [uploadedImages, setUploadedImages] = useState<{
        IDPHOTOS: any;
    }>({
        IDPHOTOS: [],
    });

    const [form] = Form.useForm<FormValues>();

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    useEffect(() => {
        setStatus(item?.REPORT_STATUS ?? "A");
    }, [item]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                if (item) {
                    if (status == "P" || status == "I") {
                        const response =
                            await ReportService.fetchUserClaimReport({
                                USER_PID: item.TARGET_USER_PID,
                                STATUS: status,
                            });

                        const dataList = getDataFromPayloadRestful(response);

                        if (dataList.length) {
                            form.setFieldsValue({
                                ...dataList?.[0],
                                REASON_NAME: translateContent(
                                    dataList?.[0]?.REASON_NAME ?? ""
                                ),
                                ...(dataList?.[0]?.REPORT_STATUS == "P"
                                    ? {
                                          COMPLAIN_INFO_DESCRIPTION: JSON.parse(
                                              dataList?.[0]?.COMPLAIN_INFO ?? ""
                                          )?.DESCRIPTION,
                                      }
                                    : {}),
                            });

                            setUploadedImages({
                                IDPHOTOS: JSON.parse(
                                    dataList?.[0]?.COMPLAIN_INFO ?? ""
                                )?.IDPHOTOS?.map((item: any) => ({
                                    URL: item,
                                })),
                            });
                        }
                    }
                }
            } catch (error) {
                console.log("Error fetchUserClaimReport: ", error);
            }

            setIsLoading(false);
        })();
    }, [form, item, status]);

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            let status: string | undefined;

            if (typeof e === "string") {
                status = e;
            }

            setUploadedImages({ IDPHOTOS: [] });

            onClose(status);
            closeDialog();
        },
        [closeDialog, onClose]
    );

    const fields: Field[] = useMemo(
        () => [
            {
                name: "IDPHOTOS",
                label: "RP_COMPLAIN_TITLE",
                type: "upload",
                disable: true,
                colSpan: 24,
                hidden: item?.REPORT_STATUS != "P",
            },
        ],
        [item]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Report",
        uploadedImages,
    });

    return (
        <>
            <Drawer
                closable
                destroyOnClose
                title={
                    <>
                        {dialogTitle}
                        <Select
                            style={{
                                width: 200,
                                float: "right",
                            }}
                            value={status}
                            onChange={(value) => setStatus(value)}
                            options={[
                                {
                                    label: tCommon("CM_ENTIRE"),
                                    value: "A",
                                },
                                {
                                    label: t("RP_STATUS_REPORTING"),
                                    value: "R",
                                },
                                {
                                    label: t("RP_STATUS_BLOCKED"),
                                    value: "I",
                                },
                                {
                                    label: t("RP_STATUS_COMPLAIN"),
                                    value: "P",
                                },
                                {
                                    label: t("RP_STATUS_SUCCESS"),
                                    value: "C",
                                },
                            ]}
                        />
                    </>
                }
                placement="right"
                open={open}
                loading={isLoading}
                onClose={handleClose}
                width="60%"
                style={{ zIndex: 999 }}
                footer={
                    <Space
                        style={{
                            width: "100%",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button onClick={handleClose}>
                            {tCommon("CM_CANCEL")}
                        </Button>
                    </Space>
                }
            >
                <Form form={form} layout="vertical" disabled={readonly}>
                    <Row gutter={[16, 0]}>
                        {fields.map((field, index) => (
                            <Col span={field.colSpan} key={index}>
                                {render(field)}
                            </Col>
                        ))}
                    </Row>

                    <ReportChatList item={item as ChatReport} status={status} />
                </Form>
            </Drawer>
        </>
    );
};
