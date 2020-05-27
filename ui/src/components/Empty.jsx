import React from "react";
import { Flex, Text } from "@chakra-ui/core";
import { Inbox } from "react-feather";

const Empty = (props) =>
    props.visible ? (
        <Flex
            py={8}
            width="100%"
            direction="column"
            align="center"
            justify="center"
            borderTop="1px"
            borderColor="gray.200"
            color="gray.300"
        >
            <Inbox size="4rem" />
            <Text color="gray.500" mt={4} fontSize="xl">
                Ei tuloksia
            </Text>
        </Flex>
    ) : null;

export default Empty;
