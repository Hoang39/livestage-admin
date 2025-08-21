import { useState, useEffect, useMemo, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { translateContentByLocale } from "@/utils/handleResponse";
import { Mission } from "@/interfaces/reward";
import timeService from "@/libs/timeService";
import dayjs from "dayjs";
import { RewardService } from "@/app/services/reward";

export const useMissionDialog = dialogStore<Mission>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    MISSION_NAME_EN: string;
    MISSION_NAME_KO: string;
    MISSION_NAME_VI: string;
    DESCRIPTION_EN: string;
    DESCRIPTION_KO: string;
    DESCRIPTION_VI: string;
    REWARD_AMOUNT: number;
    LIMIT_COUNT: number;
    USE_YN: string;
    EFFECTIVE_TIME: string | dayjs.Dayjs;
    EXPIRED_TIME: string | dayjs.Dayjs;
};
export const MissionDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tVote } = useTranslation("Vote");

    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useMissionDialog();
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
                        MISSION_NAME_EN: translateContentByLocale(
                            item.MISSION_NAME,
                            "en_US"
                        ),
                        MISSION_NAME_KO: translateContentByLocale(
                            item.MISSION_NAME,
                            "ko_KR"
                        ),
                        MISSION_NAME_VI: translateContentByLocale(
                            item.MISSION_NAME,
                            "vi_VN"
                        ),
                        DESCRIPTION_EN: translateContentByLocale(
                            item.DESCRIPTION,
                            "en_US"
                        ),
                        DESCRIPTION_KO: translateContentByLocale(
                            item.DESCRIPTION,
                            "ko_KR"
                        ),
                        DESCRIPTION_VI: translateContentByLocale(
                            item.DESCRIPTION,
                            "vi_VN"
                        ),
                        EFFECTIVE_TIME: dayjs(
                            timeService.getStrDateParseFromUTC(
                                item.EFFECTIVE_TIME
                            )
                        ),
                        EXPIRED_TIME: dayjs(
                            timeService.getStrDateParseFromUTC(
                                item.EXPIRED_TIME
                            )
                        ),
                    });
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
                await RewardService.updateMission({
                    ...item,
                    ...values,
                    MISSION_NAME: JSON.stringify({
                        vi_VN: values.MISSION_NAME_VI,
                        en_US: values.MISSION_NAME_EN,
                        ko_KR: values.MISSION_NAME_KO,
                    }),
                    DESCRIPTION: JSON.stringify({
                        vi_VN: values.DESCRIPTION_VI,
                        en_US: values.DESCRIPTION_EN,
                        ko_KR: values.DESCRIPTION_KO,
                    }),
                    EFFECTIVE_TIME: timeService.dateConversion(
                        (values.EFFECTIVE_TIME as dayjs.Dayjs)?.format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                    ),
                    EXPIRED_TIME: timeService.dateConversion(
                        (values.EXPIRED_TIME as dayjs.Dayjs)?.format(
                            "YYYY-MM-DD HH:mm:ss"
                        )
                    ),
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

    const fields: Field[] = useMemo(
        () => [
            {
                name: "MISSION_NAME_EN",
                label: "MISSION_NAME_EN",
                type: "input",
                required: true,
                placeholder: "MISSION_NAME_EN",
                colSpan: 24,
            },
            {
                name: "MISSION_NAME_KO",
                label: "MISSION_NAME_KO",
                type: "input",
                required: true,
                placeholder: "MISSION_NAME_KO",
                colSpan: 24,
            },
            {
                name: "MISSION_NAME_VI",
                label: "MISSION_NAME_VI",
                type: "input",
                required: true,
                placeholder: "MISSION_NAME_VI",
                colSpan: 24,
            },
            {
                name: "DESCRIPTION_EN",
                label: "DESCRIPTION_EN",
                type: "input",
                placeholder: "DESCRIPTION_EN",
                colSpan: 24,
            },
            {
                name: "DESCRIPTION_KO",
                label: "DESCRIPTION_KO",
                type: "input",
                placeholder: "DESCRIPTION_KO",
                colSpan: 24,
            },
            {
                name: "DESCRIPTION_VI",
                label: "DESCRIPTION_VI",
                type: "input",
                placeholder: "DESCRIPTION_VI",
                colSpan: 24,
            },
            {
                name: "REWARD_AMOUNT",
                label: "NUMBER_OF_HEARTS",
                type: "inputnumber",
                required: true,
                placeholder: "NUMBER_OF_HEARTS",
                colSpan: 12,
                min: 0,
            },
            {
                name: "LIMIT_COUNT",
                label: "LIMIT",
                type: "select",
                required: true,
                placeholder: "LIMIT",
                colSpan: 12,
                options: [1, 3, 5, 10].map((item) => ({
                    value: item,
                    label: `${item}`,
                })),
            },
            {
                name: "USE_YN",
                label: tCommon("CM_USEYN"),
                type: "select",
                required: true,
                placeholder: tCommon("CM_USEYN"),
                colSpan: 12,
                options: [
                    { value: "Y", label: tCommon("CM_YN_Y") },
                    { value: "N", label: tCommon("CM_YN_N") },
                ],
            },
            {
                name: "EFFECTIVE_TIME",
                label: tVote("START_DATE"),
                type: "datetime",
                required: true,
                placeholder: tVote("START_DATE"),
                colSpan: 12,
            },
            {
                name: "EXPIRED_TIME",
                label: tVote("END_DATE"),
                type: "datetime",
                required: true,
                placeholder: tVote("END_DATE"),
                colSpan: 12,
            },
        ],
        [tCommon, tVote]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Locale",
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
