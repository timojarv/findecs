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
import { Edit, Trash2, Printer } from "react-feather";
import { DL, DT, DD } from "../../components/DescriptionList";
import { statuses, statusColors } from "../../util/metadata";
import { formatDateTime, formatCurrency, formatDate } from "../../util/format";
import { useQuery, useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useMessage } from "../../util/message";

const query = `
    query FetchSalesInvoice ($id: ID!) {
        salesInvoice(id: $id) {
            id
            runningNumber
            recipient {
                id
                name
            }
            date
            dueDate
            status
            created
            modified
            details
            contactPerson
            payerReference
            author {
                id
                name
            }
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
    mutation DeleteSalesInvoice($id: ID!) {
        deleteSalesInvoice(id: $id)
    }
`;

const SalesInvoiceDelete = (props) => {
    const { children, id } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const [deletion, deleteSalesInvoice] = useMutation(deleteMutation);
    const { infoMessage, errorMessage } = useMessage();
    const history = useHistory();

    const handleDelete = () => {
        deleteSalesInvoice({ id }).then(({ error }) => {
            if (error) {
                errorMessage(error.message);
            } else {
                infoMessage("Myyntilasku poistettu");
                history.push("/salesInvoices");
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
                    <AlertDialogHeader>Poista myyntilasku</AlertDialogHeader>
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
                    Lasku #{invoice.runningNumber}
                </Heading>
            </Flex>
            <Flex align="center" mt={2} mb={6}>
                <Text fontSize="xl" color="gray.600">
                    Myyntilasku
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
                    variant="outline"
                    variantColor="indigo"
                    size="sm"
                    as={RouterLink}
                    target="_blank"
                    to={`/salesInvoices/${invoice.id}/print`}
                >
                    <Text display={["none", "inline-block"]} mr={2}>
                        Tulosta
                    </Text>
                    <Printer size="1em" />
                </Button>
                <Button
                    flexShrink={0}
                    ml={4}
                    variant="outline"
                    variantColor="indigo"
                    size="sm"
                    as={RouterLink}
                    to={`/salesInvoices/${invoice.id}/edit`}
                >
                    <Text display={["none", "inline-block"]} mr={2}>
                        Muokkaa
                    </Text>
                    <Edit size="1em" />
                </Button>
                <SalesInvoiceDelete id={invoice.id}>
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
                </SalesInvoiceDelete>
            </Flex>
            <DL>
                <DT>Päiväys</DT>
                <DD>{formatDate(invoice.date)}</DD>
                <DT>Vastaanottaja</DT>
                <DD>
                    <Link
                        as={RouterLink}
                        to={`/contacts/${invoice.recipient.id}`}
                        color="indigo.700"
                    >
                        {invoice.recipient.name}
                    </Link>
                </DD>
                {invoice.contactPerson ? (
                    <React.Fragment>
                        <DT>Yhteyshenkilö</DT>
                        <DD>{invoice.contactPerson}</DD>
                    </React.Fragment>
                ) : null}
                {invoice.payerReference ? (
                    <React.Fragment>
                        <DT>Maksajan viite</DT>
                        <DD>{invoice.payerReference}</DD>
                    </React.Fragment>
                ) : null}
                <DT>Eräpäivä</DT>
                <DD>{formatDate(invoice.dueDate)}</DD>
                <DT>Tekijä</DT>
                <DD>
                    <Link
                        as={RouterLink}
                        color="indigo.700"
                        to={`/users/${invoice.author.id}`}
                    >
                        {invoice.author.name}
                    </Link>
                </DD>
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

const SalesInvoice = (props) => {
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
                to="/salesInvoices"
                my={4}
            >
                Takaisin
            </Button>
            {fetching ? <Spinner color="indigo.500" display="block" /> : null}
            <ErrorDisplay error={error} />
            {data ? <Invoice invoice={data.salesInvoice} /> : null}
        </Box>
    );
};

export default SalesInvoice;
