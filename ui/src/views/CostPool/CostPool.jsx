import React, { useRef } from "react";
import {
    Box,
    Button,
    Spinner,
    Heading,
    Divider,
    Link,
    Badge,
    Flex,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    useToast,
    Text,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from "@chakra-ui/core";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useQuery, useMutation } from "urql";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { DL, DT, DD } from "../../components/DescriptionList";
import { formatCurrency, formatDate } from "../../util/format";
import {
    Table,
    THead,
    TBody,
    TR,
    TH,
    TD,
    TableContainer,
} from "../../components/Table";
import { statusColors, statuses } from "../../util/metadata";
import CostPoolForm from "../../forms/CostPoolForm";
import { Edit, Trash2 } from "react-feather";

const query = `
    query FetchCostPoolItems($id: ID!) {
        costPool(id: $id) {
            id
            name
            budget
            total
            costClaims {
                id
                description
                created
                author {
                    name
                }
                status
                total
            }
            salesInvoices {
                id
                dueDate
                total
            }
            purchaseInvoices {
                id
                dueDate
                total
            }
        }
    }
`;

const mutation = `
    mutation UpdateCostPool($id: ID!, $costPool: CostPoolInput!) {
        updateCostPool(id: $id, costPool: $costPool) {
            id
            name
            budget
        }
    }
`;

const deleteMutation = `
    mutation DeleteCostPool($id: ID!) {
        deleteCostPool(id: $id)
    }
`;

const CostPoolDelete = (props) => {
    const { children, id } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const [deletion, deleteCostPool] = useMutation(deleteMutation);
    const toast = useToast();
    const history = useHistory();

    const handleDelete = () => {
        deleteCostPool({ id }).then(({ error }) => {
            if (error) {
                toast({
                    status: "error",
                    title: "Tapahtui virhe!",
                    description: error.message,
                    position: "top",
                });
            } else {
                toast({
                    status: "info",
                    title: "Kustannuspaikka poistettu",
                    position: "top",
                });
                history.push("/costPools");
            }
        });
    };

    return (
        <React.Fragment>
            {React.cloneElement(children, { onClick: onOpen })}
            <AlertDialog
                leastDestructiveRef={cancelRef}
                isOpen={isOpen}
                onClose={onClose}
                preserveScrollBarGap={true}
            >
                <AlertDialogOverlay />
                <AlertDialogContent rounded="md">
                    <AlertDialogHeader>
                        Poista kustannuspaikka
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        Oletko varma? Toimintoa ei voi perua.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Peruuta
                        </Button>
                        <Button
                            isLoading={deletion.fetching}
                            onClick={handleDelete}
                            variantColor="red"
                            ml={3}
                        >
                            Poista
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </React.Fragment>
    );
};

