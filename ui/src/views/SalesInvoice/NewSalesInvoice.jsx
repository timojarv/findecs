import React from "react";
import { Box, Heading, Button } from "@chakra-ui/core";
import SalesInvoiceForm from "../../forms/SalesInvoiceForm";
import { Link as RouterLink } from "react-router-dom";

const NewSalesInvoice = (props) => {
    return (
        <Box maxWidth="1000px" margin="auto">
            <Button
                my={4}
                variant="link"
                variantColor="indigo"
                leftIcon="arrow-back"
                as={RouterLink}
                to="/salesInvoices"
            >
                Takaisin
            </Button>
            <Heading mb={8} as="h2">
                Uusi myyntilasku
            </Heading>
            <SalesInvoiceForm onSubmit={console.log} />
        </Box>
    );
};

export default NewSalesInvoice;
