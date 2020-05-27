import React from "react";
import { Box, Heading, Button } from "@chakra-ui/core";
import SalesInvoiceForm from "../../forms/SalesInvoiceForm";
import { Link as RouterLink } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useMessage } from "../../util/message";

const query = `
    query FetchSalesInvoice($id: ID!) {
        salesInvoice(id: $id) {
            id
            recipient {
                id
                name
            }
            runningNumber
            date
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

const mutation = `
    mutation UpdateSalesInvoice($id: ID!, $invoice: SalesInvoiceInput!, $rows: [InvoiceRowInput!]!) {
        updateSalesInvoice(id: $id, invoice: $invoice, rows: $rows) {
            id
            recipient {
                id
                name
            }
            runningNumber
            date
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

const EditSalesInvoice = (props) => {
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
                infoMessage("Myyntilasku päivitetty");
                props.history.push(`/salesInvoices/${id}`);
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
                to={`/salesInvoices/${id}`}
            >
                Takaisin
            </Button>
            <Heading mb={8} as="h2">
                Muokkaa myyntilaskua
            </Heading>
            <ErrorDisplay error={error} />
            <SalesInvoiceForm
                isSubmitting={update.fetching}
                isLoading={fetching}
                data={data && data.salesInvoice}
                onSubmit={handleSubmit}
            />
        </Box>
    );
};

export default EditSalesInvoice;
