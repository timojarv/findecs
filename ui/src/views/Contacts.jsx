import React, { useState, useEffect } from "react";
import produce from "immer";
import {
    Box,
    Heading,
    Button,
    Code,
    Modal,
    useDisclosure,
    ModalHeader,
    ModalContent,
    ModalBody,
    ModalOverlay,
    useToast,
    Stack,
    Spinner,
    Text,
    Flex,
    IconButton,
    Collapse,
    Input,
    Link,
} from "@chakra-ui/core";
import { useQuery, useMutation } from "urql";
import ContactForm from "../forms/ContactForm";
import ErrorDisplay from "../components/ErrorDisplay";
import {
    TableContainer,
    Table,
    THead,
    TR,
    TH,
    TBody,
    TD,
} from "../components/Table";

const query = `
    query FetchContacts {
        contacts {
            id
            name
            address
        }
    }
`;

const createMutation = `
    mutation CreateContact($contact: ContactInput!) {
        createContact(contact: $contact) {
            id
            name
            address
        }
    }
`;

const Contacts = (props) => {
    const [result, refetch] = useQuery({ query });
    const [creation, createContact] = useMutation(createMutation);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editing, setEditing] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (!isOpen) setEditing(false);
    }, [isOpen, setEditing]);

    const contacts = (result.data || {}).contacts || [];

    const handleSubmit = (data) => {
        createContact({ contact: data }).then(() => {
            toast({
                status: "success",
                title: "Yhteystieto luotu",
                position: "top",
            });
            refetch();
            onClose();
        });
    };

    const handleEdit = (id) => () => {
        setEditing(id);
        onOpen();
    };

    return (
        <Box maxWidth="800px" margin="auto" pt={8}>
            <Heading as="h2" size="lg">
                Yhteystiedot
            </Heading>
            <Flex my={6} align="center">
                <Button
                    flexShrink={0}
                    mr={4}
                    onClick={onOpen}
                    variantColor="indigo"
                    leftIcon="add"
                >
                    Luo uusi
                </Button>
                <Input flexShrink={1} placeholder="Hae yhteystietoa..." />
            </Flex>
            {result.fetching ? (
                <Spinner color="indigo.500" size="lg" display="block" />
            ) : null}
            <ErrorDisplay mb={4} error={result.error} />
            <TableContainer>
                <Table>
                    <THead>
                        <TR>
                            <TH textAlign="left">Nimi</TH>
                            <TH></TH>
                        </TR>
                    </THead>
                    <TBody>
                        {contacts.map((contact) => (
                            <TR key={contact.id}>
                                <TD>
                                    <Link color="indigo.700">
                                        {contact.name}
                                    </Link>
                                </TD>
                                <TD textAlign="right">
                                    <IconButton
                                        onClick={handleEdit(contact.id)}
                                        mr={4}
                                        variant="ghost"
                                        icon="edit"
                                        variantColor="indigo"
                                    />
                                    <IconButton
                                        variant="ghost"
                                        icon="delete"
                                        variantColor="red"
                                    />
                                </TD>
                            </TR>
                        ))}
                    </TBody>
                </Table>
            </TableContainer>
            <Modal
                isOpen={isOpen}
                closeOnOverlayClick={false}
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent rounded="md">
                    <ModalHeader>
                        {editing ? "Muokkaa yhteystietoa" : "Luo yhteystieto"}
                    </ModalHeader>
                    <ModalBody>
                        <ContactForm
                            data={
                                editing &&
                                contacts.find(
                                    (contact) => contact.id === editing
                                )
                            }
                            error={creation.error}
                            isSubmitting={creation.fetching}
                            onCancel={onClose}
                            onSubmit={handleSubmit}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Contacts;
