import { useState, useEffect, useMemo, useCallback } from "react";
import { ScheduleNotification } from "@/interfaces/notification";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col, Popconfirm } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { useAppStore } from "@/hooks/useAppStore";
import { NotificationService } from "@/app/services/notification";
import dayjs from "dayjs";
import timeService from "@/libs/timeService";
import { Member } from "@/interfaces/member";
import { MemberService } from "@/app/services/member";
import { BeaconManagerService } from "@/app/services/beaconManager";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";
import { Place } from "@/interfaces/beaconManager";

export const useScheduleDialog = dialogStore<ScheduleNotification>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormScheduleValues = {
    TYPE: string;
    TAS_ID: string;
    TO_GROUP: string;
    USER_NAME: string;
    USER_EMAILS: string;
    MAP_CONTENT: string;
    SENDER: string;
    SENDER_NAME: string;
    SUBJECT: string;
    NOTE: string;
    SCH_DATE: string | dayjs.Dayjs;
};

const initFormValues: FormScheduleValues = {
    TYPE: "",
    TAS_ID: "gwangho@cloud-lab.co.kr",
    TO_GROUP: "",
    USER_NAME: "",
    USER_EMAILS: "",
    MAP_CONTENT: "",
    SENDER: "gwangho@cloud-lab.co.kr",
    SENDER_NAME: "CLOUDLAB",
    SUBJECT: "",
    NOTE: "",
    SCH_DATE: "",
};

