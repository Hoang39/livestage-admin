export const getLinkVideo = (
    state: string,
    vidPid: string,
    userPid: string,
    youtubeId: string
) => {
    if (state === "S") {
        return "";
    }

    if (state === "Y") {
        return `/youtube.html?id=${youtubeId}`;
    }
    let link = "";
    if (state === "O") {
        link =
            __LIVE_RESOURCE_URL__ +
            `/${vidPid}/${userPid}_${vidPid}/mylist.m3u8`;
    } else {
        link = __VOD_LINK_RESOURCE__ + `/${userPid}/HLS/${vidPid}.m3u8`;
    }

    // return "/ViewVideo.html?src=" + link;
    return link;
};