const CostPoolView = (props) => {
    const { costPool } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [update, updateCostPool] = useMutation(mutation);
    const toast = useToast();

    const onSubmit = (data) => {
        updateCostPool({ id: costPool.id, costPool: data }).then((res) => {
            if (!res.error) {
                onClose();
                toast({
                    title: "Kustannuspaikka päivitetty",
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
        <React.Fragment>
            <Heading as="h2">{costPool.name}</Heading>
            <Flex align="center" mb={6}>
                <Text fontSize="xl" color="gray.600">
                    Kustannuspaikka
                </Text>
                <Box flexGrow={1} />
                <Button
                    flexShrink={0}
                    ml={4}
                    variant="outline"
                    variantColor="indigo"
                    size="sm"
                    onClick={onOpen}
                >
                    <Text display={["none", "inline-block"]} mr={2}>
                        Muokkaa
                    </Text>
                    <Edit size="1em" />
                </Button>
                <CostPoolDelete id={costPool.id}>
                    <Button
                        flexShrink={0}
                        ml={4}
                        variant="outline"
                        variantColor="red"
                        size="sm"
                    >
                        <Text display={["none", "inline-block"]} mr={2}>
                            Poista
                        </Text>
                        <Trash2 size="1em" />
                    </Button>
                </CostPoolDelete>
            </Flex>
            <DL>
                <DT>Budjetti</DT>
                <DD>{formatCurrency(costPool.budget)}</DD>
                <DT>Käytetty</DT>
                <DD>{formatCurrency(costPool.total)}</DD>
                <DT>Jäljellä</DT>
                <DD>{formatCurrency(costPool.budget - costPool.total)}</DD>
            </DL>

            {costPool.costClaims.length > 0 ? (
                <React.Fragment>
                    <Divider my={6} />
                    <Heading mb={6} as="h3" size="lg">
                        Liittyvät kulukorvaukset
                    </Heading>
                    <TableContainer>
                        <Table>
                            <THead>
                                <TR>
                                    <TH
                                        display={["none", "table-cell"]}
                                        textAlign="left"
                                    >
                                        Luotu
                                    </TH>
                                    <TH textAlign="left">Kuvaus</TH>
                                    <TH
                                        display={["none", "table-cell"]}
                                        textAlign="left"
                                    >
                                        Tekijä
                                    </TH>
                                    <TH
                                        display={["none", "table-cell"]}
                                        textAlign="right"
                                    >
                                        Tila
                                    </TH>
                                    <TH textAlign="right">Summa</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {costPool.costClaims.map((claim) => (
                                    <TR key={claim.id}>
                                        <TD display={["none", "table-cell"]}>
                                            {formatDate(claim.created)}
                                        </TD>
                                        <TD py={4}>
                                            <Link
                                                as={RouterLink}
                                                color="indigo.700"
                                                to={`/costClaims/${claim.id}`}
                                            >
                                                {claim.description}
                                            </Link>
                                        </TD>
                                        <TD display={["none", "table-cell"]}>
                                            <Link
                                                as={RouterLink}
                                                color="indigo.700"
                                                to="/users"
                                            >
                                                {claim.author.name}
                                            </Link>
                                        </TD>
                                        <TD
                                            display={["none", "table-cell"]}
                                            textAlign="right"
                                        >
                                            <Badge
                                                fontSize="0.8em"
                                                mr={-1}
                                                variantColor={
                                                    statusColors[claim.status]
                                                }
                                            >
                                                {statuses[claim.status]}
                                            </Badge>
                                        </TD>
                                        <TD textAlign="right">
                                            {formatCurrency(claim.total)}
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    </TableContainer>
                </React.Fragment>
            ) : null}

            {costPool.purchaseInvoices.length > 0 ? (
                <React.Fragment>
                    <Divider my={6} />
                    <Heading my={4} as="h3" size="lg">
                        Liittyvät ostolaskut
                    </Heading>
                </React.Fragment>
            ) : null}

            {costPool.salesInvoices.length > 0 ? (
                <React.Fragment>
                    <Divider my={6} />
                    <Heading my={4} as="h3" size="lg">
                        Liittyvät myyntilaskut
                    </Heading>
                </React.Fragment>
            ) : null}

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                closeOnOverlayClick={false}
            >
                <ModalOverlay />
                <ModalContent rounded="md">
                    <ModalHeader>Muokkaa kustannuspaikkaa</ModalHeader>
                    <ModalBody>
                        <CostPoolForm
                            isLoading={update.fetching}
                            onSubmit={onSubmit}
                            onClose={onClose}
                            data={costPool}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
};

const CostPool = (props) => {
    const [result] = useQuery({
        query,
        variables: {
            id: props.match.params.id,
        },
    });
    return (
        <Box maxWidth="800px" margin="auto">
            <Button
                as={RouterLink}
                leftIcon="arrow-back"
                variant="link"
                variantColor="indigo"
                to="/costPools"
                my={4}
            >
                Takaisin
            </Button>
            {result.fetching ? (
                <Spinner color="indigo.500" display="block" />
            ) : null}
            <ErrorDisplay error={result.error} />
            {result.data ? (
                <CostPoolView costPool={result.data.costPool} />
            ) : null}
        </Box>
    );
};

export default CostPool;
