import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { dialogStore } from "@/store/dialogStore";
import {
    Button,
    Drawer,
    Form,
    Space,
    Row,
    Col,
    Popconfirm,
    Modal,
    Image as ImageAntd,
} from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { Field, useRenderForm } from "@/hooks/useRenderForm";
import { VoteService } from "@/app/services/vote";
import { Rank, Vote } from "@/interfaces/vote";
import timeService from "@/libs/timeService";
import dayjs from "dayjs";
import { useAppStore } from "@/hooks/useAppStore";
import { GoodImage } from "@/interfaces/goods";
import Cropper from "react-easy-crop";
import { FileService } from "@/app/services/file";
import { ArtistService } from "@/app/services/artist";
import { Artist } from "@/interfaces/artist";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";

export const useCreateVoteDialog = dialogStore<Vote>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

type FormValues = {
    TITLE: string;
    DESCRIPTION: string;
    CONTENT: string;
    ARTIST_TYPE: string;
    MAX_DAILY_VOTE: number;
    AMOUNT_PER_VOTE: number;
    ROULETTE_YN: string;
    USE_YN: string;
    START_TIME: string | dayjs.Dayjs;
    END_TIME: string | dayjs.Dayjs;

    artistList: number[];
    IMAGE: (File | Partial<GoodImage>)[];
};

const initFormValues: FormValues = {
    TITLE: "",
    DESCRIPTION: "",
    CONTENT: "",
    ARTIST_TYPE: "A",
    MAX_DAILY_VOTE: 0,
    AMOUNT_PER_VOTE: 0,
    ROULETTE_YN: "N",
    USE_YN: "Y",
    START_TIME: "",
    END_TIME: "",

    artistList: [],
    IMAGE: [],
};