export const ScheduleDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Notification");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useScheduleDialog();
    const [isLoading, setIsLoading] = useState(false);

    const [notiType, setNotiType] = useState("");

    const [memberList, setMemberList] = useState<Member[]>([]);
    const [placeList, setPlaceList] = useState<Place[]>([]);

    const { currentCompany, currentPlace, userInfo } = useAppStore(
        (state) => state
    );

    const [form] = Form.useForm<FormScheduleValues>();

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    useEffect(() => {
        const fetchData = async () => {
            const memberResponse = await MemberService.fetchMember({
                MEMNAME: "",
            });
            const placeResponse = await BeaconManagerService.fetchComToPlaceAll(
                { COMID: "", USEYN: "Y", MODE: "STATICS" }
            );

            setMemberList(getDataFromPayloadRestful(memberResponse));
            setPlaceList(getDataFromPayloadRestful(placeResponse));
        };

        fetchData();
    }, []);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                if (item) {
                    setNotiType(item.TYPE);

                    form.setFieldsValue({
                        TYPE: item.TYPE,
                        TAS_ID: item.TAS_ID,
                        TO_GROUP: item.TO_GROUP,
                        USER_NAME: item.USER_NAME,
                        USER_EMAILS: "",
                        MAP_CONTENT: item.MAP_CONTENT,
                        SENDER: item.SENDER,
                        SENDER_NAME: item.SENDER_NAME,
                        SUBJECT: item.SUBJECT,
                        NOTE: item.NOTE,
                        SCH_DATE: dayjs(
                            timeService.getStrDateParseFromUTC(item.SCH_DATE)
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
    }, [currentCompany, currentPlace, form, item, openNotification]);

    const getRecipientListInfo = (type: string, group: string) => {
        if (type === "EMAIL") {
            switch (group) {
                case "SHOP":
                    return placeList
                        .map((i) => i.EMAIL)
                        .filter((i) => i)
                        .join(",");
                case "USER":
                    return memberList
                        .filter(
                            (i) =>
                                i &&
                                i.MEMBERSHIPYN == "N" &&
                                i.LIPSTARTYN == "N" &&
                                i.EMAIL
                        )
                        .map((i) => i.EMAIL)
                        .join(",");
                case "MEMBERSHIP":
                    return memberList
                        .filter((i) => i && i.MEMBERSHIPYN == "Y" && i.EMAIL)
                        .map((i) => i.EMAIL)
                        .join(",");

                case "LIPSTAR":
                    return memberList
                        .filter((i) => i && i.LIPSTARTYN == "Y" && i.EMAIL)
                        .map((i) => i.EMAIL)
                        .join(",");
            }
        }

        if (type === "SMS") {
            switch (group) {
                case "SHOP":
                    return placeList
                        .map((i) => i.TEL)
                        .filter((i) => i)
                        .join(",");
                case "USER":
                    return memberList
                        .filter(
                            (i) =>
                                i &&
                                i.MEMBERSHIPYN == "N" &&
                                i.LIPSTARTYN == "N" &&
                                i.TEL
                        )
                        .map((i) => i.TEL)
                        .join(",");
                case "MEMBERSHIP":
                    return memberList
                        .filter((i) => i && i.MEMBERSHIPYN == "Y" && i.TEL)
                        .map((i) => i.TEL)
                        .join(",");

                case "LIPSTAR":
                    return memberList
                        .filter((i) => i && i.LIPSTARTYN == "Y" && i.TEL)
                        .map((i) => i.TEL)
                        .join(",");
            }
        }
    };

    const onValuesChange = (
        changedValues: FormScheduleValues,
        allValues: FormScheduleValues
    ) => {
        if (changedValues.TYPE) {
            setNotiType(changedValues.TYPE);
            form.setFieldValue("MAP_CONTENT", "");
        }

        if (
            (changedValues.TYPE || changedValues.TO_GROUP) &&
            allValues.TYPE &&
            allValues.TO_GROUP
        ) {
            form.setFieldValue(
                "USER_EMAILS",
                getRecipientListInfo(allValues.TYPE, allValues.TO_GROUP)
            );
        }
    };

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            let status: string | undefined;

            if (typeof e === "string") {
                status = e;
            }

            setNotiType("");

            onClose(status);
            closeDialog();
        },
        [closeDialog, onClose]
    );

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            const params = {
                ...values,
                SCH_DATE: timeService.dateConversion(
                    (values.SCH_DATE as unknown as dayjs.Dayjs)?.format(
                        "YYYY-MM-DD HH:mm:ss"
                    )
                ),
                USER_MOD: userInfo?.USERID ?? "",
            };

            if (item) {
                await NotificationService.updateScheduleNotification({
                    ...params,
                    ID: item.ID,
                });
            } else {
                await NotificationService.insertScheduleNotification(params);
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

            await NotificationService.deleteScheduleNotification({
                ID: item?.ID ?? 0,
                USER_MOD: userInfo?.USERID ?? "",
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
    }, [handleClose, item, openNotification, tCommon, userInfo]);

    const fields: Field[] = useMemo(
        () => [
            {
                name: "SUBJECT",
                label: "NOTI_GRID_SUBJECT",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_SUBJECT",
                colSpan: 12,
            },
            {
                name: "SENDER",
                label: "NOTI_GRID_SENDER",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_SENDER",
                colSpan: 12,
            },
            {
                name: "SENDER_NAME",
                label: "NOTI_GRID_SENDER_NAME",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_SENDER_NAME",
                colSpan: 12,
            },
            {
                name: "NOTE",
                label: "NOTI_GRID_NOTE",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_NOTE",
                colSpan: 12,
            },
            {
                name: "TAS_ID",
                label: "NOTI_GRID_TAS_ID",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_TAS_ID",
                colSpan: 12,
            },
            {
                name: "USER_NAME",
                label: "NOTI_GRID_USER_NAME",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_USER_NAME",
                colSpan: 12,
            },
            {
                name: "TO_GROUP",
                label: "NOTI_GRID_TO_GROUP",
                type: "select",
                required: true,
                placeholder: "NOTI_GRID_TO_GROUP",
                colSpan: 12,
                options: [
                    { value: "SHOP", label: t("NOTI_SCH_SHOP") },
                    { value: "USER", label: t("NOTI_SCH_USER") },
                    { value: "MEMBERSHIP", label: t("NOTI_SCH_MEMBERSHIP") },
                    { value: "LIPSTAR", label: t("NOTI_SCH_LIPSTAR") },
                ],
            },
            {
                name: "TYPE",
                label: "NOTI_GRID_TYPE",
                type: "select",
                required: true,
                placeholder: "NOTI_GRID_TYPE",
                colSpan: 12,
                options: [
                    { value: "EMAIL", label: t("NOTI_SCH_EMAIL") },
                    { value: "SMS", label: t("NOTI_SCH_SMS") },
                ],
            },
            {
                name: "USER_EMAILS",
                label: "NOTI_GRID_USER_EMAILS",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_USER_EMAILS",
                colSpan: 24,
            },
            {
                name: "SCH_DATE",
                label: "NOTI_GRID_SCH_DATE",
                type: "datetime",
                required: true,
                placeholder: "NOTI_GRID_SCH_DATE",
                colSpan: 24,
                minDate: dayjs(),
            },
            {
                name: "MAP_CONTENT",
                label: "NOTI_GRID_MAP_CONTENT",
                type:
                    notiType == "SMS"
                        ? "input"
                        : notiType == "EMAIL"
                        ? "editor"
                        : "display",
                required: true,
                placeholder: "NOTI_GRID_MAP_CONTENT",
                colSpan: 24,
            },
        ],
        [t, notiType]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Notification",
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
                    readonly ? (
                        <Space
                            style={{
                                width: "100%",
                                justifyContent: "flex-end",
                            }}
                        >
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
                        </Space>
                    ) : (
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
                    onValuesChange={onValuesChange}
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
