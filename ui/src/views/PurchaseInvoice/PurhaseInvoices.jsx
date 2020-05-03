import React from "react";
import { Box, Heading, Button } from "@chakra-ui/core";
import { Link as RouterLink } from "react-router-dom";
const PurchaseInvoices = (props) => {
    return (
        <Box pt={8}>
            <Heading as="h2">Ostolaskut</Heading>
            <Button
                my={6}
                as={RouterLink}
                variantColor="indigo"
                to="/purchaseInvoices/new"
                leftIcon="add"
            >
                Luo uusi
            </Button>
        </Box>
    );
};

export default PurchaseInvoices;
