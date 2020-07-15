import React, { useState } from "react";
import { Box, Heading, Button, Flex } from "@chakra-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { TableContainer } from "../../components/Table";
import Pagination from "../../components/Pagination";
import { useQuery } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import SalesInvoiceList from "../../components/SalesInvoiceList";
import Empty from "../../components/Empty";
import ViewOptions from "../../components/ViewOptions";
import { useSortable } from "../../util/hooks";

const limit = 20;

const query = `
    query FetchSalesInvoices($offset: Int! = 0, $viewOptions: ViewOptions, $sortOptions: SortOptions) {
        salesInvoices(limit: ${limit}, offset: $offset, viewOptions: $viewOptions, sortOptions: $sortOptions) {
            nodes {
                id
                recipient {
                    id
                    name
                }
                runningNumber
                date
                dueDate
                total
            }
            totalCount
        }
    }
`;

const SalesInvoices = (props) => {
    const [offset, setOffset] = useState(0);
    const [viewOptions, setViewOptions] = useState();
    const [sortOptions, sortable] = useSortable({ key: 'runningNumber', order: 'desc' });
    const [result] = useQuery({
        query,
        variables: { offset, viewOptions, sortOptions },
    });

    const { fetching, error, data } = result;
    const invoices = data ? data.salesInvoices.nodes : [];

    return (
        <Box pt={8}>
            <Heading as="h2">Myyntilaskut</Heading>
            <Flex my={6} justify="space-between">
                <Button
                    as={RouterLink}
                    variantColor="indigo"
                    to="/salesInvoices/new"
                    leftIcon="add"
                >
                    Luo uusi
                </Button>
                <ViewOptions
                    onChange={setViewOptions}
                    disabledStatuses={["approved", "rejected"]}
                />
            </Flex>
            <ErrorDisplay error={error} />
            <TableContainer>
                <SalesInvoiceList sortable={sortable} invoices={invoices} />
                <Empty visible={!invoices.length} />
                <Pagination
                    isLoading={fetching}
                    limit={limit}
                    offset={offset}
                    onChange={setOffset}
                    total={data && data.salesInvoices.totalCount}
                />
            </TableContainer>
        </Box>
    );
};

export default SalesInvoices;
