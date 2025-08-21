import {
    Button,
    Col,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Row,
    Select,
    Image,
    DatePicker,
} from "antd";
import {
    UploadOutlined,
    DeleteOutlined,
    PlusOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { useLocale } from "@/configs/localeConfig";
import { useTranslation } from "react-i18next";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/ko";
import "dayjs/locale/vi";
import TextEditor from "@/components/textEditor";
import { PlayButton } from "@/components/button/playButton";

export interface Field {
    key?: string;
    label: string;
    name: string | string[];
    type:
        | "input"
        | "inputnumber"
        | "textarea"
        | "select"
        | "display"
        | "upload"
        | "video"
        | "date"
        | "datetime"
        | "editor"
        | "options"
        | "button";
    hidden?: boolean;
    required?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
    edit?: boolean;
    step?: number;
    options?: { label: string | JSX.Element; value: string | number }[];
    accept?: string;
    colSpan?: number;
    children?: Field[];
    mode?: "multiple" | "tags";
    maxCount?: number;
    size?: "large" | "middle" | "small";
    style?: any;
    format?: string;
    disable?: boolean;
    defaultValue?: any;
    minDate?: Dayjs;
    width?: number;
    height?: number;
    onClick?: () => void;
    onChange?: (value: any) => void;
    filterOption?: (input: string, option: any) => boolean;
    onSave?: (index: number, fieldName: string | string[]) => void;
    onDelete?: (
        index: number,
        fieldName: string | string[],
        remove: () => void
    ) => void;
}

type RenderFieldProps = {
    readonly?: boolean;
    isLoading: boolean;
    page: string;
    fileInputRefs?: Map<
        string,
        React.MutableRefObject<HTMLInputElement | null>
    >;
    uploadedImages?: Record<string, any[]>;
    handleAdd?: (add: () => void, name: string) => void;
    handleDeleteImage?: (index: number, fieldName: string, file: any) => void;
    handleFileChange?: (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: string
    ) => void;
};

export const useRenderForm = (props: RenderFieldProps) => {
    const {
        translateRequiredMessage,
        translateLimitMessage,
        translateMinMessage,
    } = useLocale({ page: props.page });

    const { t } = useTranslation(props.page);
    const { t: tCommon } = useTranslation("Common");
    const { t: tLocale } = useTranslation("Locale");
    const { i18n } = useTranslation();

    dayjs.locale(i18n.language ?? "en");

    const render = (field: Field) => {
        if (field.hidden) return null;

        if (field.type === "options" && field.children) {
            return (
                <Form.List name={field.name}>
                    {(fields, { add, remove }) => {
                        return (
                            <Form.Item
                                label={
                                    <span
                                        style={{
                                            fontWeight: 600,
                                        }}
                                    >
                                        {t(field.label)}
                                    </span>
                                }
                                // name={field.name}
                                key={field.key}
                            >
                                {fields?.length ? (
                                    <div>
                                        {fields.map(({ key, name }) => (
                                            <div
                                                key={key}
                                                style={{
                                                    border: "1px solid rgba(0, 0, 0, 0.15)",
                                                    padding: 16,
                                                    borderRadius: 4,
                                                    marginBottom: 16,
                                                    position: "relative",
                                                    background:
                                                        "rgba(200, 200, 200, 0.15)",
                                                }}
                                            >
                                                <Row gutter={8}>
                                                    {field.children?.map(
                                                        (
                                                            child: any,
                                                            childIndex: number
                                                        ) => (
                                                            <Col
                                                                span={
                                                                    child.colSpan
                                                                }
                                                                key={childIndex}
                                                            >
                                                                {render({
                                                                    ...child,
                                                                    name: [
                                                                        name,
                                                                        child.name,
                                                                    ],
                                                                })}
                                                            </Col>
                                                        )
                                                    )}
                                                    {!props.readonly && (
                                                        <div
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                top: 50,
                                                                right: 16,
                                                                display: "flex",
                                                                gap: 4,
                                                            }}
                                                        >
                                                            {field?.onSave && (
                                                                <Popconfirm
                                                                    title={tCommon(
                                                                        "CM_SAVE"
                                                                    )}
                                                                    description={tCommon(
                                                                        "update-confirmation"
                                                                    )}
                                                                    placement="topLeft"
                                                                    onConfirm={() => {
                                                                        field?.onSave?.(
                                                                            name,
                                                                            field.name
                                                                        );
                                                                    }}
                                                                    okText={tCommon(
                                                                        "CM_YN_Y"
                                                                    )}
                                                                    cancelText={tCommon(
                                                                        "CM_CANCEL"
                                                                    )}
                                                                >
                                                                    <Button
                                                                        type="primary"
                                                                        size="small"
                                                                        loading={
                                                                            props.isLoading
                                                                        }
                                                                    >
                                                                        {tCommon(
                                                                            "CM_SAVE"
                                                                        )}
                                                                    </Button>
                                                                </Popconfirm>
                                                            )}

                                                            {field?.onDelete && (
                                                                <Popconfirm
                                                                    title={tCommon(
                                                                        "CM_REMOVE"
                                                                    )}
                                                                    description={tCommon(
                                                                        "delete-confirmation"
                                                                    )}
                                                                    placement="topLeft"
                                                                    onConfirm={() => {
                                                                        field?.onDelete?.(
                                                                            name,
                                                                            field.name,
                                                                            () =>
                                                                                remove(
                                                                                    name
                                                                                )
                                                                        );
                                                                    }}
                                                                    okText={tCommon(
                                                                        "CM_YN_Y"
                                                                    )}
                                                                    cancelText={tCommon(
                                                                        "CM_CANCEL"
                                                                    )}
                                                                >
                                                                    <Button
                                                                        color="danger"
                                                                        variant="outlined"
                                                                        size="small"
                                                                        loading={
                                                                            props.isLoading
                                                                        }
                                                                    >
                                                                        {tCommon(
                                                                            "CM_REMOVE"
                                                                        )}
                                                                    </Button>
                                                                </Popconfirm>
                                                            )}
                                                        </div>
                                                    )}
                                                </Row>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}

                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() =>
                                        props?.handleAdd
                                            ? props.handleAdd(
                                                  add,
                                                  field.name as string
                                              )
                                            : add()
                                    }
                                    disabled={props.readonly}
                                    style={{ width: "100%" }}
                                >
                                    {`${tCommon("CM_ADD")} ${t(
                                        field?.label ?? ""
                                    )}`}
                                </Button>
                            </Form.Item>
                        );
                    }}
                </Form.List>
            );
        }

        return (
            <>
                <Form.Item
                    label={
                        <span
                            style={{
                                fontWeight: 600,
                            }}
                        >
                            {t(field.label)}
                        </span>
                    }
                    name={field.name}
                    rules={
                        field.required && field.type !== "display"
                            ? [
                                  {
                                      required: true,
                                      message: translateRequiredMessage(
                                          field.label
                                      ),
                                  },
                                  ...(field.type === "inputnumber" &&
                                  field.min !== undefined
                                      ? [
                                            {
                                                type: "number" as const,
                                                min: field.min,
                                                message: translateMinMessage(
                                                    field.label,
                                                    field.min
                                                ),
                                            },
                                        ]
                                      : []),
                                  ...(field.type === "inputnumber" &&
                                  field.max !== undefined
                                      ? [
                                            {
                                                type: "number" as const,
                                                max: field.max,
                                                message: translateLimitMessage(
                                                    field.label,
                                                    0,
                                                    field.max
                                                ),
                                            },
                                        ]
                                      : []),
                              ]
                            : undefined
                    }
                >
                    {field.type === "input" && (
                        <Input
                            placeholder={
                                field.placeholder
                                    ? t(field.placeholder)
                                    : undefined
                            }
                            disabled={props.readonly || field.disable}
                            style={{ width: "100%", ...field.style }}
                            onChange={field.onChange}
                        />
                    )}
                    {field.type === "inputnumber" && (
                        <InputNumber
                            placeholder={
                                field.placeholder
                                    ? t(field.placeholder)
                                    : undefined
                            }
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            disabled={props.readonly || field.disable}
                            style={{ width: "100%", ...field.style }}
                            onChange={field.onChange}
                        />
                    )}
                    {field.type === "textarea" && (
                        <Input.TextArea
                            placeholder={
                                field.placeholder
                                    ? t(field.placeholder)
                                    : undefined
                            }
                            disabled={props.readonly || field.disable}
                            style={{ width: "100%", ...field.style }}
                            onChange={field.onChange}
                        />
                    )}
                    {field.type === "select" && (
                        <Select
                            placeholder={
                                field.placeholder
                                    ? t(field.placeholder)
                                    : undefined
                            }
                            size={field.size}
                            showSearch={field.filterOption ? true : false}
                            filterOption={field.filterOption}
                            defaultValue={field.defaultValue}
                            disabled={props.readonly || field.disable}
                            options={field.options}
                            style={{ width: "100%", ...field.style }}
                            mode={field.mode}
                            maxCount={field.maxCount}
                            onChange={field.onChange}
                        />
                    )}
                    {field.type === "date" && (
                        <DatePicker
                            placeholder={
                                field.placeholder
                                    ? t(field.placeholder)
                                    : undefined
                            }
                            disabled={props.readonly || field.disable}
                            format={field.format || "DD/MM/YYYY"}
                            style={{ width: "100%", ...field.style }}
                            onChange={field.onChange}
                            minDate={field.minDate}
                        />
                    )}
                    {field.type === "datetime" && (
                        <DatePicker
                            placeholder={
                                field.placeholder
                                    ? t(field.placeholder)
                                    : undefined
                            }
                            disabled={props.readonly || field.disable}
                            showTime
                            format={field.format || "DD/MM/YYYY HH:mm"}
                            style={{ width: "100%", ...field.style }}
                            onChange={field.onChange}
                            minDate={field.minDate}
                        />
                    )}
                    {field.type === "editor" && (
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues[field.name as string] !==
                                currentValues[field.name as string]
                            }
                        >
                            {({ getFieldValue, setFieldsValue }) => (
                                <TextEditor
                                    placeholder={
                                        field.placeholder
                                            ? t(field.placeholder)
                                            : undefined
                                    }
                                    disabled={props.readonly || field.disable}
                                    defaultValue={
                                        getFieldValue(field.name) ||
                                        field.defaultValue ||
                                        ""
                                    }
                                    onChange={(value: string) => {
                                        setFieldsValue({
                                            [field.name as string]: value,
                                        });
                                        field.onChange?.(value);
                                    }}
                                    // style={{ width: "100%", ...field.style }}
                                />
                            )}
                        </Form.Item>
                    )}
                    {field.type === "display" && (
                        <Input
                            disabled
                            placeholder={
                                field.placeholder
                                    ? t(field.placeholder)
                                    : undefined
                            }
                            style={{ width: "100%", ...field.style }}
                        />
                    )}
                    {field.type === "button" && (
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues[field.name as string] !==
                                    currentValues[field.name as string] ||
                                (!currentValues[field.name as string] &&
                                    !!field.placeholder)
                            }
                        >
                            {({ getFieldValue }) => (
                                <Button
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                        ...field.style,
                                    }}
                                    onClick={field.onClick}
                                    disabled={props.readonly || field.disable}
                                >
                                    {getFieldValue(field.name) ||
                                        (field.placeholder
                                            ? t(field.placeholder)
                                            : "")}
                                </Button>
                            )}
                        </Form.Item>
                    )}
                    {field.type === "upload" && (
                        <div>
                            <Button
                                icon={<UploadOutlined />}
                                onClick={() => {
                                    const ref = props?.fileInputRefs?.get(
                                        field.name as string
                                    );
                                    if (ref?.current) {
                                        ref.current.click();
                                    }
                                }}
                                disabled={props.readonly || field.disable}
                            >
                                {tCommon("CM_UPLOAD_IMG")}
                            </Button>

                            <div
                                style={{
                                    display: "flex",
                                    overflowX: "auto",
                                    marginTop: 10,
                                    gap: 10,
                                    paddingBottom: 10,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {props?.uploadedImages?.[
                                    field.name as string
                                ]?.map((file: any, index: number) => (
                                    <div
                                        key={index}
                                        style={{
                                            position: "relative",
                                            display: "inline-block",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Image
                                            src={
                                                file instanceof File
                                                    ? URL.createObjectURL(file)
                                                    : file.URL
                                            }
                                            alt={`${field.name}-thumbnail-${index}`}
                                            style={{
                                                width: field.width ?? 100,
                                                height: field.height ?? 100,
                                                objectFit: "cover",
                                                borderRadius: 4,
                                            }}
                                            fallback="data:image/png;base64,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"
                                        />
                                        {!props.readonly &&
                                            props?.handleDeleteImage && (
                                                <Button
                                                    icon={<DeleteOutlined />}
                                                    size="small"
                                                    danger
                                                    onClick={() =>
                                                        props?.handleDeleteImage?.(
                                                            index,
                                                            field.name as string,
                                                            file
                                                        )
                                                    }
                                                    style={{
                                                        position: "absolute",
                                                        top: 5,
                                                        right: 5,
                                                        background:
                                                            "rgba(0,0,0,0.5)",
                                                        border: "none",
                                                    }}
                                                />
                                            )}
                                        {!props.readonly && field?.edit && (
                                            <Button
                                                icon={<EditOutlined />}
                                                size="small"
                                                color="primary"
                                                onClick={() => {
                                                    const ref =
                                                        props?.fileInputRefs?.get(
                                                            field.name as string
                                                        );
                                                    if (ref?.current) {
                                                        ref.current.click();
                                                    }
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: 5,
                                                    right: 5,
                                                    background:
                                                        "rgba(0,0,0,0.5)",
                                                    border: "none",
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {field.type === "video" && (
                        <div>
                            <Button
                                icon={<UploadOutlined />}
                                // onClick={() => {
                                //     const ref = props?.fileInputRefs?.get(
                                //         field.name as string
                                //     );
                                //     if (ref?.current) {
                                //         ref.current.click();
                                //     }
                                // }}
                                disabled={props.readonly || field.disable}
                            >
                                {tLocale("FILE_UPLOAD")}
                            </Button>

                            <div
                                style={{
                                    display: "flex",
                                    overflowX: "auto",
                                    marginTop: 10,
                                    gap: 10,
                                    paddingBottom: 10,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {props?.uploadedImages?.[
                                    field.name as string
                                ]?.map((file: any, index: number) => (
                                    <div
                                        key={index}
                                        style={{
                                            position: "relative",
                                            display: "inline-block",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <a
                                            href={file.URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <div
                                                style={{
                                                    position: "relative",
                                                    width: field.width ?? 100,
                                                    height: field.height ?? 100,
                                                }}
                                            >
                                                <Image
                                                    preview={false}
                                                    src={
                                                        file instanceof File
                                                            ? URL.createObjectURL(
                                                                  file
                                                              )
                                                            : file.THUMBURL
                                                    }
                                                    alt={`${field.name}-thumbnail-${index}`}
                                                    style={{
                                                        width:
                                                            field.width ?? 100,
                                                        height:
                                                            field.height ?? 100,
                                                        objectFit: "cover",
                                                        borderRadius: 4,
                                                    }}
                                                    fallback="data:image/png;base64,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"
                                                />

                                                <PlayButton />
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Form.Item>
                {field.type === "upload" && (
                    <input
                        type="file"
                        ref={props?.fileInputRefs?.get(field.name as string)}
                        style={{ display: "none" }}
                        accept={field.accept}
                        multiple={false}
                        onChange={(e) =>
                            props?.handleFileChange?.(e, field.name as string)
                        }
                    />
                )}
            </>
        );
    };

    return { render };
};
