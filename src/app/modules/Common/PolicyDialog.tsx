import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col, Flex, Select } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { CommonService } from "@/app/services/common";
import { FileService } from "@/app/services/file";

export const usePolicyDialog = dialogStore<{ KEYNAME: string }>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    DESCRIPTION: string;
};

const initFormValues: FormValues = {
    DESCRIPTION: "",
};

export const PolicyDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tLogin } = useTranslation("Login");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = usePolicyDialog();
    const [isLoading, setIsLoading] = useState(false);
    const [lang, setLang] = useState("en_US");

    const [form] = Form.useForm<FormValues>();

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

            try {
                if (item) {
                    const reponse = await CommonService.fetchContentHtml(
                        item.KEYNAME,
                        lang
                    );

                    form.setFieldsValue({
                        DESCRIPTION: reponse.data,
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
    }, [form, item, openNotification, lang]);

    const onValuesChange = (
        _changedValues: FormValues,
        _allValues: FormValues
    ) => {
        //
    };

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

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            if (item) {
                const keyName = item.KEYNAME;

                const FOLDER = "terms";

                const fileName = `${FOLDER}/${keyName}_${lang}.html`;
                const path = `${fileName}`;
                const pathOrg = `/${fileName}`;
                const pathUrl = `/${fileName}`;

                await FileService.textUpload([
                    {
                        FILE: values.DESCRIPTION,
                        FILENAME: fileName,
                        PATH: path,
                        PATHORG: pathOrg,
                        PATHURL: pathUrl,
                    },
                ]);
            }

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
                name: "DESCRIPTION",
                label: "CM_TERMS",
                type: "editor",
                required: true,
                placeholder: "CM_TERMS",
                colSpan: 24,
            },
        ],
        []
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Common",
    });

    return (
        <>
            <Drawer
                closable
                destroyOnClose
                title={
                    <Flex align="center" justify="space-between">
                        <span>{dialogTitle}</span>
                        <Select
                            style={{ width: 200 }}
                            value={lang}
                            onChange={(value) => setLang(value)}
                            options={[
                                {
                                    value: "en_US",
                                    label: tLogin("ENGLISH_LANGUAGE"),
                                },
                                {
                                    value: "ko_KR",
                                    label: tLogin("KOREAN_LANGUAGE"),
                                },
                                {
                                    value: "vi_VN",
                                    label: tLogin("VIETNAMESE_LANGUAGE"),
                                },
                            ]}
                        />
                    </Flex>
                }
                placement="right"
                open={open}
                loading={isLoading}
                onClose={handleClose}
                width="80%"
                style={{ zIndex: 999 }}
                footer={
                    !readonly && (
                        <Space
                            style={{
                                width: "100%",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button onClick={handleClose}>
                                {tCommon("CM_CANCEL")}
                            </Button>

                            <Button
                                type="primary"
                                onClick={handleSave}
                                loading={isLoading}
                            >
                                {tCommon("CM_SAVE")}
                            </Button>
                        </Space>
                    )
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={onValuesChange}
                    onFinish={handleSave}
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
