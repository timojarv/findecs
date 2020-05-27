import React from "react";
import { statusColors, statuses } from "../util/metadata";
import {
    Badge,
    Flex,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from "@chakra-ui/core";

const StatusBadge = (props) => {
    const { status } = props;

    return (
        <Flex alignItems="center">
            <Badge
                rounded="md"
                as={Flex}
                py={1}
                px={2}
                variantColor={statusColors[status]}
            >
                {statuses[status]}
            </Badge>
            <Menu>
                <MenuButton
                    as={IconButton}
                    variant="ghost"
                    minWidth={null}
                    size="lg"
                    icon="chevron-down"
                    mx={1}
                    p={1}
                    height="auto"
                />
                <MenuList>
                    {Object.entries(statuses).map(([value, label]) => (
                        <MenuItem key={value}>{label}</MenuItem>
                    ))}
                </MenuList>
            </Menu>
        </Flex>
    );
};

export default StatusBadge;
