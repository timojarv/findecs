import React from 'react'
import { Box, Heading } from '@chakra-ui/core';
import ContactSearch from '../components/ContactSearch';


const SalesInvoices = props => {
    return (
        <Box pt={8}>
            <Heading as="h2" size="lg">Myyntilaskut</Heading>
            <ContactSearch />
        </Box>
    );
};

export default SalesInvoices;