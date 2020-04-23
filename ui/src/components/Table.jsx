import React from 'react';
import { Box } from '@chakra-ui/core';

export const TableContainer = (props) => (
    <Box
        rounded={4}
        border="1px"
        borderColor="gray.200"
        overflow="hidden"
        {...props}
    />
);
export const Table = (props) => (
    <Box fontSize={['xs', 'md']} as="table" width="full" {...props} />
);
export const THead = (props) => (
    <Box as="thead" bg="gray.50" color="gray.700" {...props} />
);
export const TBody = (props) => <Box as="tbody" {...props} />;
export const TR = (props) => <Box as="tr" verticalAlign="middle" {...props} />;
export const TH = (props) => (
    <Box
        as="th"
        px={[3, 4]}
        py={3}
        textTransform="uppercase"
        fontSize="0.75em"
        color="gray.600"
        {...props}
    />
);
export const TD = (props) => (
    <Box
        borderTop="1px"
        borderColor="gray.200"
        as="td"
        px={[3, 4]}
        py={1}
        {...props}
    />
);
