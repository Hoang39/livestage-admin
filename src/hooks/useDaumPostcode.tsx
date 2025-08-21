import { useState } from "react";
import { Modal } from "antd";
import DaumPostcode from "react-daum-postcode";

export type Postcode = { zonecode: string; fullAddress: string };

export const useDaumPostcode = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [onCompleteCallback, setOnCompleteCallback] = useState<
        ((address: Postcode) => void) | null
    >(null);

    const openDaumPostcode = (onComplete: (address: Postcode) => void) => {
        setOnCompleteCallback(() => onComplete);
        setIsOpen(true);
    };

    const handleComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
            if (data.bname !== "") {
                extraAddress += data.bname;
            }
            if (data.buildingName !== "") {
                extraAddress +=
                    extraAddress !== ""
                        ? `, ${data.buildingName}`
                        : data.buildingName;
            }
            if (extraAddress !== "") {
                fullAddress += ` (${extraAddress})`;
            }
        }

        if (onCompleteCallback) {
            onCompleteCallback({ zonecode: data.zonecode, fullAddress });
        }

        setIsOpen(false);
    };

    const DaumPostcodeModal = () => (
        <Modal
            title="Search Address"
            open={isOpen}
            onCancel={() => setIsOpen(false)}
            footer={null}
            destroyOnClose
        >
            <DaumPostcode
                onComplete={handleComplete}
                style={{ width: "100%", height: "400px" }}
            />
        </Modal>
    );

    return {
        openDaumPostcode,
        DaumPostcodeModal,
    };
};
