import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { Event } from "@/interfaces/event";
import { translateContentByLocale } from "@/utils/handleResponse";
import { EventService } from "@/app/services/event";
import timeService from "@/libs/timeService";
import dayjs from "dayjs";

export const useEventDialog = dialogStore<Event>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    TITLE_EN: string;
    TITLE_KO: string;
    TITLE_VI: string;
    STARTDATE: string | dayjs.Dayjs;
    KEYNAME: string;
    BONUS: number;
    EVENTID: number;
    RULES: string;
    ENDDATE: string | dayjs.Dayjs;
};

const initFormValues: FormValues = {
    STARTDATE: "",
    KEYNAME: "",
    BONUS: 0,
    EVENTID: 0,
    TITLE_EN: "",
    TITLE_KO: "",
    TITLE_VI: "",
    RULES: "",
    ENDDATE: "",
};

export const EventDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useEventDialog();
    const [isLoading, setIsLoading] = useState(false);

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
                    form.setFieldsValue({
                        ...item,
                        TITLE_EN: translateContentByLocale(item.TITLE, "en_US"),
                        TITLE_KO: translateContentByLocale(item.TITLE, "ko_KR"),
                        TITLE_VI: translateContentByLocale(item.TITLE, "vi_VN"),
                        STARTDATE: dayjs(
                            timeService.getStrDateParseFromUTC(item.STARTDATE)
                        ),
                        ENDDATE: dayjs(
                            timeService.getStrDateParseFromUTC(item.ENDDATE)
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

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            if (item) {
                await EventService.updateEvent({
                    EVENT_ID: item.EVENTID,
                    RULES: values.RULES ?? "",
                    BONUS: values.BONUS ?? 0,
                    KEY_NAME: values.KEYNAME ?? "",
                    START_DATE: timeService.dateConversion(
                        (values.STARTDATE as dayjs.Dayjs)?.format("YYYY-MM-DD")
                    ),
                    END_DATE: timeService.dateConversion(
                        (values.ENDDATE as dayjs.Dayjs)?.format("YYYY-MM-DD")
                    ),
                    TITLE: JSON.stringify({
                        en_US: values.TITLE_EN,
                        ko_KR: values.TITLE_KO,
                        vi_VN: values.TITLE_VI,
                    }),
                });
            } else {
                await EventService.insertEvent({
                    RULES: values.RULES ?? "",
                    BONUS: values.BONUS ?? 0,
                    KEY_NAME: values.KEYNAME ?? "",
                    START_DATE: timeService.dateConversion(
                        (values.STARTDATE as dayjs.Dayjs)?.format("YYYY-MM-DD")
                    ),
                    END_DATE: timeService.dateConversion(
                        (values.ENDDATE as dayjs.Dayjs)?.format("YYYY-MM-DD")
                    ),
                    TITLE: JSON.stringify({
                        en_US: values.TITLE_EN,
                        ko_KR: values.TITLE_KO,
                        vi_VN: values.TITLE_VI,
                    }),
                });
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

            await EventService.deleteEvent({
                EVENT_ID: item?.EVENTID ?? 0,
            });

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
                name: "TITLE_EN",
                label: "EVENT_GRID_TITLE_EN",
                type: "input",
                required: true,
                placeholder: "EVENT_GRID_TITLE_EN",
                colSpan: 24,
            },
            {
                name: "TITLE_KO",
                label: "EVENT_GRID_TITLE_KO",
                type: "input",
                required: true,
                placeholder: "EVENT_GRID_TITLE_KO",
                colSpan: 24,
            },
            {
                name: "TITLE_VI",
                label: "EVENT_GRID_TITLE_VI",
                type: "input",
                required: true,
                placeholder: "EVENT_GRID_TITLE_VI",
                colSpan: 24,
            },
            {
                name: "KEYNAME",
                label: "EVENT_GRID_KEYNAME",
                type: "input",
                required: true,
                placeholder: "EVENT_GRID_KEYNAME",
                colSpan: 12,
            },
            {
                name: "BONUS",
                label: "EVENT_GRID_BONUS",
                type: "inputnumber",
                required: true,
                placeholder: "EVENT_GRID_BONUS",
                colSpan: 12,
            },
            {
                name: "RULES",
                label: "EVENT_GRID_RULES",
                type: "input",
                required: true,
                placeholder: "EVENT_GRID_RULES",
                colSpan: 12,
            },
            {
                name: "STARTDATE",
                label: "EVENT_GRID_STARTDATE",
                type: "date",
                required: true,
                placeholder: "EVENT_GRID_STARTDATE",
                colSpan: 12,
            },
            {
                name: "ENDDATE",
                label: "EVENT_GRID_ENDDATE",
                type: "date",
                required: true,
                placeholder: "EVENT_GRID_ENDDATE",
                colSpan: 12,
            },
        ],
        []
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Event",
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
