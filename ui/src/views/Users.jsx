import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
} from '@chakra-ui/core';
import { useQuery } from 'urql';
import ErrorDisplay from '../components/ErrorDisplay';
import { roles } from '../util/metadata';

const query = `
    query {
        users {
            id
            name
            email
            signature
            role
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

const UserCard = ({ id, name, email, role, signature, ...props }) => (
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
                {name}
                {role !== 'basic' ? (
                    <Badge variantColor={roles[role].color} ml={2}>
                        {roles[role].label}
                    </Badge>
                ) : null}
            </Text>
            <Text mt={1} fontSize="sm">
                {email}
                <Problem when={!signature}>Ei allekirjoitusta</Problem>
            </Text>
        </Box>
        <IconButton icon="edit" variant="ghost" variantColor="indigo" />
    </Flex>
);

const Users = (props) => {
    const [result] = useQuery({ query });

    const users = result.data ? result.data.users : [];

    return (
        <Box maxWidth="800px" margin="auto" pt={8}>
            <Heading as="h2">Käyttäjät</Heading>
            <Button
                my={6}
                variantColor="indigo"
                leftIcon="add"
                as={RouterLink}
                to="/users/new"
            >
                Luo uusi
            </Button>
            {result.fetching ? <Spinner color="indigo.500" size="xl" /> : null}
            <ErrorDisplay error={result.error} />
            <Stack spacing={3}>
                {users.map((user) => (
                    <UserCard key={user.id} {...user} />
                ))}
            </Stack>
        </Box>
    );
};

export default Users;
