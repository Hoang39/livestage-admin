import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
    Modal,
} from "antd";
import { useTranslation } from "react-i18next";
import {
    getDataFromPayloadRestful,
    translateContent,
} from "@/utils/handleResponse";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { Good, GoodImage } from "@/interfaces/goods";
import dayjs from "dayjs";
import timeService from "@/libs/timeService";
import { BannerService } from "@/app/services/banner";
import { Banner } from "@/interfaces/banner";
import Cropper from "react-easy-crop";
import { useAppStore } from "@/hooks/useAppStore";
import { Broadcast } from "@/interfaces/broadcast";
import { BroadcastService } from "@/app/services/broadcast";
import { Template } from "@/interfaces/template";
import { TemplateService } from "@/app/services/template";
import { CommonService } from "@/app/services/common";
import { handleImagePath } from "@/utils/handleImage";
import { FileService } from "@/app/services/file";

export const useBannerDialog = dialogStore<Partial<Banner>>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormBannerValues = {
    IMAGE?: (File | Partial<GoodImage>)[];
    LIVE_PID?: string;
    GOODS_PID?: string;
    METADATA?: string;
    TITLE: string;
    TYPE: string;
    DATA_DISPLAY: string;
    START_DATE: string | dayjs.Dayjs;
    END_DATE: string | dayjs.Dayjs;
    CATEGORY_ID: string;
    USE_YN: string;
    SORT_NO?: number;
};

const initFormValues: FormBannerValues = {
    IMAGE: [],
    TITLE: "",
    TYPE: "",
    DATA_DISPLAY: "",
    START_DATE: "",
    END_DATE: "",
    CATEGORY_ID: "",
    USE_YN: "",
    SORT_NO: undefined,
};

