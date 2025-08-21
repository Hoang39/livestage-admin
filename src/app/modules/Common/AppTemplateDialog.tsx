import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import {
    Button,
    Drawer,
    Form,
    Space,
    Row,
    Col,
    Flex,
    Select,
    Popconfirm,
} from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { Template } from "@/interfaces/template";
import { TemplateService } from "@/app/services/template";

export const useAppTemplateDialog = dialogStore<{
    record: Template;
    list: Template[];
}>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = Partial<Template>;

const initFormValues: FormValues = {
    CONTENT: "",
    KEYNAME: "",
    LAN: "",
    TITLE: "",
};

export const AppTemplateDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tLogin } = useTranslation("Login");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useAppTemplateDialog();
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
                    const itemSelected = item.list.find(
                        (data) =>
                            data.KEYNAME == item.record.KEYNAME &&
                            data.LAN == lang
                    );

                    form.setFieldsValue(itemSelected as Template);
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
                await Promise.all(
                    item?.list
                        .filter((data) => data.KEYNAME == item?.record.KEYNAME)
                        .map((data) =>
                            TemplateService.updateAllAppTemplate({
                                ...data,
                                KEYNAME: values.KEYNAME,
                                TITLE: values.TITLE,
                                ...(data.LAN == lang
                                    ? { CONTENT: values.CONTENT }
                                    : {}),
                            })
                        )
                );
            } else {
                await Promise.all(
                    ["en_US", "ko_KR", "vi_VN"].map((data) =>
                        TemplateService.insertAllAppTemplate({
                            ...values,
                            CONTENT: "",
                            LAN: data,
                        })
                    )
                );
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

    const handleDelete = useCallback(async () => {
        try {
            setIsLoading(true);

            if (item)
                await Promise.all(
                    item?.list
                        .filter((data) => data.KEYNAME == item?.record.KEYNAME)
                        .map((data) =>
                            TemplateService.deleteAllAppTemplate(data)
                        )
                );

            openNotification(
                "success",
                tCommon("delete-successful"),
                undefined,
                {
                    showProgress: true,
                    pauseOnHover: true,
                }
            );

            handleClose("success");
        } catch (error) {
            openNotification("error", tCommon("delete-failed"), undefined, {
                showProgress: true,
                pauseOnHover: true,
            });

            console.error("handleDelete error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [handleClose, item, openNotification, tCommon]);

    const fields: Field[] = useMemo(
        () => [
            {
                name: "TITLE",
                label: "CM_TITLE",
                type: "input",
                required: true,
                placeholder: "CM_TITLE",
                colSpan: 12,
            },
            {
                name: "KEYNAME",
                label: "CM_KEY",
                type: "input",
                required: true,
                placeholder: "CM_KEY",
                colSpan: 12,
            },
            {
                name: "CONTENT",
                label: "",
                type: "editor",
                placeholder: "",
                colSpan: 24,
                hidden: !item,
            },
        ],
        [item]
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

                            {item && (
                                <Popconfirm
                                    title={tCommon("CM_REMOVE")}
                                    description={tCommon("delete-confirmation")}
                                    placement="topLeft"
                                    onConfirm={handleDelete}
                                    okText={tCommon("CM_YN_Y")}
                                    cancelText={tCommon("CM_CANCEL")}
                                >
                                    <Button
                                        color="danger"
                                        variant="outlined"
                                        loading={isLoading}
                                    >
                                        {tCommon("CM_REMOVE")}
                                    </Button>
                                </Popconfirm>
                            )}

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
