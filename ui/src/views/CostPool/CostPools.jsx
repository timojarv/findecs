import React, { useState, useEffect } from "react";
import {
    Heading,
    Box,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    Link,
} from "@chakra-ui/core";
import { useQuery, useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import {
    TableContainer,
    Table,
    THead,
    TR,
    TH,
    TBody,
    TD,
} from "../../components/Table";
import { Link as RouterLink } from "react-router-dom";
import { formatCurrency } from "../../util/format";
import CostPoolForm from "../../forms/CostPoolForm";
import Pagination from "../../components/Pagination";
import Empty from "../../components/Empty";
import { useMessage } from "../../util/message";
import { useSortable } from "../../util/hooks";

const limit = 20;

const query = `
    query FetchCostPools($offset: Int! = 0, $sortOptions: SortOptions) {
        costPools(offset: $offset, limit: ${limit}, sortOptions: $sortOptions) {
            nodes {
                id
                name
                budget
                total
            }
            totalCount
        }
    }
`;

const mutation = `
    mutation CreateCostPool ($costPool: CostPoolInput!) {
        createCostPool(costPool: $costPool) {
            id
            name
            budget
            total
        }
    }
`;

const CostPools = (props) => {
    const [creation, createCostPool] = useMutation(mutation);
    const { successMessage, errorMessage } = useMessage();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [offset, setOffset] = useState(0);
    const [sortOptions, sortable] = useSortable({ key: 'name', order: 'asc' });
    const [result] = useQuery({
        query,
        variables: { offset, sortOptions },
    });

    const { fetching, error, data } = result;

    const pools = data ? data.costPools.nodes : [];

    const onSubmit = (data) => {
        createCostPool({ costPool: data }).then((res) => {
            if (!res.error) {
                onClose();
                successMessage("Kustannuspaikka luotu");
                props.history.push(`/costPools/${res.data.createCostPool.id}`);
            } else {
                errorMessage(res.error.message);
            }
        });
    };

    return (
        <Box maxWidth="800px" margin="auto" pt={8}>
            <Heading as="h2">Kustannuspaikat</Heading>
            <Button
                leftIcon="add"
                variantColor="indigo"
                my={6}
                onClick={onOpen}
            >
                Luo uusi
            </Button>
            <ErrorDisplay error={error} />
            <TableContainer>
                <Table>
                    <THead>
                        <TR>
                            <TH {...sortable('name')} textAlign="left">Nimi</TH>
                            <TH {...sortable('budget')} textAlign="right">Budjetti</TH>
                            <TH
                                display={["none", "table-cell"]}
                                textAlign="right"
                            >
                                Käytetty
                            </TH>
                            <TH
                                display={["none", "table-cell"]}
                                textAlign="right"
                            >
                                Jäljellä
                            </TH>
                        </TR>
                    </THead>
                    <TBody>
                        {((!error && pools) ? pools : []).map((pool) => (
                            <TR key={pool.id}>
                                <TD py={2}>
                                    <Link
                                        as={RouterLink}
                                        to={`/costPools/${pool.id}`}
                                        color="indigo.700"
                                    >
                                        {pool.name}
                                    </Link>
                                </TD>
                                <TD textAlign="right">
                                    {formatCurrency(pool.budget)}
                                </TD>
                                <TD
                                    display={["none", "table-cell"]}
                                    textAlign="right"
                                >
                                    {formatCurrency(pool.total)}
                                </TD>
                                <TD
                                    display={["none", "table-cell"]}
                                    textAlign="right"
                                >
                                    {formatCurrency(pool.budget - pool.total)}
                                </TD>
                            </TR>
                        ))}
                    </TBody>
                </Table>
                <Empty visible={!pools.length} />
                <Pagination
                    isLoading={fetching}
                    onChange={setOffset}
                    total={data && data.costPools.totalCount}
                    limit={limit}
                    offset={offset}
                />
            </TableContainer>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                closeOnOverlayClick={false}
                preserveScrollBarGap={true}
            >
                <ModalOverlay />
                <ModalContent rounded="md">
                    <ModalHeader>Uusi kustannuspaikka</ModalHeader>
                    <ModalBody>
                        <CostPoolForm
                            onClose={onClose}
                            onSubmit={onSubmit}
                            isLoading={creation.fetching}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default CostPools;
