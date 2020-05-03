import React from "react";
import { Link } from "@chakra-ui/core";
import { version } from "../../package.json";

const Version = (props) => {
    return (
        <Link
            position="absolute"
            bottom={0}
            fontSize="sm"
            color="gray.300"
            p={3}
            className="no-print"
        >
            Findecs v{version}
            {process.env.NODE_ENV === "development" ? "-dev" : ""}
        </Link>
    );
};

export default Version;
