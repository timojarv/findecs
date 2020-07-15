import React from "react";
import { Box, Flex, Icon, PseudoBox } from "@chakra-ui/core";

export const TableContainer = (props) => (
    <Box
        rounded={4}
        border="1px"
        borderColor="gray.200"
        overflow="hidden"
        {...props}
    />
);
export const Table = (props) => <Box as="table" width="full" {...props} />;
export const THead = (props) => (
    <Box as="thead" bg="gray.50" color="gray.700" {...props} />
);
export const TFoot = (props) => <Box as="tfoot" {...props} />;
export const TBody = (props) => <Box as="tbody" {...props} />;
export const TR = (props) => <Box as="tr" verticalAlign="middle" {...props} />;
export const TH = ({onSort, active, order, children, ...props}) => (
    <Box
        as="th"
        px={[3, 4]}
        py={3}
        textTransform="uppercase"
        fontSize="0.75em"
        color="gray.600"
        {...props}
    >
        {onSort ? <Sorter onSort={onSort} active={active} order={order}>{children}</Sorter> : children}
    </Box>
);
export const TD = (props) => (
    <Box
        borderTop="1px"
        borderColor="gray.200"
        as="td"
        px={[3, 4]}
        py={3}
        {...props}
    />
);

export const sortable = (current, key, set) => ({
    onSort: () => set({ key, order: (current.key === key && current.order === 'asc') ? 'desc' : 'asc' }),
    active: current.key === key,
    order: current.order,
});

export const Sorter = ({ onSort, active, order, children }) => {
    return (
        <PseudoBox display="inline-flex" onClick={onSort} _hover={{ color: "blue.300" }} color="gray.300" cursor="pointer" alignItems="center">
            <Box as="span" color="gray.600">
                {children}
            </Box>
            <Flex fontSize="1.25em" ml={2} mr={-1} direction="column" align="center">
                <Icon mb="-3px" mt="-2px" color={(active && order === "asc") ? "blue.600" : 'inherit'} name="chevron-up" />
                <Icon mt="-4px" mb="-2px" color={(active && order === "desc") ? "blue.600" : 'inherit'} name="chevron-down" />
            </Flex>
        </PseudoBox>
    );
};