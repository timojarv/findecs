import React from "react";
import { Box, Heading, Button } from "@chakra-ui/core";
import PurchaseInvoiceForm from "../../forms/PurchaseInvoiceForm";
import { Link as RouterLink } from "react-router-dom";
import { useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useMessage } from "../../util/message";

const mutation = `
    mutation CreatePurchaseInvoice($invoice: PurchaseInvoiceInput!, $rows: [InvoiceRowInput!]!) {
        createPurchaseInvoice(invoice: $invoice, rows: $rows) {
            id
            sender {
                id
                name
            }
            description
            dueDate
            status
            created
            modified
            details
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
        }
    }
`;

const NewPurchaseInvoice = (props) => {
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
                successMessage("Ostolasku luotu");
                props.history.push(
                    `/purchaseInvoices/${data.createPurchaseInvoice.id}`
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
                to="/purchaseInvoices"
            >
                Takaisin
            </Button>
            <Heading mb={8} as="h2">
                Uusi ostolasku
            </Heading>
            <ErrorDisplay error={error} />
            <PurchaseInvoiceForm
                isSubmitting={fetching}
                onSubmit={handleSubmit}
            />
        </Box>
    );
};

export default NewPurchaseInvoice;
