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
    useToast,
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

const limit = 20;

const query = `
    query FetchCostPools($offset: Int! = 0) {
        costPools(offset: $offset, limit: ${limit}) {
            id
            name
            budget
            total
        }
        costPoolCount
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

const CostPoolsTable = (props) => {
    const [offset, setOffset] = useState(0);
    const [result] = useQuery({
        query,
        variables: { offset },
    });

    const { fetching, error, data } = result;

    const pools = data ? data.costPools : [];

    return (
        <TableContainer>
            <Table>
                <THead>
                    <TR>
                        <TH textAlign="left">Nimi</TH>
                        <TH textAlign="right">Budjetti</TH>
                        <TH display={["none", "table-cell"]} textAlign="right">
                            Käytetty
                        </TH>
                        <TH display={["none", "table-cell"]} textAlign="right">
                            Jäljellä
                        </TH>
                    </TR>
                </THead>
                <TBody>
                    {(pools || []).map((pool) => (
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
            <Pagination
                isLoading={fetching}
                onChange={setOffset}
                total={data && data.costPoolCount}
                limit={limit}
                offset={offset}
            />
            <ErrorDisplay error={error} />
        </TableContainer>
    );
};

const CostPools = (props) => {
    const [creation, createCostPool] = useMutation(mutation);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const onSubmit = (data) => {
        createCostPool({ costPool: data }).then((res) => {
            if (!res.error) {
                onClose();
                refetch();
                toast({
                    title: "Kustannuspaikka luotu",
                    status: "success",
                    position: "top",
                });
            } else {
                toast({
                    title: "Jokin meni vikaan!",
                    description: res.error.message,
                    status: "error",
                    position: "top",
                });
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
            <CostPoolsTable />
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                closeOnOverlayClick={false}
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
