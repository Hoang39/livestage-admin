import { useCallback, useEffect, useState } from "react";

import { type Editor } from "@tiptap/react";
import { Select } from "antd";
import {
    AlignCenterOutlined,
    AlignLeftOutlined,
    AlignRightOutlined,
    BoldOutlined,
    ItalicOutlined,
    LinkOutlined,
    MutedOutlined,
    RedoOutlined,
    StrikethroughOutlined,
    UnderlineOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import "./style.scss";

import { hexToRgb, rgbToHex } from "@libs/color";

const { Option } = Select;

type Props = {
    editor: Editor | null;
};

const Toolbar = ({ editor }: Props) => {
    const fontSize = editor?.getAttributes("textStyle").fontSize;

    const [selectedSize, setSelectedSize] = useState(
        parseInt(fontSize, 10) || 14
    );

    // const { openNotification } = useNotificationContext();

    const handleFontSizeChange = (size: number) => {
        setSelectedSize(size);
        editor
            ?.chain()
            .focus()
            .setMark("textStyle", { fontSize: `${size}px` })
            .run();
    };

    useEffect(() => {
        if (!editor) return;
        setSelectedSize(parseInt(fontSize, 10) || 14);
    }, [fontSize, editor]);

    // const addImage = useCallback(() => {
    //     const input = document.createElement("input");
    //     input.type = "file";
    //     input.accept = "image/*";

    //     input.onchange = async (event: any) => {
    //         const file = event.target.files[0];
    //         if (!file) return;

    //         const formData = new FormData();
    //         formData.set("file", file);

    //         try {
    //             const { data } = await axiosInstance.post("/file", formData, {
    //                 headers: {
    //                     "Content-Type": "multipart/form-data"
    //                 }
    //             });

    //             editor?.chain().focus().setImage({ src: data?.data?.path }).run();
    //         } catch (error) {
    //             openNotification("error", "Upload failed!", undefined, {
    //                 showProgress: true,
    //                 pauseOnHover: true
    //             });
    //             throw error;
    //         }
    //     };

    //     input.click();
    // }, [editor, openNotification]);

    const setLink = useCallback(() => {
        const previousUrl = editor?.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url == null) {
            return;
        }

        if (url == "") {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor
            ?.chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
    }, [editor]);

    const toolbarList = [
        {
            name: "Undo",
            action: () => editor?.chain().focus().undo().run(),
            isActive: () => false,
            reset: () => {},
            Icon: UndoOutlined,
        },
        {
            name: "Redo",
            action: () => editor?.chain().focus().redo().run(),
            isActive: () => false,
            reset: () => {},
            Icon: RedoOutlined,
        },
        {
            name: "Bold",
            action: () => editor?.chain().focus().toggleBold().run(),
            isActive: () => editor?.isActive("bold"),
            reset: () => editor?.chain().focus().toggleBold().run(),
            Icon: BoldOutlined,
        },
        {
            name: "Italic",
            action: () => editor?.chain().focus().toggleItalic().run(),
            isActive: () => editor?.isActive("italic"),
            reset: () => editor?.chain().focus().toggleItalic().run(),
            Icon: ItalicOutlined,
        },
        {
            name: "Underline",
            action: () => editor?.chain().focus().toggleUnderline().run(),
            isActive: () => editor?.isActive("underline"),
            reset: () => editor?.chain().focus().toggleUnderline().run(),
            Icon: UnderlineOutlined,
        },
        {
            name: "Strike",
            action: () => editor?.chain().focus().toggleStrike().run(),
            isActive: () => editor?.isActive("strike"),
            reset: () => editor?.chain().focus().toggleStrike().run(),
            Icon: StrikethroughOutlined,
        },
        {
            name: "Blockquote",
            action: () => editor?.chain().focus().toggleBlockquote().run(),
            isActive: () => editor?.isActive("blockquote"),
            reset: () => editor?.chain().focus().toggleBlockquote().run(),
            Icon: MutedOutlined,
        },
        // {
        //     name: "Image",
        //     action: addImage,
        //     isActive: () => false,
        //     reset: () => {},
        //     Icon: Image
        // },
        {
            name: "Link",
            action: setLink,
            isActive: () => editor?.isActive("link"),
            reset: () => editor?.chain().focus().unsetLink().run(),
            Icon: LinkOutlined,
        },
        {
            name: "AlignLeft",
            action: () => editor?.chain().focus().setTextAlign("left").run(),
            isActive: () => editor?.isActive({ textAlign: "left" }),
            reset: () => editor?.chain().focus().unsetTextAlign().run(),
            Icon: AlignLeftOutlined,
        },
        {
            name: "AlignCenter",
            action: () => editor?.chain().focus().setTextAlign("center").run(),
            isActive: () => editor?.isActive({ textAlign: "center" }),
            reset: () => editor?.chain().focus().unsetTextAlign().run(),
            Icon: AlignCenterOutlined,
        },
        {
            name: "AlignRight",
            action: () => editor?.chain().focus().setTextAlign("right").run(),
            isActive: () => editor?.isActive({ textAlign: "right" }),
            reset: () => editor?.chain().focus().unsetTextAlign().run(),
            Icon: AlignRightOutlined,
        },
        // {
        //     name: "AlignJustify",
        //     action: () => editor?.chain().focus().setTextAlign("justify").run(),
        //     isActive: () => editor?.isActive({ textAlign: "justify" }),
        //     reset: () => editor?.chain().focus().unsetTextAlign().run(),
        //     Icon: AlignJustifyOutlined
        // }
    ];

    if (!editor) {
        return null;
    }
    return (
        <div className="toolbar-wrap">
            <div>
                {toolbarList?.map((item, index: number) => (
                    <button
                        key={index}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            if (item?.isActive()) {
                                item.reset();
                            } else {
                                item.action();
                            }
                        }}
                        className={`${
                            item?.isActive() ? "active" : "inactive"
                        }`}
                    >
                        <item.Icon />
                    </button>
                ))}

                <input
                    type="color"
                    onChange={(event) =>
                        editor
                            .chain()
                            .focus()
                            .setColor(
                                hexToRgb(event.target.value, "rgb(153,153,153)")
                            )
                            .run()
                    }
                    value={rgbToHex(
                        editor.getAttributes("textStyle").color ?? "",
                        "#999999"
                    )}
                    data-testid="setColor"
                />

                <Select
                    size="small"
                    value={selectedSize}
                    className=""
                    onChange={handleFontSizeChange}
                    style={{ width: "48px" }}
                >
                    {Array.from({ length: 20 }, (_, i) => (i + 1) * 2)?.map(
                        (item: number, index: number) => (
                            <Option
                                key={index}
                                value={item}
                                style={{ fontSize: "12px" }}
                            >
                                {item}
                            </Option>
                        )
                    )}
                </Select>
            </div>
        </div>
    );
};

export default Toolbar;
