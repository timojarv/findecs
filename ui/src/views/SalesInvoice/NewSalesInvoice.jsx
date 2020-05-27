import React from "react";
import { Box, Heading, Button } from "@chakra-ui/core";
import SalesInvoiceForm from "../../forms/SalesInvoiceForm";
import { Link as RouterLink } from "react-router-dom";
import { useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useMessage } from "../../util/message";

const mutation = `
    mutation CreateSalesInvoice($invoice: SalesInvoiceInput!, $rows: [InvoiceRowInput!]!) {
        createSalesInvoice(invoice: $invoice, rows: $rows) {
            id
            recipient {
                id
                name
            }
            runningNumber
            dueDate
            status
            details
            payerReference
            contactPerson
            rows {
                id
                description
                amount
                costPool {
                    id
                    name
                }
            }
            total
            created
            modified
        }
    }
`;

const NewSalesInvoice = (props) => {
    const [creation, createInvoice] = useMutation(mutation);
    const { successMessage, errorMessage } = useMessage();

    const { fetching, error } = creation;

    const handleSubmit = ({ rows, ...invoice }) => {
        createInvoice({
            invoice,
            rows,
        }).then(({ error, data }) => {
            if (error) {
                errorMessage(error.message);
            } else {
                successMessage("Myyntilasku luotu");
                props.history.push(
                    `/salesInvoices/${data.createSalesInvoice.id}`
                );
            }
        });
    };

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
            <ErrorDisplay error={error} />
            <SalesInvoiceForm isSubmitting={fetching} onSubmit={handleSubmit} />
        </Box>
    );
};

export default NewSalesInvoice;
