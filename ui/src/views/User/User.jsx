import React, { useRef } from "react";
import {
    Box,
    Heading,
    Button,
    Spinner,
    Flex,
    Text,
    Badge,
    useDisclosure,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Divider,
} from "@chakra-ui/core";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { useQuery, useMutation } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { roles } from "../../util/metadata";
import { Edit, Trash2 } from "react-feather";
import { DL, DT, DD } from "../../components/DescriptionList";
import { useMessage } from "../../util/message";
import { TableContainer } from "../../components/Table";
import SalesInvoiceList from "../../components/SalesInvoiceList";
import PurchaseInvoiceList from "../../components/PurchaseInvoiceList";
import CostClaimsList from "../../components/CostClaimsList";

const query = `
    query GetUserData($id: ID!) {
        user(id: $id) {
            id
            name
            email
            position
            role
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

const deleteMutation = `
    mutation DeleteUser($id: ID!) {
        deleteUser(id: $id)
    }
`;

const UserDelete = (props) => {
    const { children, id } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const [deletion, deleteUser] = useMutation(deleteMutation);
    const { infoMessage, errorMessage } = useMessage();
    const history = useHistory();

    const handleDelete = () => {
        deleteUser({ id }).then(({ error }) => {
            if (error) {
                errorMessage(error.message);
            } else {
                infoMessage("Käyttäjä poistettu");
                history.push("/users");
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
                    <AlertDialogHeader>Poista käyttäjä</AlertDialogHeader>
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

const UserView = (props) => {
    const { user } = props;

    return (
        <React.Fragment>
            <Heading as="h2">{user.name}</Heading>
            <Flex align="center" mt={2} mb={4}>
                <Text fontSize="xl" color="gray.600">
                    Käyttäjä
                </Text>
                <Box flexGrow={1} />
                <Button
                    flexShrink={0}
                    ml={4}
                    variant="outline"
                    variantColor="indigo"
                    size="sm"
                    as={RouterLink}
                    to={`/users/${user.id}/edit`}
                >
                    <Text display={["none", "inline-block"]} mr={2}>
                        Muokkaa
                    </Text>
                    <Edit size="1em" />
                </Button>
                <UserDelete id={user.id}>
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
                </UserDelete>
            </Flex>
            <DL>
                <DT>Sähköposti</DT>
                <DD>{user.email}</DD>
                <DT>Toimi</DT>
                <DD>{user.position || "-"}</DD>
                <DT>Käyttäjätaso</DT>
                <DD>
                    <Badge variantColor={roles[user.role].color}>
                        {roles[user.role].label}
                    </Badge>
                </DD>
            </DL>

            {user.costClaims.length > 0 ? (
                <React.Fragment>
                    <Divider my={8} />
                    <Heading mb={6} as="h3" size="lg">
                        Liittyvät kulukorvaukset
                    </Heading>
                    <TableContainer>
                        <CostClaimsList
                            disabledColumns={["author"]}
                            claims={user.costClaims}
                        />
                    </TableContainer>
                </React.Fragment>
            ) : null}

            {user.purchaseInvoices.length > 0 ? (
                <React.Fragment>
                    <Divider my={8} />
                    <Heading my={4} as="h3" size="lg">
                        Liittyvät ostolaskut
                    </Heading>
                    <TableContainer mt={8}>
                        <PurchaseInvoiceList invoices={user.purchaseInvoices} />
                    </TableContainer>
                </React.Fragment>
            ) : null}

            {user.salesInvoices.length > 0 ? (
                <React.Fragment>
                    <Divider my={8} />
                    <Heading my={4} as="h3" size="lg">
                        Liittyvät myyntilaskut
                    </Heading>
                    <TableContainer mt={8}>
                        <SalesInvoiceList invoices={user.salesInvoices} />
                    </TableContainer>
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};

const User = (props) => {
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
                to="/users"
                my={4}
            >
                Takaisin
            </Button>
            {fetching ? <Spinner color="indigo.500" display="block" /> : null}
            <ErrorDisplay error={error} />
            {data ? <UserView user={data.user} /> : null}
        </Box>
    );
};

export default User;