export const CreateVoteDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t } = useTranslation("Vote");
    const { t: tCommon } = useTranslation("Common");
    const { openNotification } = useNotificationContext();

    const { open, item, readonly, closeDialog } = useCreateVoteDialog();
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

    const [artistUserList, setArtistUserList] = useState<Rank[]>([]);
    const [artistList, setArtistList] = useState<Artist[]>([]);
    const [artistType, setArtistType] = useState<string>("");

    const [form] = Form.useForm<FormValues>();

    const imageFileInputRef = useRef<HTMLInputElement>(null);
    const fileInputRefs = useMemo(
        () =>
            new Map<string, React.RefObject<HTMLInputElement>>([
                ["IMAGE", imageFileInputRef],
            ]),
        []
    );

    const { currentCompany, currentPlace, voteList, userInfo } = useAppStore(
        (state) => state
    );

    const editMode = useMemo(() => Boolean(item), [item]);
    const dialogTitle = useMemo(() => {
        if (readonly) {
            return tCommon("CM_DETAIL_RECORD");
        }
        return editMode ? tCommon("CM_EDIT_RECORD") : tCommon("CM_ADD_RECORD");
    }, [editMode, tCommon, readonly]);

    const [uploadedImages, setUploadedImages] = useState<{
        IMAGE: (File | Partial<GoodImage>)[];
    }>({
        IMAGE: [],
    });

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            try {
                if (item) {
                    setUploadedImages({
                        IMAGE: item.THUMB_URL ? [{ URL: item.THUMB_URL }] : [],
                    });

                    setArtistType(item.ARTIST_TYPE);

                    form.setFieldsValue({
                        ...item,
                        IMAGE: item.THUMB_URL ? [{ URL: item.THUMB_URL }] : [],
                        START_TIME: dayjs(
                            timeService.getStrDateParseFromUTC(item.START_TIME)
                        ),
                        END_TIME: dayjs(
                            timeService.getStrDateParseFromUTC(item.END_TIME)
                        ),
                        artistList: artistUserList.map((item) => item.IDOL_PID),
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
    }, [artistUserList, form, item, openNotification]);

    useEffect(() => {
        (async () => {
            try {
                if (item && artistType) {
                    const response = await ArtistService.fetchArtistList({
                        FILTER: "",
                        SORTBY: "D",
                        SORTDIR: "D",
                        PAGENUM: "1",
                        PAGESIZE: "1000",
                        COMID: currentCompany?.COMID ?? 0,
                        PLACEID: currentPlace?.PLACEID ?? 0,
                        ARTIST_TYPE: artistType,
                    });

                    setArtistList(
                        getDataFromPayloadRestful(response)?.[0]?.ITEMS
                    );
                }
            } catch (error) {
                setIsLoading(false);
                console.log("fetch failed: ", error);
            }
        })();
    }, [artistType, currentCompany, currentPlace, item]);

    useEffect(() => {
        (async () => {
            try {
                if (item) {
                    const response = await VoteService.fetchRankList({
                        FILTER: "",
                        EVENT_PID: item.PID,
                    });

                    setArtistUserList(
                        getDataFromPayloadRestful(response)?.[0]?.ITEMS
                    );
                }
            } catch (error) {
                setIsLoading(false);
                console.log("fetch failed: ", error);
            }
        })();
    }, [item]);

    const onValuesChange = (
        changedValues: Partial<FormValues>,
        allValues: FormValues
    ) => {
        if (changedValues.IMAGE) {
            setUploadedImages({
                IMAGE: allValues.IMAGE || [],
            });
        }

        if (changedValues.ARTIST_TYPE) {
            setArtistType(allValues.ARTIST_TYPE);
            form.setFieldsValue({ artistList: [] });
        }
    };

    const handleClose = useCallback(
        (e?: React.MouseEvent | React.KeyboardEvent | string) => {
            console.log("handleClose");

            setArtistType("");

            let status: string | undefined;

            if (typeof e === "string") {
                status = e;
            }

            onClose(status);
            closeDialog();
        },
        [closeDialog, onClose]
    );

    const handleData = (values: FormValues) => {
        const INTERVAL_SECOND = dayjs(values.END_TIME).diff(
            dayjs(values.START_TIME),
            "second"
        );

        return {
            EVENT_PID: item?.PID ?? "",
            COMID: currentCompany?.COMID?.toString(),
            PLACEID: currentPlace?.PLACEID?.toString(),
            THUMB_URL:
                values.IMAGE?.[0] instanceof File ? "" : item?.THUMB_URL ?? "",
            THUMB: "",
            TITLE: values.TITLE,
            CONTENT: values.CONTENT || "",
            DESC: values.DESCRIPTION,
            ARTIST_TYPE: values.ARTIST_TYPE,
            START_TIME: timeService.dateConversion(
                (values.START_TIME as dayjs.Dayjs)?.format(
                    "YYYY-MM-DD HH:mm:ss"
                )
            ),
            USE_YN: values.USE_YN,
            INTERVAL_SECOND: INTERVAL_SECOND,
            EXPIRED: INTERVAL_SECOND.toString(),
            AMOUNT_PER_VOTE: values.AMOUNT_PER_VOTE,
            VOTE_CONFIG_PID:
                voteList.find((item: any) => item.id === values.MAX_DAILY_VOTE)
                    ?.PID || "",
            ROULETTE_YN: values.ROULETTE_YN,
        };
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            if (item) {
                const response = await VoteService.updateVote({
                    ...handleData(values),
                    THUMB_YN: values.IMAGE?.[0] instanceof File ? "Y" : "N",
                    UPDATED_BY: userInfo?.USERID ?? "",
                });

                if (values.IMAGE?.[0] instanceof File) {
                    await FileService.urlFileUpload({
                        URL: response?.RESULT_DATA?.[0]?.THUMB_UPLOAD_URL,
                        FILE: values.IMAGE[0],
                    });
                }

                await VoteService.updateVoteAccount({
                    EVENT_PID: item.PID,
                    IDOL_PIDS: values.artistList.join(","),
                });
            } else {
                const response = await VoteService.insertVote({
                    ...handleData(values),
                    CREATED_BY: userInfo?.USERID ?? "",
                });

                if (values.IMAGE?.[0] instanceof File) {
                    await FileService.urlFileUpload({
                        URL: response?.RESULT_DATA?.[0]?.THUMB_UPLOAD_URL,
                        FILE: values.IMAGE[0],
                    });
                }
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

    const handleDelete = useCallback(async () => {
        try {
            setIsLoading(true);

            if (item)
                await VoteService.deleteVote({
                    ...item,
                    EVENT_PID: item.PID,
                    CONFIRM_YN: "Y",
                    UPDATED_BY: userInfo?.USERID ?? "",
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
                name: "IMAGE",
                label: "IMAGE",
                type: "upload",
                // hidden: !item,
                colSpan: 24,
                edit: true,
                accept: "image/*",
            },
            {
                name: "TITLE",
                label: "TITLE",
                type: "input",
                required: true,
                placeholder: "TITLE",
                colSpan: 12,
            },
            {
                name: "DESCRIPTION",
                label: "DESCRIPTION",
                type: "input",
                placeholder: "DESCRIPTION",
                colSpan: 12,
            },
            {
                name: "ARTIST_TYPE",
                label: "ARTIST_TYPE",
                type: "select",
                required: true,
                placeholder: "ARTIST_TYPE",
                colSpan: 12,
                options: [
                    { value: "G", label: t("GROUP") },
                    { value: "A", label: t("MEMBER") },
                ],
            },
            {
                name: "MAX_DAILY_VOTE",
                label: "MAXIMUM_NUMBER_OF_VOTES",
                type: "select",
                required: true,
                placeholder: "MAXIMUM_NUMBER_OF_VOTES",
                colSpan: 12,
                options: voteList.map((item: any) => ({
                    value: item.id,
                    label: item.NAME,
                })),
            },
            {
                name: "AMOUNT_PER_VOTE",
                label: "NUMBER_OF_HEARTS",
                type: "inputnumber",
                required: true,
                placeholder: "NUMBER_OF_HEARTS",
                colSpan: 12,
            },
            {
                name: "ROULETTE_YN",
                label: "ROULETTE_YN",
                type: "select",
                required: true,
                placeholder: "ROULETTE_YN",
                colSpan: 12,
                options: [
                    { value: "Y", label: tCommon("CM_YN_Y") },
                    { value: "N", label: tCommon("CM_YN_N") },
                ],
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
                name: "START_TIME",
                label: "START_DATE",
                type: "datetime",
                required: true,
                placeholder: "START_DATE",
                colSpan: 12,
                minDate: dayjs(),
                disable: !!item && item.STATUS == "O",
            },
            {
                name: "END_TIME",
                label: "END_DATE",
                type: "datetime",
                required: true,
                placeholder: "END_DATE",
                colSpan: 12,
                minDate: dayjs(),
            },
            {
                name: "CONTENT",
                label: "CONTENT",
                type: "editor",
                placeholder: "CONTENT",
                colSpan: 24,
            },
            {
                name: "artistList",
                label: "VOTE_ARTIST_LIST",
                type: "select",
                mode: "multiple",
                placeholder: "VOTE_ARTIST_LIST",
                colSpan: 24,
                hidden: !item,
                options: (item?.STATUS == "C"
                    ? artistUserList
                    : artistList
                ).map((item: any) => ({
                    value: item.IDOL_PID,
                    label: (
                        <span>
                            <ImageAntd
                                src={item.THUMB_URL}
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
                            {item.ALIAS}
                        </span>
                    ),
                })),
            },
        ],
        [t, voteList, tCommon, item, artistList, artistUserList]
    );

    const { render } = useRenderForm({
        readonly,
        isLoading,
        page: "Vote",
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

                            {item && item.STATUS != "C" && (
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
                            aspect={16 / 9}
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
