import React from "react";
import { Box, Heading, Button } from "@chakra-ui/core";
import PurchaseInvoiceForm from "../../forms/PurchaseInvoiceForm";
import { Link as RouterLink } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useMessage } from "../../util/message";

const query = `
    query FetchPurchaseInvoice($id: ID!) {
        purchaseInvoice(id: $id) {
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
const mutation = `
    mutation UpdatePurchaseInvoice($id: ID!, $invoice: PurchaseInvoiceInput!, $rows: [InvoiceRowInput!]!) {
        updatePurchaseInvoice(id: $id, invoice: $invoice, rows: $rows) {
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

const EditPurchaseInvoice = (props) => {
    const id = props.match.params.id;

    const [result] = useQuery({ query, variables: { id } });
    const [update, updateInvoice] = useMutation(mutation);
    const { infoMessage, errorMessage } = useMessage();

    const { fetching, error, data } = result;

    const handleSubmit = ({ rows, ...invoice }) => {
        updateInvoice({
            id,
            invoice,
            rows,
        }).then(({ error }) => {
            if (error) {
                errorMessage(error.message);
            } else {
                infoMessage("Ostolasku päivitetty");
                props.history.push(`/purchaseInvoices/${id}`);
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
                to={`/purchaseInvoices/${id}`}
            >
                Takaisin
            </Button>
            <Heading mb={8} as="h2">
                Muokkaa ostolaskua
            </Heading>
            <ErrorDisplay error={error} />
            <PurchaseInvoiceForm
                isSubmitting={update.fetching}
                onSubmit={handleSubmit}
                isLoading={fetching}
                data={data && data.purchaseInvoice}
            />
        </Box>
    );
};

export default EditPurchaseInvoice;
