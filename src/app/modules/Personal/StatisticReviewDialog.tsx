import { useState, useEffect, useCallback } from "react";
import { dialogStore } from "@/store/dialogStore";
import { Card, Drawer, Empty, Flex, Image, Rate, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { useNotificationContext } from "@/app/context/notification";
import { GoodReview, Review } from "@/interfaces/review";
import timeService from "@/libs/timeService";
import { PlayCircleOutlined } from "@ant-design/icons";
import { SellerList } from "@/interfaces/personal";
import { PersonalService } from "@/app/services/personal";
import { getDataFromPayloadRestful } from "@/utils/handleResponse";

export const useStatisticReviewDialog = dialogStore<SellerList>();

interface DialogProps {
    onClose?: (status?: string) => void;
}

export const StatisticReviewDialog = ({ onClose = () => "" }: DialogProps) => {
    const { t: tReview } = useTranslation("Review");

    const { openNotification } = useNotificationContext();

    const { open, item, closeDialog } = useStatisticReviewDialog();
    const [isLoading, setIsLoading] = useState(false);
    const [childrenDrawer, setChildrenDrawer] = useState(false);
    const [openReview, setOpenReview] = useState<Review>();
    // const [searchTerm, setSearchTerm] = useState("");

    const [dataSource, setDataSource] = useState<GoodReview[]>([]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            if (item) {
                try {
                    const response =
                        await PersonalService.fetchSellerReviewList({
                            MEMID: item.MEMID,
                            PAGENUM: 1,
                            PAGESIZE: 1000,
                        });

                    setDataSource(getDataFromPayloadRestful(response) || []);
                } catch (error) {
                    openNotification("error", "", undefined, {
                        showProgress: true,
                        pauseOnHover: true,
                    });

                    console.log("Init form values: ", error);
                } finally {
                    setIsLoading(false);
                }
            }
        })();
    }, [item, openNotification]);

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

    const onChildrenDrawerOpen = (item: Review) => {
        setOpenReview(item);
        setChildrenDrawer(true);
        console.log({ item });
    };

    const onChildrenDrawerClose = () => {
        setChildrenDrawer(false);
    };

    return (
        <>
            <Drawer
                closable
                destroyOnClose
                title={tReview("REVIEW_GOOD_POPUP_TITLE")}
                placement="right"
                open={open}
                loading={isLoading}
                onClose={handleClose}
                width="500px"
                style={{ zIndex: 999 }}
            >
                <Flex vertical gap="middle">
                    {!dataSource?.[0]?.REVIEWS?.length && (
                        <Empty description={tReview("REVIEW_NO_REVIEW")} />
                    )}
                    {dataSource?.[0]?.REVIEWS.map((review) => (
                        <Card
                            key={review.PID}
                            size="small"
                            hoverable
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                onChildrenDrawerOpen(review);
                            }}
                        >
                            <Flex align="center" gap="middle">
                                <Image
                                    src={
                                        review.AVATAR_URL ??
                                        "https://via.placeholder.com/40"
                                    }
                                    width={60}
                                    height={60}
                                    style={{ borderRadius: "50%" }}
                                    preview={false}
                                />
                                <Flex vertical style={{ flex: 1 }} gap="2px">
                                    <Flex
                                        align="center"
                                        justify="space-between"
                                    >
                                        <span>{review.ALIAS}</span>
                                        <Tag
                                            color={
                                                review.REV_TEXT
                                                    ? "green"
                                                    : "red"
                                            }
                                            style={{ margin: 0 }}
                                        >
                                            {review.REV_TEXT
                                                ? "Answered"
                                                : "Not answer yet"}
                                        </Tag>
                                    </Flex>
                                    <Rate
                                        disabled
                                        value={review.AVG_RATING}
                                        style={{ fontSize: 16 }}
                                    />

                                    <span
                                        style={
                                            !review.REV_TEXT
                                                ? {
                                                      fontStyle: "italic",
                                                      fontSize: 12,
                                                      color: "#a4a1a1",
                                                  }
                                                : { fontSize: 12 }
                                        }
                                    >
                                        {review.REV_TEXT
                                            ? review.REV_TEXT
                                            : tReview(
                                                  "REVIEW_NO_REVIEW_ENTERED_YET"
                                              )}
                                    </span>
                                    <span
                                        style={{
                                            textAlign: "right",
                                            fontStyle: "italic",
                                            fontSize: 12,
                                            color: "#a4a1a1",
                                        }}
                                    >
                                        {timeService.getStrDateParseFromUTC(
                                            review.CRT_DATE
                                        )}
                                    </span>
                                </Flex>
                            </Flex>
                        </Card>
                    ))}
                </Flex>

                <Drawer
                    title={
                        <Flex align="center" gap="middle">
                            <Image
                                src={
                                    openReview?.AVATAR_URL ??
                                    "https://via.placeholder.com/40"
                                }
                                width={40}
                                height={40}
                                style={{ borderRadius: "50%" }}
                                preview={false}
                            />
                            <span>{openReview?.ALIAS}</span>
                        </Flex>
                    }
                    width={500}
                    closable={false}
                    onClose={onChildrenDrawerClose}
                    open={childrenDrawer}
                >
                    <Flex vertical gap="middle">
                        {openReview?.REV_TEXT && (
                            <div
                                style={{
                                    color: "rgba(0, 0, 0, 0.88)",
                                    background: "#fafafa",
                                    border: "1px solid #d9d9d9",
                                    borderRadius: "6px",
                                    padding: "6px 12px",
                                    width: "max-content",
                                    maxWidth: "80%",
                                }}
                            >
                                {openReview?.REV_TEXT}
                            </div>
                        )}
                        <Flex wrap="wrap" gap="small">
                            {openReview?.PHOTO_LIST.map((photo, index) => (
                                <Image
                                    key={index}
                                    src={photo.PHOTO_URL}
                                    width={100}
                                    height={100}
                                    preview={{ src: photo.PHOTO_URL }}
                                />
                            ))}
                        </Flex>
                        <Flex wrap="wrap" gap="small">
                            {openReview?.VIDEO_LIST.map((video, index) => (
                                <a
                                    key={index}
                                    href={video.VIDEO_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        backgroundImage: `url(${video.VIDEO_THUMB_URL}), url('img/no_image.jpeg')`,
                                        width: "100px",
                                        height: "100px",
                                        objectFit: "contain",
                                        display: "inline-block",
                                        position: "relative",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        textDecoration: "none",
                                    }}
                                >
                                    <PlayCircleOutlined
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            fontSize: "30px",
                                            color: "white",
                                            textShadow:
                                                "0 0 5px rgba(0, 0, 0, 0.7)",
                                        }}
                                    />
                                </a>
                            ))}
                        </Flex>

                        {/* {openReview?.REV_TEXT && (
                            <div
                                style={{
                                    color: "#0958d9",
                                    background: "#e6f4ff",
                                    border: "1px solid #91caff",
                                    borderRadius: "6px",
                                    padding: "6px 12px",
                                    marginLeft: "auto",
                                    marginRight: 0,
                                    maxWidth: "80%",
                                }}
                            >
                                {openReview?.REV_TEXT}
                            </div>
                        )} */}
                    </Flex>
                </Drawer>
            </Drawer>
        </>
    );
};
