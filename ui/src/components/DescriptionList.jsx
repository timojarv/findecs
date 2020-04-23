import React from 'react';
import { Box } from '@chakra-ui/core';

export const DL = (props) => <Box as="dl" {...props} />;
export const DT = (props) => <Box as="dt" fontWeight="semibold" {...props} />;
export const DD = (props) => <Box as="dd" mb={3} color="gray.700" {...props} />;
