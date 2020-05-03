import React from "react";
import { IconButton, Flex, Spinner, Box } from "@chakra-ui/core";

const Pagination = (props) => {
    const { total, limit, offset, onChange, isLoading } = props;

    return (
        <Flex
            justify="space-between"
            align="center"
            borderTop="1px"
            borderColor="gray.200"
            px={3}
            py={2}
            position="relative"
        >
            Näytetään rivit {offset + 1} - {Math.min(total, offset + limit)} /{" "}
            {total}
            <Box flexGrow={1} />
            <IconButton
                size="sm"
                isDisabled={offset === 0}
                icon="arrow-back"
                variant="ghost"
                onClick={() => onChange(offset - limit)}
                mr={8}
            />
            <IconButton
                size="sm"
                isDisabled={offset + limit >= total}
                icon="arrow-forward"
                variant="ghost"
                onClick={() => onChange(offset + limit)}
            />
            {isLoading ? (
                <Flex
                    justify="center"
                    align="center"
                    position="absolute"
                    background="rgba(255, 255, 255, 0.75)"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                >
                    <Spinner color="indigo.500" />
                </Flex>
            ) : null}
        </Flex>
    );
};

export default Pagination;
