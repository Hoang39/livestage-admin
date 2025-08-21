import { useState, useEffect, useMemo, useCallback } from "react";
import { Notification } from "@/interfaces/notification";
import { dialogStore } from "@/store/dialogStore";
import {
    Button,
    Drawer,
    Form,
    Space,
    Row,
    Col,
    Image as ImageAntd,
    Flex,
    Popconfirm,
} from "antd";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
    translateContentByLocale,
} from "@/utils/handleResponse";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { TemplateService } from "@/app/services/template";
import { useAppStore } from "@/hooks/useAppStore";
import { Template } from "@/interfaces/template";
import { Good } from "@/interfaces/goods";
import { CommonService } from "@/app/services/common";
import { BroadcastService } from "@/app/services/broadcast";
import { Broadcast } from "@/interfaces/broadcast";
import { NotificationService } from "@/app/services/notification";
import dayjs from "dayjs";
import timeService from "@/libs/timeService";

export const useNotificationDialog = dialogStore<Notification>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormNotificationValues = {
    TITLE_EN: string;
    TITLE_KO: string;
    TITLE_VI: string;
    BODY_EN: string;
    BODY_KO: string;
    BODY_VI: string;
    SEND_STATUS: string;
    PUSH_YN: string;
    TYPE: string;
    INFO: string;
    SCH_DATE: string | dayjs.Dayjs;
    CRT_DATE: string;
};

const initFormValues: FormNotificationValues = {
    TITLE_EN: "",
    TITLE_KO: "",
    TITLE_VI: "",
    BODY_EN: "",
    BODY_KO: "",
    BODY_VI: "",
    SEND_STATUS: "",
    PUSH_YN: "",
    TYPE: "",
    INFO: "",
    SCH_DATE: "",
    CRT_DATE: "",
};

