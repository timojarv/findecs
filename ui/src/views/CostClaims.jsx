import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import produce from 'immer';
import {
    Box,
    Heading,
    Flex,
    Checkbox,
    Link,
    Badge,
    MenuButton,
    Menu,
    Button,
    MenuList,
    MenuItem,
    Text,
    Spinner,
} from '@chakra-ui/core';
import {
    TableContainer,
    Table,
    THead,
    TR,
    TH,
    TBody,
    TD,
} from '../components/Table';
import { MoreVertical } from 'react-feather';
import { statuses, statusColors } from '../util/metadata';
import { formatCurrency, formatDate } from '../util/format';
import { useQuery } from 'urql';
import ErrorDisplay from '../components/ErrorDisplay';

const query = `
    query {
        costClaims {
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
    }
`;

const renderClaim = (selected, handleSelect) => (claim) => (
    <TR key={claim.id}>
        <TD display={['none', 'table-cell']} pr={[1, 1]} pl={[4, 6]}>
            <Flex py={4} align="center">
                <Checkbox
                    isChecked={selected.has(claim.id)}
                    onChange={() => handleSelect(claim.id)}
                    size="lg"
                    variantColor="indigo"
                />
            </Flex>
        </TD>
        <TD>
            <Link
                as={RouterLink}
                to={`/costClaims/${claim.id}`}
                color="indigo.600"
                py={2}
                display="block"
            >
                {claim.description}
            </Link>
        </TD>
        <TD display={['none', 'table-cell']}>
            <Link
                whiteSpace="nowrap"
                as={RouterLink}
                to="/users/timojarv"
                color="indigo.600"
            >
                {claim.author.name}
            </Link>
        </TD>
        <TD>{formatDate(claim.created)}</TD>
        <TD textAlign="right">{formatCurrency(claim.total)}</TD>
        <TD textAlign="right">
            <Badge
                fontSize="0.8em"
                mr={-1}
                variantColor={statusColors[claim.status]}
            >
                {statuses[claim.status]}
            </Badge>
        </TD>
        <TD display={['none', 'table-cell']} width={8}>
            <Menu>
                <MenuButton
                    color="gray.500"
                    as={Button}
                    variant="ghost"
                    size="xs"
                >
                    <MoreVertical />
                </MenuButton>
                <MenuList>
                    <MenuItem>Hyväksy</MenuItem>
                    <MenuItem>Muokkaa</MenuItem>
                    <MenuItem color="red.500">Poista</MenuItem>
                </MenuList>
            </Menu>
        </TD>
    </TR>
);

const CostClaims = (props) => {
    // Row selection
    const [selected, setSelected] = useState(new Set());

    const [result] = useQuery({ query });
    const claims = result.data ? result.data.costClaims : [];

    const handleSelect = (key) => {
        if (selected.has(key)) {
            setSelected(
                produce(selected, (draft) => {
                    draft.delete(key);
                })
            );
        } else {
            setSelected(
                produce(selected, (draft) => {
                    draft.add(key);
                })
            );
        }
    };

    const handleSelectAll = () => {
        if (selected.size === claims.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(claims.map(({ id }) => id)));
        }
    };

    return (
        <Box pt={8}>
            <Heading as="h2">Kulukorvaukset</Heading>
            <Flex align="center" my={6}>
                <Button
                    as={RouterLink}
                    leftIcon="add"
                    variantColor="indigo"
                    to="/costClaims/new"
                >
                    Luo uusi
                </Button>
                <Box flexGrow={1} />
                {selected.size > 0 ? (
                    <Flex align="baseline">
                        <Text fontSize="sm" color="gray.700" mr={3} as="strong">
                            Valitut:{' '}
                        </Text>
                        <Button
                            ml={2}
                            variant="solid"
                            size="sm"
                            variantColor="green"
                        >
                            Hyväksy
                        </Button>
                        <Button
                            ml={2}
                            variant="solid"
                            size="sm"
                            variantColor="red"
                        >
                            Hylkää
                        </Button>
                        <Button
                            ml={2}
                            variant="solid"
                            size="sm"
                            variantColor="red"
                        >
                            Poista
                        </Button>
                    </Flex>
                ) : null}
            </Flex>
            {result.fetching ? <Spinner color="indigo.500" size="xl" /> : null}
            <ErrorDisplay error={result.error} />
            {result.data ? (
                <TableContainer>
                    <Table>
                        <THead>
                            <TR>
                                <TH
                                    display={['none', 'table-cell']}
                                    pl={[4, 6]}
                                    pr={[0, 0]}
                                >
                                    <Checkbox
                                        size="lg"
                                        variantColor="indigo"
                                        isChecked={
                                            selected.size === claims.length
                                        }
                                        isIndeterminate={
                                            selected.size < claims.length &&
                                            selected.size !== 0
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </TH>
                                <TH textAlign="left">Kuvaus</TH>
                                <TH
                                    display={['none', 'table-cell']}
                                    textAlign="left"
                                >
                                    Tekijä
                                </TH>
                                <TH textAlign="left">Päiväys</TH>
                                <TH textAlign="right">Summa</TH>
                                <TH textAlign="right">Tila</TH>
                                <TH display={['none', 'table-cell']}></TH>
                            </TR>
                        </THead>
                        <TBody>
                            {claims.map(renderClaim(selected, handleSelect))}
                        </TBody>
                    </Table>
                </TableContainer>
            ) : null}
        </Box>
    );
};

export default CostClaims;
