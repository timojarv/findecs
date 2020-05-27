import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Box,
    Heading,
    Link,
    Badge,
    Button,
    Spinner,
    IconButton,
    Tooltip,
    Flex,
} from "@chakra-ui/core";
import {
    TableContainer,
    Table,
    THead,
    TR,
    TH,
    TBody,
    TD,
} from "../../components/Table";
import { statuses, statusColors } from "../../util/metadata";
import { formatCurrency, formatDate } from "../../util/format";
import { useQuery, useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import Empty from "../../components/Empty";
import Pagination from "../../components/Pagination";
import ViewOptions from "../../components/ViewOptions";

const limit = 15;

const query = `
    query FetchCostClaims($offset: Int! = 0, $viewOptions: ViewOptions) {
        costClaims(offset: $offset, limit: ${limit}, viewOptions: $viewOptions) {
            nodes {
                id
                description
                created
                total
                status
                author {
                    id
                    name
                }
            }
            totalCount
        }
    }
`;

const mutation = `
    mutation SetCostClaimStatus($id: ID!, $status: Status!) {
        setCostClaimStatus(id: $id, status: $status) {
            id
            status
        }
    }
`;

const ClaimRow = ({ claim }) => {
    const [setting, setStatus] = useMutation(mutation);
    return (
        <TR key={claim.id}>
            <TD>
                <Link
                    as={RouterLink}
                    to={`/costClaims/${claim.id}`}
                    color="indigo.700"
                    display="block"
                >
                    {claim.description}
                </Link>
            </TD>
            <TD display={["none", "table-cell"]}>
                <Link
                    whiteSpace="nowrap"
                    as={RouterLink}
                    to="/users/timojarv"
                    color="indigo.700"
                >
                    {claim.author.name}
                </Link>
            </TD>
            <TD textAlign="center">{formatDate(claim.created)}</TD>
            <TD textAlign="right">{formatCurrency(claim.total)}</TD>
            <TD width={[20, 32]} textAlign="right">
                <Badge
                    fontSize="0.8em"
                    mr={-1}
                    variantColor={statusColors[claim.status]}
                >
                    {statuses[claim.status]}
                </Badge>
            </TD>
            <TD width={32} display={["none", "table-cell"]} textAlign="right">
                {setting.fetching ? (
                    <Spinner size="sm" color="indigo.500" />
                ) : (
                    <React.Fragment>
                        <Tooltip placement="top" label="Hylkää">
                            <IconButton
                                mr={3}
                                icon="not-allowed"
                                variant="ghost"
                                variantColor="red"
                                display={
                                    claim.status !== "approved" &&
                                    claim.status !== "created" &&
                                    "none"
                                }
                                onClick={() =>
                                    setStatus({
                                        id: claim.id,
                                        status: "rejected",
                                    })
                                }
                            />
                        </Tooltip>
                        <Tooltip placement="top" label="Hyväksy">
                            <IconButton
                                onClick={() =>
                                    setStatus({
                                        id: claim.id,
                                        status: "approved",
                                    })
                                }
                                display={
                                    claim.status !== "rejected" &&
                                    claim.status !== "created" &&
                                    "none"
                                }
                                icon="check"
                                variant="ghost"
                                variantColor="green"
                            />
                        </Tooltip>
                        <Tooltip placement="top" label="Merkitse maksetuksi">
                            <IconButton
                                onClick={() =>
                                    setStatus({
                                        id: claim.id,
                                        status: "paid",
                                    })
                                }
                                display={claim.status !== "approved" && "none"}
                                icon="check-circle"
                                variant="ghost"
                                variantColor="indigo"
                            />
                        </Tooltip>
                    </React.Fragment>
                )}
            </TD>
        </TR>
    );
};

const CostClaims = (props) => {
    const [offset, setOffset] = useState(0);
    const [viewOptions, setViewOptions] = useState(null);
    const [result] = useQuery({ query, variables: { offset, viewOptions } });

    const { fetching, error, data } = result;
    const claims = data ? data.costClaims.nodes : [];

    return (
        <Box pt={8}>
            <Heading as="h2">Kulukorvaukset</Heading>
            <Flex justify="space-between" my={6}>
                <Button
                    as={RouterLink}
                    leftIcon="add"
                    variantColor="indigo"
                    to="/costClaims/new"
                >
                    Luo uusi
                </Button>
                <ViewOptions onChange={setViewOptions} />
            </Flex>
            <ErrorDisplay error={error} />
            <TableContainer>
                <Table>
                    <THead>
                        <TR>
                            <TH textAlign="left">Kuvaus</TH>
                            <TH
                                display={["none", "table-cell"]}
                                textAlign="left"
                            >
                                Tekijä
                            </TH>
                            <TH textAlign="center">Luotu</TH>
                            <TH textAlign="right">Summa</TH>
                            <TH textAlign="right">Tila</TH>
                            <TH display={["none", "table-cell"]}></TH>
                        </TR>
                    </THead>
                    <TBody>
                        {claims.map((claim) => (
                            <ClaimRow key={claim.id} claim={claim} />
                        ))}
                    </TBody>
                </Table>
                <Empty visible={!claims.length} />
                <Pagination
                    offset={offset}
                    onChange={setOffset}
                    limit={limit}
                    isLoading={fetching}
                    total={data && data.costClaims.totalCount}
                />
            </TableContainer>
        </Box>
    );
};

export default CostClaims;
