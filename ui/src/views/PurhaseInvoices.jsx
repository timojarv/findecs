import React from 'react'
import { Box, Heading, Input, Button } from '@chakra-ui/core';
import ContactSearch from '../components/ContactSearch';
import { Table } from '../components/Table';


const PurchaseInvoices = props => {
    return (
        <Box pt={8}>
            <Heading as="h2" mb={8} size="lg">Ostolaskut</Heading>
            <Button leftIcon="add" variantColor="indigo">Luo uusi</Button>
            <Table />
        </Box>
    );
};

export default PurchaseInvoices;