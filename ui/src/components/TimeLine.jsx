import React from "react";
import { Box, Flex, Heading, Text, PseudoBox, Tooltip } from "@chakra-ui/core";
import { X } from "react-feather";
import { RevokeAction } from "./StatusActions";

const renderStep = (step, index, arr) => {
    const Icon = step.icon;
    return (
        <React.Fragment key={index}>
            <Flex
                height={16}
                color={`${step.color || "gray"}.400`}
                align="center"
            >
                <Icon size="1.8em" />
                <Box flex={1} ml={5} fontSize="sm" color="gray.500">
                    {step.title && (
                        <Heading
                            color="gray.800"
                            fontSize="md"
                            fontWeight="semibold"
                            as="h5"
                            display="inline-block"
                        >
                            {step.title}
                        </Heading>
                    )}
                    {step.datetime && (
                        <Text color="gray.400" display="inline-block" mx={2}>
                            &bull;
                        </Text>
                    )}
                    {step.datetime && (
                        <Text display="inline-block">{step.datetime}</Text>
                    )}
                    {step.comment && <Text>{step.comment}</Text>}
                    {step.actions}
                </Box>
                {step.delete}
            </Flex>
            {index < arr.length - 1 ? (
                <Box
                    height={8}
                    ml={3}
                    borderLeft="2px"
                    borderColor="gray.200"
                ></Box>
            ) : null}
        </React.Fragment>
    );
};

const TimeLine = (props) => {
    const { steps } = props;

    return <Flex direction="column">{steps.map(renderStep)}</Flex>;
};

export default TimeLine;
