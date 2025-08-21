export const PlayButton = () => (
    <div
        style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 32,
            height: 32,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 18,
            pointerEvents: "none", // không làm ảnh hưởng đến click
        }}
    >
        ▶
    </div>
);