export const BannerDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Banner");
    const { t: tCommon } = useTranslation("Common");
    const { t: tBroadcast } = useTranslation("Broadcast");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useBannerDialog();
    const [isLoading, setIsLoading] = useState(false);
    const [isCropModalVisible, setIsCropModalVisible] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<{
        url: string;
        fieldName: any;
        file: File;
    } | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const imageFileInputRef = useRef<HTMLInputElement>(null);

    const [uploadedImages, setUploadedImages] = useState<{
        IMAGE: (File | Partial<GoodImage>)[];
    }>({
        IMAGE: [],
    });

    const fileInputRefs = useMemo(
        () =>
            new Map<string, React.RefObject<HTMLInputElement>>([
                ["IMAGE", imageFileInputRef],
            ]),
        []
    );

    const [bannerType, setBannerType] = useState("");
    const { categoryList, userInfo } = useAppStore((state) => state);
    const [templateList, setTemplateList] = useState<Template[]>([]);
    const [goodsList, setGoodsList] = useState<Good[]>([]);
    const [broadcastList, setBroadcastList] = useState<Broadcast[]>([]);

    const [form] = Form.useForm<FormBannerValues>();

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
                if (item?.PID) {
                    setUploadedImages({
                        IMAGE: item.IMAGE_URL
                            ? [{ URL: handleImagePath(item.IMAGE_URL) }]
                            : [],
                    });

                    setBannerType(item.TYPE ?? "");

                    form.setFieldsValue({
                        ...item,
                        START_DATE: dayjs(
                            timeService.getStrDateParseFromUTC(
                                item?.START_DATE ?? ""
                            )
                        ),
                        END_DATE: dayjs(
                            timeService.getStrDateParseFromUTC(
                                item?.END_DATE ?? ""
                            )
                        ),
                        IMAGE: item.IMAGE_URL
                            ? [{ URL: handleImagePath(item.IMAGE_URL) }]
                            : [],
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

    const onValuesChange = (
        changedValues: FormBannerValues,
        allValues: FormBannerValues
    ) => {
        if (changedValues.TYPE) {
            setBannerType(changedValues.TYPE);
            form.setFieldValue("DATA_DISPLAY", "");
        }

        if (changedValues.IMAGE) {
            setUploadedImages({
                IMAGE: allValues.IMAGE || [],
            });
        }
    };

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            let status: string | undefined;

            if (typeof e === "string") {
                status = e;
            }

            setBannerType("");

            onClose(status);
            closeDialog();
        },
        [closeDialog, onClose]
    );

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            console.log("values: ", values);

            setIsLoading(true);

            if (item?.PID) {
                let responseImage;

                if (values.IMAGE?.[0] instanceof File) {
                    responseImage = await FileService.fileUpload({
                        FILES: values.IMAGE,
                        uploadConfig: {
                            folderId: "B",
                            module: "BANNER",
                            imageId: item.PID,
                        },
                    });

                    await BannerService.updateBannerFile({
                        BANNER_PID: item.PID,
                        FILE_PATH: responseImage?.[0]?.NEW_FILE_NAME ?? "",
                        DIV: "C",
                        IMAGE_URL: responseImage?.[0]?.URL ?? "",
                        MAIN_TF: item.MAIN_TF ?? "",
                    });

                    if (item.IMAGE_URL) {
                        await FileService.deleteFile({
                            IMAGE_URL: item.IMAGE_URL,
                            IMAGE_TYPE: "B",
                        });
                    }
                }

                await BannerService.updateBanners({
                    TITLE: values.TITLE,
                    TYPE: values.TYPE,
                    USE_YN: values.USE_YN,
                    START_DATE: timeService.dateConversion(
                        (values.START_DATE as dayjs.Dayjs)?.format("YYYY-MM-DD")
                    ),
                    END_DATE: timeService.dateConversion(
                        (values.END_DATE as dayjs.Dayjs)?.format("YYYY-MM-DD")
                    ),
                    MAIN_TF: item.MAIN_TF ?? "",
                    BANNER_PID: item.PID,
                    SORT_NO: values.SORT_NO ?? 0,
                    CATEGORY_ID:
                        item.MAIN_TF == "F" ? values.CATEGORY_ID : undefined,
                    ...(values.TYPE == "L"
                        ? { LIVE_PID: values.LIVE_PID }
                        : values.TYPE == "G"
                        ? { GOODS_PID: values.GOODS_PID }
                        : values.TYPE == "N"
                        ? {}
                        : { METADATA: values.DATA_DISPLAY }),
                });
            } else {
                await BannerService.insertBanners({
                    TITLE: values.TITLE,
                    TYPE: values.TYPE,
                    USE_YN: values.USE_YN,
                    START_DATE: timeService.dateConversion(
                        (values.START_DATE as dayjs.Dayjs)?.format("YYYY-MM-DD")
                    ),
                    END_DATE: timeService.dateConversion(
                        (values.END_DATE as dayjs.Dayjs)?.format("YYYY-MM-DD")
                    ),
                    MAIN_TF: item?.MAIN_TF ?? "",
                    SORT_NO: values.SORT_NO ?? 0,
                    CATEGORY_ID:
                        item?.MAIN_TF == "F" ? values.CATEGORY_ID : undefined,
                    ...(values.TYPE == "L"
                        ? { LIVE_PID: values.LIVE_PID }
                        : values.TYPE == "G"
                        ? { GOODS_PID: values.GOODS_PID }
                        : values.TYPE == "N"
                        ? {}
                        : { METADATA: values.DATA_DISPLAY }),
                });
            }

            openNotification(
                "success",
                tCommon(item?.PID ? "update-successful" : "create-successful"),
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
                tCommon(item?.PID ? "update-failed" : "create-failed"),
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

            await BannerService.deleteBanners({
                BANNER_PID: item?.PID ?? "",
                MAIN_TF: item?.MAIN_TF ?? "T",
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

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: any
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageToCrop({
                    url: event.target?.result as string,
                    fieldName,
                    file,
                });
                setIsCropModalVisible(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropOk = () => {
        if (imageToCrop && croppedAreaPixels) {
            const image = new Image();
            image.src = imageToCrop.url;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            if (ctx) {
                ctx.drawImage(
                    image,
                    croppedAreaPixels.x,
                    croppedAreaPixels.y,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height,
                    0,
                    0,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height
                );

                canvas.toBlob((blob) => {
                    if (blob) {
                        const croppedFile = new File(
                            [blob],
                            imageToCrop.file.name,
                            {
                                type: imageToCrop.file.type,
                                lastModified: imageToCrop.file.lastModified,
                            }
                        );

                        setUploadedImages({
                            ...uploadedImages,
                            [imageToCrop.fieldName]: [croppedFile],
                        });

                        form.setFieldValue(imageToCrop.fieldName, [
                            croppedFile,
                        ]);
                    }
                }, imageToCrop.file.type);
            }
        }
        setIsCropModalVisible(false);
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    const handleCropCancel = () => {
        setIsCropModalVisible(false);
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    const fields: Field[] = useMemo(
        () => [
            {
                name: "TITLE",
                label: "BANNER_GRID_TITLE",
                type: "input",
                required: true,
                placeholder: "BANNER_GRID_TITLE",
                colSpan: 24,
            },
            {
                name: "START_DATE",
                label: "BANNER_GRID_START_DATE",
                type: "date",
                required: true,
                placeholder: "BANNER_GRID_START_DATE",
                colSpan: 12,
            },
            {
                name: "END_DATE",
                label: "BANNER_GRID_END_DATE",
                type: "date",
                required: true,
                placeholder: "BANNER_GRID_END_DATE",
                colSpan: 12,
            },
            {
                name: "TYPE",
                label: "BANNER_GRID_TYPE",
                type: "select",
                required: true,
                placeholder: "BANNER_GRID_TYPE",
                colSpan: 12,
                options: [
                    { value: "N", label: t("BANNER_GRID_TYPE_O_N") },
                    { value: "L", label: t("BANNER_GRID_TYPE_O_L") },
                    { value: "G", label: t("BANNER_GRID_TYPE_O_G") },
                    { value: "U", label: t("BANNER_GRID_TYPE_O_U") },
                    { value: "T", label: t("BANNER_GRID_TYPE_O_T") },
                ],
            },
            {
                name:
                    bannerType == "G"
                        ? "GOODS_PID"
                        : bannerType == "L"
                        ? "LIVE_PID"
                        : "DATA_DISPLAY",
                label: "BANNER_GRID_DATA_DISPLAY",
                type:
                    bannerType == "N"
                        ? "display"
                        : bannerType == "U"
                        ? "input"
                        : "select",
                required: true,
                placeholder: "BANNER_GRID_DATA_DISPLAY",
                colSpan: 12,
                disable: bannerType == "N",
                style: bannerType == "L" && {
                    height: 60,
                },
                filterOption:
                    bannerType == "G" || bannerType == "L"
                        ? (input, option) =>
                              (option?.labelText ?? "")
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                        : undefined,
                options:
                    bannerType == "T"
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
                        : bannerType == "G"
                        ? goodsList.map((item) => ({
                              value: `${item.GOODSID}`,
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
                name: "SORT_NO",
                label: "BANNER_GRID_SORT_NO",
                type: "inputnumber",
                required: true,
                placeholder: "BANNER_GRID_SORT_NO",
                colSpan: 12,
                min: 0,
            },
            {
                name: "CATEGORY_ID",
                label: tBroadcast("BROADCAST_GRID_1_CATEGORY_ID"),
                type: "select",
                // required: true,
                placeholder: tBroadcast("BROADCAST_GRID_1_CATEGORY_ID"),
                colSpan: 12,
                hidden: item?.MAIN_TF == "T",
                options: categoryList.map((item) => ({
                    value: item.CATEGORYID,
                    label: item.NAME,
                })),
            },
            {
                name: "IMAGE",
                label: "BANNER_GRID_IMAGE_URL",
                type: "upload",
                hidden: !item?.PID,
                colSpan: 24,
                edit: true,
                accept: "image/*",
                width: item?.MAIN_TF == "T" ? undefined : 200,
            },
        ],
        [
            t,
            bannerType,
            templateList,
            goodsList,
            broadcastList,
            tCommon,
            tBroadcast,
            item,
            categoryList,
        ]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Banner",
        fileInputRefs,
        uploadedImages,
        handleFileChange,
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

                            {item?.PID && (
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

            <Modal
                title={tCommon("CM_CROP_IMAGE")}
                open={isCropModalVisible}
                onOk={handleCropOk}
                onCancel={handleCropCancel}
                okText={tCommon("Confirm")}
                cancelText={tCommon("Cancel")}
                style={{ zIndex: 9999 }}
            >
                {imageToCrop && (
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            height: 300,
                        }}
                    >
                        <Cropper
                            image={imageToCrop.url}
                            crop={crop}
                            zoom={zoom}
                            aspect={item?.MAIN_TF === "T" ? 1 : 24 / 9}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                )}
            </Modal>
        </>
    );
};
