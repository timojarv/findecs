import React from "react";
import {
    Link,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
} from "@chakra-ui/core";
import { version } from "../../package.json";
import { DL, DT, DD } from "./DescriptionList";
import { useLocation } from "react-router-dom";

const Version = (props) => {
    const info = props.info || {};
    const path = useLocation().pathname;

    if (path.endsWith("print")) {
        return null;
    }

    const { isOpen, onOpen, onClose } = useDisclosure();

    const versionString = `v${version}${
        process.env.NODE_ENV === "development" ? "-dev" : ""
    }`;

    return (
        <React.Fragment>
            <Link
                position="absolute"
                bottom={0}
                fontSize="sm"
                color="gray.400"
                p={3}
                className="no-print"
                onClick={onOpen}
            >
                Findecs {versionString}
            </Link>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent rounded="md">
                    <ModalHeader>Findecs 💸</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <DL>
                            <DT>Tekijä</DT>
                            <DD>Timo Järventausta // @timojarv</DD>
                            <DT>Käyttöliittymän versio</DT>
                            <DD>{versionString}</DD>
                            <DT>Palvelimen versio</DT>
                            <DD>{info.serverVersion}</DD>
                            <DT>Tietokanta</DT>
                            <DD>{info.database}</DD>
                        </DL>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
};

export default Version;
