import React from "react";
import { Box, Heading, Button } from "@chakra-ui/core";
import { Link as RouterLink } from "react-router-dom";
const SalesInvoices = (props) => {
    return (
        <Box pt={8}>
            <Heading as="h2">Myyntilaskut</Heading>
            <Button
                my={6}
                as={RouterLink}
                variantColor="indigo"
                to="/salesInvoices/new"
                leftIcon="add"
            >
                Luo uusi
            </Button>
        </Box>
    );
};

export default SalesInvoices;
