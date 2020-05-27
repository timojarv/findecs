import React from "react";
import { APIHost } from "../util/api";
import { Image } from "@chakra-ui/core";

const Signature = ({ filename, ...props }) => {
    return (
        <Image
            height="25mm"
            rounded="md"
            border="1px"
            borderColor="gray.400"
            src={`${APIHost}/upload/signatures/${filename}`}
            {...props}
        />
    );
};

export default Signature;
