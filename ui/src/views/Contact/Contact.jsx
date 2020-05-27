import React, { useRef } from "react";
import {
    Box,
    Button,
    Spinner,
    Heading,
    Divider,
    Flex,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
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
import { Edit, Trash2 } from "react-feather";
import ContactForm from "../../forms/ContactForm";
import { DL, DT, DD } from "../../components/DescriptionList";
import { TableContainer } from "../../components/Table";
import PurchaseInvoiceList from "../../components/PurchaseInvoiceList";
import SalesInvoiceList from "../../components/SalesInvoiceList";
import { useMessage } from "../../util/message";

const query = `
    query FetchContactItems($id: ID!) {
        contact(id: $id) {
            id
            name
            address
            salesInvoices {
                id
                runningNumber
                date
                dueDate
                total
                recipient {
                    id
                    name
                }
            }
            purchaseInvoices {
                id
                description
                created
                dueDate
                total
                sender {
                    id
                    name
                }
            }
        }
    }
`;

const mutation = `
    mutation UpdateContact($id: ID!, $contact: ContactInput!) {
        updateContact(id: $id, contact: $contact) {
            id
            name
            address
        }
    }
`;

const deleteMutation = `
    mutation DeleteContact($id: ID!) {
        deleteContact(id: $id)
    }
`;

const ContactDelete = (props) => {
    const { children, id } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const [deletion, deleteContact] = useMutation(deleteMutation);
    const { errorMessage, infoMessage } = useMessage();
    const history = useHistory();

    const handleDelete = () => {
        deleteContact({ id }).then(({ error }) => {
            if (error) {
                errorMessage(error.msg);
            } else {
                infoMessage("Yhteystieto poistettu");
                history.push("/contacts");
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
                    <AlertDialogHeader>Poista yhteystieto</AlertDialogHeader>
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

const ContactView = (props) => {
    const { contact } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [update, updateContact] = useMutation(mutation);
    const { infoMessage, errorMessage } = useMessage();

    const onSubmit = (data) => {
        updateContact({ id: contact.id, contact: data }).then((res) => {
            if (!res.error) {
                onClose();
                infoMessage("Yhteystieto päivitetty");
            } else {
                errorMessage(res.error.message);
            }
        });
    };

    return (
        <React.Fragment>
            <Heading as="h2">{contact.name}</Heading>
            <Flex align="center" mt={2} mb={6}>
                <Text fontSize="xl" color="gray.600">
                    Yhteystieto
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
                <ContactDelete id={contact.id}>
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
                </ContactDelete>
            </Flex>
            <DL>
                <DT>Osoitetiedot</DT>
                <DD whiteSpace="pre">{contact.address}</DD>
            </DL>
            {!contact.address && (
                <Text as="em" color="gray.600">
                    Ei osoitetietoja.
                </Text>
            )}

            {contact.purchaseInvoices.length > 0 ? (
                <React.Fragment>
                    <Divider my={6} />
                    <Heading my={4} as="h3" size="lg">
                        Liittyvät ostolaskut
                    </Heading>
                    <TableContainer mt={8}>
                        <PurchaseInvoiceList
                            disabledColumns={["sender"]}
                            invoices={contact.purchaseInvoices}
                        />
                    </TableContainer>
                </React.Fragment>
            ) : null}

            {contact.salesInvoices.length > 0 ? (
                <React.Fragment>
                    <Divider my={8} />
                    <Heading my={4} as="h3" size="lg">
                        Liittyvät myyntilaskut
                    </Heading>
                    <TableContainer mt={8}>
                        <SalesInvoiceList
                            disabledColumns={["recipient"]}
                            invoices={contact.salesInvoices}
                        />
                    </TableContainer>
                </React.Fragment>
            ) : null}

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                closeOnOverlayClick={false}
                preserveScrollBarGap={true}
            >
                <ModalOverlay />
                <ModalContent rounded="md">
                    <ModalHeader>Muokkaa yhteystietoa</ModalHeader>
                    <ModalBody>
                        <ContactForm
                            isLoading={update.fetching}
                            onSubmit={onSubmit}
                            onClose={onClose}
                            data={contact}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
};

const Contact = (props) => {
    const [result] = useQuery({
        query,
        variables: {
            id: props.match.params.id,
        },
    });

    const { fetching, error, data } = result;

    return (
        <Box maxWidth="800px" margin="auto">
            <Button
                as={RouterLink}
                leftIcon="arrow-back"
                variant="link"
                variantColor="indigo"
                to="/contacts"
                my={4}
            >
                Takaisin
            </Button>
            {fetching ? <Spinner color="indigo.500" display="block" /> : null}
            <ErrorDisplay error={error} />
            {data && !error ? <ContactView contact={data.contact} /> : null}
        </Box>
    );
};

export default Contact;