export const NotificationDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Notification");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useNotificationDialog();
    const [isLoading, setIsLoading] = useState(false);

    const [notiType, setNotiType] = useState("");
    const [status, setStatus] = useState("");

    const [templateList, setTemplateList] = useState<Template[]>([]);
    const [goodsList, setGoodsList] = useState<Good[]>([]);
    const [broadcastList, setBroadcastList] = useState<Broadcast[]>([]);

    const { currentCompany, currentPlace, userInfo } = useAppStore(
        (state) => state
    );

    const [form] = Form.useForm<FormNotificationValues>();

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    useEffect(() => {
        const fetchData = async () => {
            const templateResponse = await TemplateService.fetchAllAppTemplate(
                {}
            );
            setTemplateList(getDataFromPayloadRestful(templateResponse));

            const goodsResponse = await CommonService.getGoodsList({
                COMID: 0,
                PLACEID: 0,
                USEYN: "",
                SELLFLAG: "",
                REFID: "",
                USERID: userInfo?.USERID ?? "",
            });
            setGoodsList(getDataFromPayloadRestful(goodsResponse));

            const broadcastResponse = await BroadcastService.fetchBroadcasts({
                ALL_TF: "T",
            });
            setBroadcastList(getDataFromPayloadRestful(broadcastResponse));
        };

        fetchData();
    }, [userInfo]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                if (item) {
                    const config = item.CONFIG_DATA
                        ? JSON.parse(item.CONFIG_DATA)
                        : "";

                    const configAction = config["ACTION"];
                    const configInfo =
                        configAction == "LINK"
                            ? config["URL"]
                            : configAction == "TEMPLATE"
                            ? config["TEMPLATE_ID"]
                            : configAction == "ROUTE_VID"
                            ? config["LIVE_PID"]
                            : configAction == "ROUTE_GOODS"
                            ? config["GOODS_ID"]
                            : "";

                    setNotiType(configAction);

                    form.setFieldsValue({
                        TITLE_EN: translateContentByLocale(item.TITLE, "en_US"),
                        TITLE_KO: translateContentByLocale(item.TITLE, "ko_KR"),
                        TITLE_VI: translateContentByLocale(item.TITLE, "vi_VN"),
                        BODY_EN: translateContentByLocale(item.BODY, "en_US"),
                        BODY_KO: translateContentByLocale(item.BODY, "ko_KR"),
                        BODY_VI: translateContentByLocale(item.BODY, "vi_VN"),
                        SEND_STATUS: item.SEND_STATUS,
                        PUSH_YN: item.PUSH_YN,
                        TYPE: configAction,
                        INFO: configInfo,
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

    const onValuesChange = (
        changedValues: FormNotificationValues,
        _allValues: FormNotificationValues
    ) => {
        if (changedValues.TYPE) {
            setNotiType(changedValues.TYPE);
            form.setFieldValue("INFO", "");
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

    const handleDataConversion = useCallback(
        (data: Partial<FormNotificationValues>) => {
            const body = JSON.stringify({
                vi_VN: data.BODY_VI,
                en_US: data.BODY_EN,
                ko_KR: data.BODY_KO,
            });
            const title = JSON.stringify({
                vi_VN: data.TITLE_VI,
                en_US: data.TITLE_EN,
                ko_KR: data.TITLE_KO,
            });

            const payload =
                data.TYPE == "LINK"
                    ? { URL: data.INFO?.trim() ?? "" }
                    : data.TYPE == "TEMPLATE"
                    ? { TEMPLATE_ID: data.INFO }
                    : data.TYPE == "ROUTE_GOODS"
                    ? { GOODS_ID: data.INFO }
                    : { LIVE_PID: data.INFO, STATE: status };

            const config = JSON.stringify({
                ACTION: data.TYPE,
                ...payload,
            });
            return {
                ...(item
                    ? {
                          ...item,
                          rowStatus: "U",
                          PID: item.PUSH_PID,
                          SEND_STATUS: item.SEND_STATUS,
                      }
                    : {
                          rowStatus: "I",
                          SEND_STATUS: "I",
                      }),
                BODY: body,
                CONFIG_DATA: config,
                DESC: "",
                NDATA: JSON.stringify({
                    body: body,
                    title: title,
                    data: JSON.stringify({
                        payload: payload,
                        action: data.TYPE,
                        id: "",
                        type: "SYS",
                    }),
                }),
                SCH_DATE: timeService.dateConversion(
                    (data.SCH_DATE as dayjs.Dayjs)?.format(
                        "YYYY-MM-DD HH:mm:ss"
                    )
                ),
                TITLE: title,
            };
        },
        [status, item]
    );

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            if (item) {
                await NotificationService.updateNoti(
                    handleDataConversion(values)
                );
            } else {
                await NotificationService.insertNoti(
                    handleDataConversion(values)
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

            await NotificationService.deleteNoti(item ?? {});

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
                label: "NOTI_GRID_TITLE_EN",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_TITLE_EN",
                colSpan: 24,
            },
            {
                name: "TITLE_KO",
                label: "NOTI_GRID_TITLE_KO",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_TITLE_KO",
                colSpan: 24,
            },
            {
                name: "TITLE_VI",
                label: "NOTI_GRID_TITLE_VI",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_TITLE_VI",
                colSpan: 24,
            },
            {
                name: "BODY_EN",
                label: "NOTI_GRID_BODY_EN",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_BODY_EN",
                colSpan: 24,
            },
            {
                name: "BODY_KO",
                label: "NOTI_GRID_BODY_KO",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_BODY_KO",
                colSpan: 24,
            },
            {
                name: "BODY_VI",
                label: "NOTI_GRID_BODY_VI",
                type: "input",
                required: true,
                placeholder: "NOTI_GRID_BODY_VI",
                colSpan: 24,
            },
            {
                name: "SEND_STATUS",
                label: "NOTI_GRID_SEND_STATUS",
                type: "select",
                required: true,
                placeholder: "NOTI_GRID_SEND_STATUS",
                colSpan: 24,
                options: [
                    { value: "S", label: t("NOTI_GRID_SEND_STATUS_O_S") },
                    { value: "I", label: t("NOTI_GRID_SEND_STATUS_O_I") },
                ],
                disable: true,
                hidden: !item,
            },
            {
                name: "TYPE",
                label: "NOTI_GRID_ACTION",
                type: "select",
                required: true,
                placeholder: "NOTI_GRID_ACTION",
                colSpan: 12,
                options: [
                    { value: "LINK", label: "LINK" },
                    { value: "TEMPLATE", label: "TEMPLATE" },
                    { value: "ROUTE_VID", label: "ROUTE_VID" },
                    { value: "ROUTE_GOODS", label: "ROUTE_GOODS" },
                ],
            },
            {
                name: "PUSH_YN",
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
                name: "INFO",
                label: "NOTI_GRID_DATA_INFO",
                type:
                    notiType == "LINK"
                        ? "input"
                        : notiType
                        ? "select"
                        : "display",
                required: true,
                placeholder: "NOTI_GRID_DATA_INFO",
                colSpan: 24,
                style: notiType == "ROUTE_VID" && {
                    height: 60,
                },
                filterOption:
                    notiType == "ROUTE_GOODS" || notiType == "ROUTE_VID"
                        ? (input, option) =>
                              (option?.labelText ?? "")
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                        : undefined,
                options:
                    notiType == "TEMPLATE"
                        ? templateList
                              .reduce((acc: string[], item) => {
                                  if (!acc.includes(item.KEYNAME)) {
                                      acc.push(item.KEYNAME);
                                  }
                                  return acc;
                              }, [])
                              .map((item) => ({
                                  value: item,
                                  label: item,
                              }))
                        : notiType == "ROUTE_GOODS"
                        ? goodsList.map((item) => ({
                              value: item.GOODSID,
                              label: (
                                  <span>
                                      <ImageAntd
                                          src={item.THUMURL}
                                          preview={false}
                                          alt=""
                                          style={{
                                              width: 20,
                                              height: 20,
                                              objectFit: "cover",
                                              borderRadius: 4,
                                              marginRight: 8,
                                          }}
                                          fallback="data:image/png;base64,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"
                                      />
                                      {translateContent(item.NAME)}
                                  </span>
                              ),
                              labelText: translateContent(item.NAME),
                          }))
                        : broadcastList.map((item) => ({
                              value: item.PID,
                              label: (
                                  <Flex gap="middle" align="center">
                                      <ImageAntd
                                          src={item.IMAGE_URL}
                                          preview={false}
                                          alt=""
                                          style={{
                                              width: 50,
                                              height: 50,
                                              objectFit: "cover",
                                              borderRadius: 4,
                                              marginRight: 8,
                                          }}
                                          fallback="data:image/png;base64,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"
                                      />
                                      <Flex
                                          vertical
                                          gap="4"
                                          style={{
                                              fontSize: 12,
                                              lineHeight: "20px",
                                          }}
                                      >
                                          <span>
                                              <strong>{item.TITLE}</strong>
                                          </span>
                                          <span>{`${item.USER_NAME} (${item.ALIAS})`}</span>
                                          <span
                                              style={{
                                                  fontSize: 10,
                                                  fontStyle: "italic",
                                                  color: "gray",
                                              }}
                                          >{`${item.SCH_START_DATE} - ${item.SCH_END_DATE}`}</span>
                                      </Flex>
                                  </Flex>
                              ),
                              labelText: item.TITLE,
                          })),
                onChange: (value: any) => {
                    if (notiType == "ROUTE_VID") {
                        const selectedItem = broadcastList.find(
                            (item) => item.PID == value
                        );
                        setStatus(selectedItem?.STATE ?? "F");
                    }
                },
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
        ],
        [t, item, tCommon, notiType, templateList, goodsList, broadcastList]
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

                            {item?.SEND_STATUS == "I" && (
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
