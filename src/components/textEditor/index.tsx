import { useEffect, useRef, useState } from "react";

import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import "./style.scss";

import Toolbar from "./toolBar";

interface TextEditorProps {
    onChange?: (content: string) => void;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({
    onChange,
    defaultValue,
    placeholder,
    disabled,
}) => {
    const [height, setHeight] = useState<number>(100);
    const divRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef<boolean>(false);

    const CustomItalic = Italic.extend({
        renderHTML({ HTMLAttributes }) {
            return ["i", HTMLAttributes, 0];
        },
    });

    const CustomColor = Color.extend({
        renderHTML({
            HTMLAttributes,
        }: {
            HTMLAttributes: React.HTMLAttributes<HTMLElement>;
        }) {
            return [
                "span",
                {
                    ...HTMLAttributes,
                    style: `color: ${HTMLAttributes.color}`,
                },
                0,
            ];
        },
    });

    const FontSize = TextStyle.extend({
        renderHTML({ HTMLAttributes }) {
            return ["span", HTMLAttributes, 0];
        },
        addAttributes() {
            return {
                fontSize: {
                    default: "14px",
                    parseHTML: (element) => element.style.fontSize || "14px",
                    renderHTML: (attributes) => {
                        return attributes.fontSize
                            ? { style: `font-size: ${attributes.fontSize}` }
                            : {};
                    },
                },
            };
        },
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            CustomItalic,
            Image,
            ImageResize,
            TextStyle,
            FontSize,
            CustomColor,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder: placeholder,
            }),
            Link.configure({
                openOnClick: true,
                autolink: true,
                defaultProtocol: "https",
                protocols: ["http", "https"],
                isAllowedUri: (url, ctx) => {
                    try {
                        const parsedUrl = url.includes(":")
                            ? new URL(url)
                            : new URL(`${ctx.defaultProtocol}://${url}`);

                        if (!ctx.defaultValidate(parsedUrl.href)) {
                            return false;
                        }

                        const disallowedProtocols = ["ftp", "file", "mailto"];
                        const protocol = parsedUrl.protocol.replace(":", "");

                        if (disallowedProtocols.includes(protocol)) {
                            return false;
                        }

                        const allowedProtocols = ctx.protocols.map((p) =>
                            typeof p === "string" ? p : p.scheme
                        );

                        if (!allowedProtocols.includes(protocol)) {
                            return false;
                        }

                        const disallowedDomains = [
                            "example-phishing.com",
                            "malicious-site.net",
                        ];
                        const domain = parsedUrl.hostname;

                        if (disallowedDomains.includes(domain)) {
                            return false;
                        }

                        return true;
                    } catch {
                        return false;
                    }
                },
                shouldAutoLink: (url) => {
                    try {
                        const parsedUrl = url.includes(":")
                            ? new URL(url)
                            : new URL(`https://${url}`);

                        const disallowedDomains = [
                            "example-no-autolink.com",
                            "another-no-autolink.com",
                        ];
                        const domain = parsedUrl.hostname;

                        return !disallowedDomains.includes(domain);
                    } catch {
                        return false;
                    }
                },
            }),
        ],
        editorProps: {
            attributes: {
                class: "editor-content",
                style: `height: ${height}px;`,
            },
        },
        content: "",
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && defaultValue !== editor.getHTML()) {
            editor.commands.setContent(defaultValue ?? "", false);
        }
    }, [editor, defaultValue]);

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging.current && divRef.current) {
            const newHeight =
                e.clientY - divRef.current.getBoundingClientRect().top;
            if (newHeight >= 100 && newHeight <= 500) {
                setHeight(newHeight);
            }
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    return (
        <div className="editor-area">
            <Toolbar editor={editor} />
            <div
                ref={divRef}
                className="resizable-div"
                style={{ height: `${height}px` }}
            >
                <EditorContent
                    style={{ whiteSpace: "pre-line" }}
                    editor={editor}
                />
                <div
                    className="resize-handle"
                    onMouseDown={handleMouseDown}
                ></div>
            </div>
        </div>
    );
};

export default TextEditor;
