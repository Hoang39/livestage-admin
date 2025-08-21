import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import {
    Button,
    Drawer,
    Form,
    Space,
    Row,
    Col,
    Popconfirm,
    Select,
} from "antd";
import { useTranslation } from "react-i18next";
import { translateContent } from "@/utils/handleResponse";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { Membership } from "@/interfaces/membership";
import { CommonCode } from "@/interfaces/common";
import { CommonService } from "@/app/services/common";
import { MembershipService } from "@/app/services/membership";

export const useMembershipDialog = dialogStore<Membership>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormMembershipValues = {
    FIRSTNAME: string;
    LASTNAME: string;
    IDNUM: string;
    PHONE: string;
    EMAIL: string;
    BANKACCOUNT: string;
    IDPHOTOS: string;
    REJECTREASON: string;
};

// Initial form values
const initFormValues: FormMembershipValues = {
    FIRSTNAME: "",
    LASTNAME: "",
    IDNUM: "",
    PHONE: "",
    EMAIL: "",
    BANKACCOUNT: "",
    IDPHOTOS: "",
    REJECTREASON: "",
};

export const MembershipDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Membership");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useMembershipDialog();
    const [isLoading, setIsLoading] = useState(false);

    const [commonCode, setCommonCode] = useState<CommonCode[]>([]);
    const [rejectId, setRejectId] = useState<string>("");
    const [uploadedImages, setUploadedImages] = useState<{
        IDPHOTOS: { URL: string }[];
    }>({
        IDPHOTOS: [],
    });

    const [form] = Form.useForm<FormMembershipValues>();

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            const response = await CommonService.fetchCommonCode({
                CODE_ID: "REJECTMEMBERSHIPREASON",
            });
            setCommonCode(response?.RESULT_DATA ?? []);

            try {
                if (item) {
                    form.setFieldsValue({
                        FIRSTNAME: item.FIRSTNAME,
                        LASTNAME: item.LASTNAME,
                        IDNUM: item.IDNUM,
                        PHONE: item.PHONE,
                        EMAIL: item.EMAIL,
                        BANKACCOUNT: item.BANKACCOUNT,
                        REJECTREASON: translateContent(item.REJECTREASON),
                        IDPHOTOS: JSON.parse(item.IDPHOTOS)?.map(
                            (item: string) => ({ URL: item })
                        ),
                    });
                    setUploadedImages({
                        IDPHOTOS: JSON.parse(item.IDPHOTOS)?.map(
                            (item: string) => ({ URL: item })
                        ),
                    });
                } else {
                    form.setFieldsValue(initFormValues);
                }

                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);

                openNotification("error", "", undefined, {
                    showProgress: true,
                    pauseOnHover: true,
                });

                console.log("Init form values: ", error);
            }
        })();
    }, [form, item, openNotification]);

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            let status: string | undefined;

            if (typeof e === "string") {
                status = e;
            }

            onClose(status);
            closeDialog();
        },
        [closeDialog, onClose]
    );

    const handleSave = async (id?: string) => {
        try {
            setIsLoading(true);

            await MembershipService.updateMembershipReq({
                MEMID: item?.MEMID ?? 0,
                APPREOVEYN: id ? "N" : "Y",
                REJECTID: id ?? 0,
            });

            await MembershipService.grantUserMembership({
                USER_ID: item?.USERID ?? "",
                LINK_USER: item?.MEMID ?? 0,
                TYPE: id ? "D" : "I",
                REJECTID: id ?? 0,
                REJECTREASON: id
                    ? commonCode.find((item) => item.CODE_LIST_ID == id)
                          ?.CODE_LIST_DISPLAY_NAME ?? ""
                    : "",
            });

            openNotification(
                "success",
                tCommon(item ? "update-successful" : "create-successful"),
                undefined,
                {
                    showProgress: true,
                    pauseOnHover: true,
                }
            );

            handleClose("success");
        } catch (error) {
            openNotification(
                "error",
                tCommon(item ? "update-failed" : "create-failed"),
                undefined,
                {
                    showProgress: true,
                    pauseOnHover: true,
                }
            );

            console.error("Validation or save error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fields: Field[] = useMemo(
        () => [
            {
                name: "FIRSTNAME",
                label: "MEM_RQ_FIRSNAME",
                type: "input",
                required: true,
                placeholder: "MEM_RQ_FIRSNAME",
                colSpan: 12,
            },
            {
                name: "LASTNAME",
                label: "MEM_RQ_LASTNAME",
                type: "input",
                required: true,
                placeholder: "MEM_RQ_LASTNAME",
                colSpan: 12,
            },
            {
                name: "IDNUM",
                label: "MEM_RQ_CCCD",
                type: "input",
                required: true,
                placeholder: "MEM_RQ_CCCD",
                colSpan: 12,
            },
            {
                name: "PHONE",
                label: "MEM_RQ_MOBILE",
                type: "input",
                required: true,
                placeholder: "MEM_RQ_MOBILE",
                colSpan: 12,
            },
            {
                name: "EMAIL",
                label: "MEM_RQ_EMAIL",
                type: "input",
                required: true,
                placeholder: "MEM_RQ_EMAIL",
                colSpan: 12,
            },
            {
                name: "BANKACCOUNT",
                label: "MEM_RQ_BANKACCOUNT",
                type: "input",
                required: true,
                placeholder: "MEM_RQ_BANKACCOUNT",
                colSpan: 12,
            },
            {
                name: "REJECTREASON",
                label: "MEM_RQ_REASON",
                type: "input",
                required: true,
                placeholder: "MEM_RQ_REASON",
                colSpan: 24,
                hidden: !item?.REJECTREASON,
            },
            {
                name: "IDPHOTOS",
                label: "MEM_RQ_FILE",
                type: "upload",
                required: true,
                placeholder: "MEM_RQ_FILE",
                colSpan: 24,
            },
        ],
        [item]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Membership",
        uploadedImages,
    });

    return (
        <>
            <Drawer
                closable
                destroyOnClose
                title={dialogTitle}
                placement="right"
                open={open}
                loading={isLoading}
                onClose={handleClose}
                width="60%"
                style={{ zIndex: 999 }}
                footer={
                    item?.APPROVALSTATUS == "Pending" && (
                        <Space
                            style={{
                                width: "100%",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Popconfirm
                                title={t("MEM_RQ_REJECT")}
                                description={
                                    <Select
                                        style={{ width: "380px" }}
                                        options={commonCode?.map((item) => ({
                                            value: item.CODE_LIST_ID,
                                            label: translateContent(
                                                item.CODE_LIST_DISPLAY_NAME
                                            ),
                                        }))}
                                        onChange={(e) => setRejectId(e)}
                                    />
                                }
                                placement="topRight"
                                onConfirm={() => handleSave(rejectId)}
                                okText={tCommon("CM_YN_Y")}
                                cancelText={tCommon("CM_CANCEL")}
                            >
                                <Button
                                    color="danger"
                                    variant="solid"
                                    loading={isLoading}
                                >
                                    {t("MEM_RQ_REJECT")}
                                </Button>
                            </Popconfirm>

                            <Button
                                type="primary"
                                onClick={() => handleSave()}
                                loading={isLoading}
                            >
                                {t("MEM_RQ_APPROVE")}
                            </Button>
                        </Space>
                    )
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    disabled={readonly}
                    initialValues={initFormValues}
                >
                    <Row gutter={[16, 0]}>
                        {fields.map((field, index) => (
                            <Col span={field.colSpan} key={index}>
                                {render(field)}
                            </Col>
                        ))}
                    </Row>
                </Form>
            </Drawer>
        </>
    );
};
