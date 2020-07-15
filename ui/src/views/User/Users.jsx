import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Box,
    Heading,
    Spinner,
    Stack,
    Text,
    Badge,
    Button,
    Flex,
    IconButton,
    Link,
} from "@chakra-ui/core";
import { useQuery } from "urql";
import ErrorDisplay from "../../components/ErrorDisplay";
import { roles } from "../../util/metadata";
import { useAccess } from "../../util/hooks";

const query = `
    query {
        users {
            id
            name
            email
            signature
            role
            hasPassword
        }
    }
`;

const Problem = ({ when, children }) =>
    when ? (
        <Text as="span">
            <Text as="span" display="inline-block" color="gray.400" mx={2}>
                &bull;
            </Text>
            {children}
        </Text>
    ) : null;

const UserCard = ({
    id,
    name,
    email,
    role,
    signature,
    hasPassword,
    access,
    ...props
}) => (
    <Flex
        py={2}
        px={4}
        border="1px"
        borderColor="gray.200"
        rounded="md"
        align="center"
        {...props}
    >
        <Box flexGrow={1}>
            <Text as="div" fontWeight="bold">
                <Link as={RouterLink} to={`/users/${id}`}>
                    {name}
                </Link>
                {role !== "basic" ? (
                    <Badge variantColor={roles[role].color} ml={2}>
                        {roles[role].label}
                    </Badge>
                ) : null}
            </Text>
            <Text mt={1} fontSize="sm">
                {email}
                <Problem when={!signature}>Ei allekirjoitusta</Problem>
                <Problem when={!hasPassword}>Ei salasanaa</Problem>
            </Text>
        </Box>
        <IconButton
            as={RouterLink}
            to={`/users/${id}/edit`}
            icon="edit"
            variant="ghost"
            variantColor="indigo"
            display={access("root")}
        />
    </Flex>
);

const Users = (props) => {
    const [result] = useQuery({ query });
    const access = useAccess();

    const users = result.data ? result.data.users : [];

    return (
        <Box maxWidth="800px" margin="auto" pt={8}>
            <Heading mb={6} as="h2">Käyttäjät</Heading>
            <Button
                my={6}
                variantColor="indigo"
                leftIcon="add"
                as={RouterLink}
                to="/users/new"
                display={access("root") || 'inline-flex'}
            >
                Luo uusi
            </Button>
            {result.fetching ? <Spinner color="indigo.500" /> : null}
            <ErrorDisplay error={result.error} />
            <Stack spacing={3}>
                {users.map((user) => (
                    <UserCard key={user.id} {...user} access={access} />
                ))}
            </Stack>
        </Box>
    );
};

export default Users;
