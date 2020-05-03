import React from "react";
import { Box, Heading, Button } from "@chakra-ui/core";
import PurchaseInvoiceForm from "../../forms/PurchaseInvoiceForm";
import { Link as RouterLink } from "react-router-dom";

const NewPurchaseInvoice = (props) => {
    return (
        <Box maxWidth="1000px" margin="auto">
            <Button
                my={4}
                variant="link"
                variantColor="indigo"
                leftIcon="arrow-back"
                as={RouterLink}
                to="/purchaseInvoices"
            >
                Takaisin
            </Button>
            <Heading mb={8} as="h2">
                Uusi ostolasku
            </Heading>
            <PurchaseInvoiceForm onSubmit={console.log} />
        </Box>
    );
};

export default NewPurchaseInvoice;
