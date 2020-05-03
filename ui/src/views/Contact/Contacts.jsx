import React, { useState } from "react";
import {
    Box,
    Heading,
    Button,
    Modal,
    useDisclosure,
    ModalHeader,
    ModalContent,
    ModalBody,
    ModalOverlay,
    useToast,
    Flex,
    Input,
    Link,
    IconButton,
} from "@chakra-ui/core";
import { useQuery, useMutation } from "urql";
import ContactForm from "../../forms/ContactForm";
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
import Pagination from "../../components/Pagination";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";

const limit = 20;

const query = `
    query FetchContacts($offset: Int! = 0, $searchTerm: String) {
        contacts(offset: $offset, limit: ${limit}, searchTerm: $searchTerm){
            nodes {
                id
                name
                address
            }
            totalCount
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
    const [offset, setOffset] = useState(0);
    const [searchTerm, setSearchTerm] = useState();
    const [result, refetch] = useQuery({
        query,
        variables: { offset, searchTerm },
    });
    const { register, handleSubmit } = useForm();
    const [creation, createContact] = useMutation(createMutation);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const handleCreate = (data) => {
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

    const { fetching, error, data } = result;
    const contacts = data ? data.contacts.nodes : [];

    return (
        <Box maxWidth="800px" margin="auto" pt={8}>
            <Heading as="h2">Yhteystiedot</Heading>
            <Flex
                as="form"
                my={6}
                align="center"
                onSubmit={handleSubmit(({ searchTerm }) => {
                    setSearchTerm(searchTerm);
                    setOffset(0);
                })}
            >
                <Button
                    flexShrink={0}
                    mr={4}
                    onClick={onOpen}
                    variantColor="indigo"
                    leftIcon="add"
                    type="button"
                >
                    Luo uusi
                </Button>
                <Input
                    flexShrink={1}
                    placeholder="Hae yhteystietoa..."
                    name="searchTerm"
                    ref={register}
                    mr={4}
                />
                <IconButton icon="search" type="submit" />
            </Flex>
            <ErrorDisplay mb={4} error={error} />
            <TableContainer>
                <Table>
                    <THead>
                        <TR>
                            <TH textAlign="left">Nimi</TH>
                            <TH textAlign="right">Osoite</TH>
                        </TR>
                    </THead>
                    <TBody>
                        {contacts.map((contact) => (
                            <TR key={contact.id}>
                                <TD py={2}>
                                    <Link
                                        as={RouterLink}
                                        to={`/contacts/${contact.id}`}
                                        color="indigo.700"
                                    >
                                        {contact.name}
                                    </Link>
                                </TD>
                                <TD textAlign="right" color="gray.600">
                                    {contact.address.split("\n")[0] || "-"}
                                </TD>
                            </TR>
                        ))}
                    </TBody>
                </Table>
                <Pagination
                    total={data && data.contacts.totalCount}
                    limit={limit}
                    offset={offset}
                    onChange={setOffset}
                    isLoading={fetching}
                />
            </TableContainer>
            <Modal
                isOpen={isOpen}
                closeOnOverlayClick={false}
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent rounded="md">
                    <ModalHeader>Uusi yhteystieto</ModalHeader>
                    <ModalBody>
                        <ContactForm
                            error={creation.error}
                            isSubmitting={creation.fetching}
                            onClose={onClose}
                            onSubmit={handleCreate}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Contacts;
