import React, { useRef } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import {
    Box,
    Heading,
    Divider,
    Flex,
    Button,
    Text,
    Link,
    Badge,
    Spinner,
    useDisclosure,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from "@chakra-ui/core";
import { Edit, Trash2 } from "react-feather";
import { DL, DT, DD } from "../../components/DescriptionList";
import { statuses, statusColors } from "../../util/metadata";
import { formatDateTime, formatCurrency, formatDate } from "../../util/format";
import { useQuery, useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useMessage } from "../../util/message";

const query = `
    query FetchPurchaseInvoice ($id: ID!) {
        purchaseInvoice(id: $id) {
            id
            description
            sender {
                id
                name
            }
            dueDate
            status
            author {
                id
                name
            }
            approvedBy {
                id
                name
            }
            created
            modified
            details
            rows {
                id
                description
                costPool {
                    id
                    name
                }
                amount
            }
            total
        }
    }
`;

const deleteMutation = `
    mutation DeletePurchaseInvoice($id: ID!) {
        deletePurchaseInvoice(id: $id)
    }
`;

const PurchaseInvoiceDelete = (props) => {
    const { children, id } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const [deletion, deletePurchaseInvoice] = useMutation(deleteMutation);
    const { infoMessage, errorMessage } = useMessage();
    const history = useHistory();

    const handleDelete = () => {
        deletePurchaseInvoice({ id }).then(({ error }) => {
            if (error) {
                errorMessage(error.message);
            } else {
                infoMessage("Ostolasku poistettu");
                history.push("/purchaseInvoices");
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
                    <AlertDialogHeader>Poista ostolasku</AlertDialogHeader>
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

const Invoice = ({ invoice }) => {
    return (
        <React.Fragment>
            <Flex align="baseline">
                <Heading flexGrow={1} as="h2">
                    {invoice.description}
                </Heading>
            </Flex>
            <Flex align="center" mt={2} mb={6}>
                <Text fontSize="xl" color="gray.600">
                    Ostolasku
                </Text>
                <Text color="gray.400" mx={3}>
                    &bull;
                </Text>
                <Badge
                    rounded="md"
                    py={1}
                    px={2}
                    variantColor={statusColors[invoice.status]}
                >
                    {statuses[invoice.status]}
                </Badge>
                <Box flexGrow={1} />
                <Button
                    flexShrink={0}
                    ml={4}
                    variant="outline"
                    variantColor="indigo"
                    size="sm"
                    as={RouterLink}
                    to={`/purchaseInvoices/${invoice.id}/edit`}
                >
                    <Text display={["none", "inline-block"]} mr={2}>
                        Muokkaa
                    </Text>
                    <Edit size="1em" />
                </Button>
                <PurchaseInvoiceDelete id={invoice.id}>
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
                </PurchaseInvoiceDelete>
            </Flex>
            <DL>
                <DT>Lähettäjä</DT>
                <DD>
                    <Link
                        as={RouterLink}
                        to={`/contacts/${invoice.sender.id}`}
                        color="indigo.700"
                    >
                        {invoice.sender.name}
                    </Link>
                </DD>
                <DT>Eräpäivä</DT>
                <DD>{formatDate(invoice.dueDate)}</DD>
                <DT>Tekijä</DT>
                <DD>
                    <Link
                        as={RouterLink}
                        to={`/users/${invoice.author.id}`}
                        color="indigo.700"
                    >
                        {invoice.author.name}
                    </Link>
                </DD>
                {invoice.approvedBy ? (
                    <React.Fragment>
                        <DT>Hyväksyjä</DT>
                        <DD>
                            <Link
                                as={RouterLink}
                                color="indigo.700"
                                to={`/users/${invoice.approvedBy.id}`}
                            >
                                {invoice.approvedBy.name}
                            </Link>
                        </DD>
                    </React.Fragment>
                ) : null}
                <DT>Luotu</DT>
                <DD>{formatDateTime(invoice.created)}</DD>
                {invoice.modified ? (
                    <React.Fragment>
                        <DT>Muokattu</DT>
                        <DD>{formatDateTime(invoice.modified)}</DD>
                    </React.Fragment>
                ) : null}
                {invoice.details ? (
                    <React.Fragment>
                        <DT>Lisätiedot</DT>
                        <DD>{invoice.details}</DD>
                    </React.Fragment>
                ) : null}
            </DL>
            <Divider my={6} />
            <Box as="table" width="100%">
                <thead>
                    <tr>
                        <Text as="th" fontWeight="bold" pb={3} textAlign="left">
                            Kustannuspaikka
                        </Text>
                        <Text as="th" fontWeight="bold" pb={3} textAlign="left">
                            Kuvaus
                        </Text>
                        <Text
                            as="th"
                            fontWeight="bold"
                            pb={3}
                            textAlign="right"
                        >
                            Summa
                        </Text>
                    </tr>
                </thead>
                <tbody>
                    {invoice.rows.map((row) => (
                        <tr key={row.id}>
                            <Text
                                as="td"
                                color="gray.700"
                                pb={3}
                                textAlign="left"
                            >
                                <Link
                                    color="indigo.700"
                                    as={RouterLink}
                                    to={`/costPools/${row.costPool.id}`}
                                >
                                    {row.costPool.name}
                                </Link>
                            </Text>
                            <Text
                                as="td"
                                color="gray.700"
                                pb={3}
                                textAlign="left"
                            >
                                {row.description}
                            </Text>
                            <Text
                                as="td"
                                color="gray.700"
                                pb={3}
                                textAlign="right"
                            >
                                {formatCurrency(row.amount)}
                            </Text>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <Text
                            as="td"
                            borderTop="1px"
                            borderColor="gray.200"
                            pt={3}
                            textAlign="left"
                        ></Text>
                        <Text
                            as="td"
                            borderTop="1px"
                            borderColor="gray.200"
                            pt={3}
                            fontWeight="bold"
                            textAlign="left"
                        >
                            Yhteensä:
                        </Text>
                        <Text
                            as="td"
                            borderTop="1px"
                            borderColor="gray.200"
                            pt={3}
                            fontWeight="bold"
                            textAlign="right"
                        >
                            {formatCurrency(invoice.total)}
                        </Text>
                    </tr>
                </tfoot>
            </Box>
        </React.Fragment>
    );
};

const PurchaseInvoice = (props) => {
    const id = props.match.params.id;

    const [result] = useQuery({ query, variables: { id } });

    const { fetching, error, data } = result;

    return (
        <Box maxWidth="800px" margin="auto">
            <Button
                as={RouterLink}
                leftIcon="arrow-back"
                variant="link"
                variantColor="indigo"
                to="/purchaseInvoices"
                my={4}
            >
                Takaisin
            </Button>
            {fetching ? <Spinner color="indigo.500" display="block" /> : null}
            <ErrorDisplay error={error} />
            {data ? <Invoice invoice={data.purchaseInvoice} /> : null}
        </Box>
    );
};

export default PurchaseInvoice;
