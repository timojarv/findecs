import React, { useState } from "react";
import {
    Box,
    Heading,
    Button,
    Modal,
    useDisclosure,
    Flex,
    Input,
    Link,
    IconButton,
} from "@chakra-ui/core";
import { useQuery } from "urql";
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
import Empty from "../../components/Empty";
import NewContact from "./NewContact";
import { useSortable } from "../../util/hooks";

const limit = 20;

const query = `
    query FetchContacts($offset: Int! = 0, $searchTerm: String, $sortOptions: SortOptions) {
        contacts(offset: $offset, limit: ${limit}, searchTerm: $searchTerm, sortOptions: $sortOptions){
            nodes {
                id
                name
                address
            }
            totalCount
        }
    }
`;

const Contacts = (props) => {
    const [offset, setOffset] = useState(0);
    const [searchTerm, setSearchTerm] = useState();
    const [sortOptions, sortable] = useSortable({ key: 'name', order: 'asc' });
    const [result] = useQuery({
        query,
        variables: { offset, searchTerm, sortOptions },
    });
    const { register, handleSubmit } = useForm();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { fetching, error, data } = result;
    const contacts = data ? data.contacts.nodes : [];

    const handleCreated = (contact) => {
        onClose();
        props.history.push(`/contacts/${contact.id}`);
    };

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
                            <TH {...sortable('name')} textAlign="left">Nimi</TH>
                            <TH {...sortable('address')} textAlign="right">Osoite</TH>
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
                <Empty visible={!contacts.length} />

                <Pagination
                    total={data && data.contacts.totalCount}
                    limit={limit}
                    offset={offset}
                    onChange={setOffset}
                    isLoading={fetching}
                />
            </TableContainer>
            <NewContact
                onCreate={handleCreated}
                onClose={onClose}
                isOpen={isOpen}
            />
        </Box>
    );
};

export default Contacts;
