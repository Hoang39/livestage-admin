import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Button, Drawer, Form, Space, Row, Col, Popconfirm, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { translateContentByLocale } from "@/utils/handleResponse";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { Category as ICategory } from "@/interfaces/category";
import { CategoryService } from "@/app/services/category";
import { GoodImage } from "@/interfaces/goods";
import Cropper from "react-easy-crop";
import { handleImagePath } from "@/utils/handleImage";
import { FileService } from "@/app/services/file";

export const useCategoryDialog = dialogStore<ICategory>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    IMAGE?: (File | Partial<GoodImage>)[];
    NAME_EN: string;
    NAME_KO: string;
    NAME_VI: string;
    DESCRIPTION: string;
    ORDERSEQ: number;
    USEYN: string;
};

const initFormValues: FormValues = {
    IMAGE: [],
    NAME_EN: "",
    NAME_KO: "",
    NAME_VI: "",
    DESCRIPTION: "",
    ORDERSEQ: 0,
    USEYN: "",
};

export const CategoryDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useCategoryDialog();
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
                    setUploadedImages({
                        IMAGE: item.IMAGE
                            ? [{ URL: handleImagePath(item.IMAGE) }]
                            : [],
                    });

                    form.setFieldsValue({
                        DESCRIPTION: item.DESCRIPTION,
                        ORDERSEQ: item.ORDERSEQ,
                        USEYN: item.USEYN,
                        IMAGE: item.IMAGE
                            ? [{ URL: handleImagePath(item.IMAGE) }]
                            : [],
                        NAME_EN: translateContentByLocale(item.NAME, "en_US"),
                        NAME_KO: translateContentByLocale(item.NAME, "ko_KR"),
                        NAME_VI: translateContentByLocale(item.NAME, "vi_VN"),
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
        changedValues: FormValues,
        allValues: FormValues
    ) => {
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
                let responseImage;

                if (values.IMAGE?.[0] instanceof File) {
                    responseImage = await FileService.fileUpload({
                        FILES: values.IMAGE,
                        uploadConfig: {
                            folderId: "P",
                            module: "CATEGORY",
                            imageId: item.CATEGORYID,
                        },
                    });
                }

                await CategoryService.updateCategoryList({
                    CATEGORYID: item.CATEGORYID,
                    IMAGE: responseImage?.[0]?.URL ?? item.IMAGE,
                    DESCRIPTION: values.DESCRIPTION,
                    USEYN: values.USEYN,
                    ORDERSEQ: values.ORDERSEQ,
                    KEYNAME: "",
                    NAME: JSON.stringify({
                        en_US: values.NAME_EN,
                        ko_KR: values.NAME_KO,
                        vi_VN: values.NAME_VI,
                    }),
                });
            } else {
                await CategoryService.insertCategoryList({
                    IMAGE: "",
                    DESCRIPTION: values.DESCRIPTION,
                    USEYN: values.USEYN,
                    ORDERSEQ: values.ORDERSEQ,
                    KEYNAME: "",
                    NAME: JSON.stringify({
                        en_US: values.NAME_EN,
                        ko_KR: values.NAME_KO,
                        vi_VN: values.NAME_VI,
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

            await CategoryService.deleteCategoryList({
                CATEGORYID: item?.CATEGORYID ?? 0,
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
                name: "NAME_EN",
                label: "CATEGORY_GRID_NAME_EN",
                type: "input",
                required: true,
                placeholder: "CATEGORY_GRID_NAME_EN",
                colSpan: 8,
            },
            {
                name: "NAME_KO",
                label: "CATEGORY_GRID_NAME_KO",
                type: "input",
                required: true,
                placeholder: "CATEGORY_GRID_NAME_KO",
                colSpan: 8,
            },
            {
                name: "NAME_VI",
                label: "CATEGORY_GRID_NAME_VI",
                type: "input",
                required: true,
                placeholder: "CATEGORY_GRID_NAME_VI",
                colSpan: 8,
            },
            {
                name: "DESCRIPTION",
                label: "CATEGORY_GRID_DESCRIPTION",
                type: "input",
                required: true,
                placeholder: "CATEGORY_GRID_DESCRIPTION",
                colSpan: 12,
            },
            {
                name: "ORDERSEQ",
                label: "CATEGORY_GRID_ORDERSEQ",
                type: "input",
                required: true,
                placeholder: "CATEGORY_GRID_ORDERSEQ",
                colSpan: 12,
            },
            {
                name: "USEYN",
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
                name: "IMAGE",
                label: "CATEGORY_GRID_IMAGE",
                type: "upload",
                hidden: !item,
                colSpan: 24,
                edit: true,
                accept: "image/*",
            },
        ],
        [item, tCommon]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Category",
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
                            aspect={1}
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
